import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createGeminiReviewer } from './gemini-review.js';

const maxDraftLength = 12000;
const maxRequestBytes = 96 * 1024;
const root = new URL('../../', import.meta.url);
const sourceLabels = {
  title: 'Title', anchor: 'Anchor line', 'lower-third': 'On-screen text',
  visual: 'Footage note', voiceover: 'Voiceover',
};

function exampleText(revision) {
  return revision.segments.map(segment => `${sourceLabels[segment.segment_id]}: ${segment.text}`).join('\n\n');
}

function draftSegments(text) {
  return text.split('\n').filter(line => line.trim()).map((line, index) => {
    let field = 'body';
    if (/^\s*title\s*:/i.test(line)) field = 'title';
    if (/^\s*(?:on-screen text|caption|release card)\s*:/i.test(line)) field = 'caption';
    return { segment_id: `line-${index + 1}`, field, text: line };
  });
}

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function readJson(req) {
  if (Number(req.headers['content-length']) > maxRequestBytes) {
    req.resume();
    throw new RequestError(413, 'The draft is too long. Use 12,000 characters or fewer.');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > maxRequestBytes) {
      req.resume();
      throw new RequestError(413, 'The draft is too long. Use 12,000 characters or fewer.');
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new RequestError(400, 'The page could not read the draft.');
  }
}

export async function startWorkbench({ reviewer, outputDir, resume = false, port = 0 }) {
  const [html, script, fixtureText, newsText] = await Promise.all([
    readFile(new URL('workbench.html', import.meta.url)),
    readFile(new URL('workbench.js', import.meta.url)),
    readFile(new URL('ai-review/fixtures/river-video.request.json', root), 'utf8'),
    readFile(new URL('ai-review/fixtures/news-article-profile.json', root), 'utf8'),
  ]);
  const fixture = JSON.parse(fixtureText);
  const news = JSON.parse(newsText);
  const profiles = new Map([
    ['video', { id: 'video', label: 'Video script', policy_pack: fixture.policy_pack, taxonomy: fixture.taxonomy }],
    [news.id, news],
  ]);
  const sessionId = randomUUID();
  const directory = outputDir ?? fileURLToPath(new URL(`ai-review/output/river-live/${sessionId}/`, root));
  const outputPath = join(directory, 'session.json');
  const examples = [exampleText(fixture.baseline_revision), exampleText(fixture.candidate_revision)];
  let state = resume ? JSON.parse(await readFile(outputPath, 'utf8'))
    : { session_id: sessionId, active_story_id: sessionId, drafts: [], runs: [] };
  let reviewing = false;

  if (!resume) {
    await mkdir(directory, { recursive: true });
    await writeFile(outputPath, JSON.stringify(state, null, 2) + '\n', { flag: 'wx' });
  }

  async function save(next) {
    const pendingPath = join(directory, `session-${randomUUID()}.tmp`);
    await writeFile(pendingPath, JSON.stringify(next, null, 2) + '\n', { flag: 'wx' });
    await rename(pendingPath, outputPath);
    state = next;
  }

  function pageState() {
    return { ...state, active_story_id: activeStory(), examples, model: reviewer.model, profiles: [...profiles.values()] };
  }

  function activeStory() {
    return state.active_story_id ?? state.session_id;
  }

  async function startStory(input) {
    if (reviewing) throw new RequestError(409, 'Wait for the current review to finish.');
    if (input?.expected_story_id !== activeStory()) throw new RequestError(409, 'Another tab started a story. Reload this page.');
    reviewing = true;
    try {
      await save({ ...state, active_story_id: randomUUID() });
    } finally {
      reviewing = false;
    }
  }

  async function reviewDraft(input) {
    if (reviewing) throw new RequestError(409, 'A review is already running. Wait for its result.');
    if (typeof input?.text !== 'string' || !input.text.trim() || input.text.length > maxDraftLength) {
      throw new RequestError(400, 'Enter a draft of 1 to 12,000 characters.');
    }
    const profile = profiles.get(input.profile_id);
    if (!profile) throw new RequestError(400, 'Choose a review checklist.');
    const storyId = activeStory();
    const storyDrafts = state.drafts.filter(item => (item.story_id ?? state.session_id) === storyId);
    const latest = storyDrafts.at(-1);
    if (input.expected_story_id !== storyId || (input.expected_revision_id ?? null) !== (latest?.revision_id ?? null)) {
      throw new RequestError(409, 'A new version was saved in another tab. Review the updated history first.');
    }
    reviewing = true;
    try {
      const text = input.text.replace(/\r\n?/g, '\n');
      const changed = !latest || text !== latest.text;
      const version = changed ? storyDrafts.length + 1 : latest.version;
      const draft = changed ? {
        story_id: storyId, version, revision_id: `rev-${String(version).padStart(3, '0')}`,
        text, saved_at: new Date().toISOString(), segments: draftSegments(text),
      } : latest;
      const baseline = changed ? latest : storyDrafts.at(-2);
      const snapshot = draft => draft ? { revision_id: draft.revision_id, segments: draft.segments } : null;
      const runId = randomUUID();
      const reviewRequest = {
        schema_version: fixture.schema_version,
        request_id: runId,
        content_id: storyId,
        language: fixture.language,
        baseline_revision: snapshot(baseline),
        candidate_revision: snapshot(draft),
        policy_pack: profile.policy_pack,
        taxonomy: profile.taxonomy,
        current_metadata: fixture.current_metadata,
      };
      const run = { id: runId, story_id: storyId, profile_id: profile.id, state: 'running', version, baseline: baseline?.version ?? null, request: reviewRequest };
      await save({
        ...state,
        drafts: changed ? [...state.drafts, draft] : state.drafts,
        runs: [...state.runs, run],
      });

      let result;
      try {
        result = await reviewer.review(reviewRequest);
      } catch {
        result = { validation: { passed: false, message: 'The review could not finish. Try Review again.' } };
      }
      const finished = { ...run, state: result.validation.passed ? 'complete' : 'failed', result };
      await save({ ...state, runs: state.runs.map(item => item.id === runId ? finished : item) });
    } finally {
      reviewing = false;
    }
  }

  const server = createServer(async (req, res) => {
    function send(status, content, type) {
      res.writeHead(status, {
        'Content-Type': type,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'",
      });
      res.end(content);
    }
    const json = (status, value) => send(status, JSON.stringify(value), 'application/json; charset=utf-8');
    try {
      const host = `127.0.0.1:${server.address().port}`;
      if (req.headers.host !== host) return json(403, { error: 'Open the page at its local address.' });
      if (req.method === 'GET' && req.url === '/') return send(200, html, 'text/html; charset=utf-8');
      if (req.method === 'GET' && req.url === '/workbench.js') return send(200, script, 'text/javascript; charset=utf-8');
      if (req.method === 'GET' && req.url === '/api/state') return json(200, pageState());
      if (req.method === 'POST' && ['/api/review', '/api/new-story'].includes(req.url)) {
        if (req.headers.origin !== `http://${host}` || !/^application\/json(?:;|$)/i.test(req.headers['content-type'] ?? '')) {
          return json(403, { error: 'Start reviews from the local page.' });
        }
        const input = await readJson(req);
        if (req.url === '/api/review') await reviewDraft(input);
        else await startStory(input);
        return json(200, pageState());
      }
      return json(404, { error: 'Page not found.' });
    } catch (error) {
      if (error instanceof RequestError) return json(error.status, { error: error.message });
      console.error('The local review page could not finish saving a request.');
      return json(500, { error: 'The review could not be saved. Check the saved drafts before trying again.' });
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  if (state.runs.some(run => run.state === 'running')) {
    const runs = state.runs.map(run => run.state !== 'running' ? run : {
      ...run, state: 'failed', result: { validation: { passed: false, message: 'The local page closed before this review finished.' } },
    });
    try { await save({ ...state, runs }); }
    catch (error) { server.close(); throw error; }
  }
  return { server, url: `http://127.0.0.1:${server.address().port}/`, outputPath };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    session: { type: 'string' }, port: { type: 'string' },
  } });
  const port = Number(values.port ?? 0);
  if (positionals.length > 1 || !Number.isInteger(port) || port < 0 || port > 65535 ||
      (values.session !== undefined && !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(values.session))) {
    throw new Error('Use a saved session ID and a valid local port.');
  }
  const reviewer = await createGeminiReviewer(positionals[0] || 'gemini-3.1-flash-lite');
  const outputDir = values.session ? fileURLToPath(new URL(`ai-review/output/river-live/${values.session}/`, root)) : undefined;
  const app = await startWorkbench({ reviewer, outputDir, resume: Boolean(outputDir), port });
  console.log('Review page ' + app.url);
  console.log('Saved session ' + app.outputPath);
}
