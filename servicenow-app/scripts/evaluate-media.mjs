import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import { storySnapshot } from '../../ai-review/src/story-input.js';
import { reviewWorkbench } from '../../ai-review/src/workbench-review.js';
import { literalChanges } from '../../ai-review/src/revision-diff.js';
import { buildDecisionRequest, decisionResults } from '../../ai-review/src/decision-review.js';
import { evaluationFailed, readProviderReply } from '../../ai-review/src/evaluation-results.js';
import * as validators from '../src/server/generated/validators.js';
import reviewData from '../src/server/generated/review-data.js';

const model = process.argv[2] || 'gemini-3.5-flash-lite';
if (!['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].includes(model)) throw new Error('Choose a supported Flash-Lite model.');
const pack = JSON.parse(await readFile(new URL('../../ai-review/fixtures/owner-media-pack.json', import.meta.url), 'utf8'));
const selectedIds = process.argv.find(value => value.startsWith('--cases='))?.slice('--cases='.length).split(',');
if (selectedIds?.some(id => !pack.cases.some(item => item.id === id))) throw new Error('Choose case IDs from owner-media-pack.json.');
const directory = new URL('../../ai-review/output/media-' + Date.now() + '/', import.meta.url);
await mkdir(directory, { recursive: true });
const entries = pack.cases.filter(item => !selectedIds || selectedIds.includes(item.id)).map(item => ({ ...item, input: {
  schema_version: '0.5.0', capabilities: { source_reading: true, rights_verification: false },
  request_id: 'media-' + item.id, content_id: 'media-' + item.id, language: 'en',
  baseline_revision: storySnapshot(item.baseline), candidate_revision: storySnapshot(item.draft),
  policy_pack: { pack_id: 'isolated-media-evaluation', version: '1', approval_reference: 'Fictional evaluation; no live approval changed', rules: pack.rules },
  taxonomy: pack.taxonomy, current_metadata: { section_id: null, tag_ids: [], short_description: '' },
  source_rule_ids: item.draft.content_format === 'article' ? pack.source_rule_ids : [],
  source_material: item.draft.content_format === 'article' ? pack.sources : [],
} }));
// Persist the full inputs and rubric before contacting either model.
await writeFile(new URL('expected.json', directory), JSON.stringify({ written_at: new Date().toISOString(), model,
  prompt_version: reviewData.promptVersion, prompt_sha256: createHash('sha256').update(reviewData.prompt).digest('hex'),
  source_provenance: pack.source_provenance, rubric_note: pack.rubric_note, entries }, null, 2));
console.log('Expectations saved to ' + directory.pathname);
if (process.argv.includes('--dry-run')) process.exit(0);
const env = parseEnv(await readFile(new URL('../../ai-review/.env.local', import.meta.url), 'utf8'));
const key = env.GEMINI_API_KEY?.trim();
if (!key) throw new Error('Configure the existing local Gemini key before running the live evaluation.');
async function request(path, body) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/' + path, {
    method: 'POST', headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    redirect: 'error', signal: AbortSignal.timeout(45000), body: JSON.stringify(body),
  });
  return readProviderReply(response);
}
const results = [];
for (const item of entries) {
  const started = Date.now();
  const record = { id: item.id, model, expected: item.expected, selection: item.selection };
  try {
    record.checked = await reviewWorkbench(item.input, { generate: async snapshot => {
      const reply = await request('models/' + model + ':generateContent', {
        systemInstruction: { parts: [{ text: reviewData.prompt }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ ...snapshot, literal_edits: literalChanges(snapshot.baseline_revision, snapshot.candidate_revision) }) }] }],
        generationConfig: { maxOutputTokens: 8192, thinkingConfig: { thinkingLevel: 'MINIMAL' }, responseMimeType: 'application/json', responseJsonSchema: reviewData.providerSchema },
      });
      record.provider = reply;
      if (reply.http !== 200) throw new Error('Provider HTTP ' + reply.http);
      if (reply.decode_error) throw new Error(reply.decode_error);
      const candidate = reply.payload.candidates?.[0];
      if (candidate?.finishReason !== 'STOP') throw new Error('Provider reply did not finish.');
      const raw = candidate.content.parts.filter(part => !part.thought).map(part => part.text || '').join('');
      record.raw = JSON.parse(raw);
      return raw;
    } }, validators);
    record.comparisons = Object.entries(item.expected).map(([rule, expected]) => {
      const actual = record.checked.assessment.policy_assessments.find(result => result.rule_id === rule)?.status;
      return { rule, expected, actual, match: (Array.isArray(expected) ? expected : [expected]).includes(actual) };
    });
    record.claim_comparisons = (item.expected_claims || []).map(expected => ({ ...expected,
      matches: record.checked.claim_checks.filter(claim => claim.claim.quote.includes(expected.includes)).map(claim => ({ status: claim.status, match: claim.status === expected.status })),
    }));
    if (process.argv.includes('--decision')) {
      const prepared = buildDecisionRequest(item.input, record.checked.claim_checks);
      if (prepared) {
        const reply = await request('decisions', prepared.request);
        const answers = decisionResults(prepared.request, reply.payload);
        record.decision = { ...reply, request: prepared.request, answers,
          coverage_complete: !prepared.skippedClaimIds.length && Object.keys(answers).length === Object.keys(prepared.request.questions).length,
          comparisons: Object.keys(prepared.request.questions).map(id => {
            const claim = record.checked.claim_checks.find(claim => claim.id === id);
            const expected = (item.expected_claims || []).find(expected => claim.claim.quote.includes(expected.includes))?.status;
            return { id, quote: claim.claim.quote, expected, actual: answers[id]?.status,
              match: !!answers[id] && (!expected || answers[id].status === expected) };
          }),
        };
      }
    }
  } catch (error) { record.failure = error.message; }
  record.elapsed_ms = Date.now() - started;
  await writeFile(new URL(item.id + '.json', directory), JSON.stringify(record, (name, value) => typeof value === 'string' ? value.replaceAll(key, '[redacted]') : value, 2));
  const summary = { id: record.id, comparisons: record.comparisons, claims: record.claim_comparisons,
    issues: record.checked?.checks.issues.map(issue => issue.code), failure: record.failure,
    decision: record.decision && { http: record.decision.http, coverage_complete: record.decision.coverage_complete, comparisons: record.decision.comparisons }, elapsed_ms: record.elapsed_ms };
  results.push(summary);
  console.log(JSON.stringify(summary));
}
await writeFile(new URL('summary.json', directory), JSON.stringify(results, null, 2));
if (results.some(evaluationFailed)) process.exitCode = 1;
