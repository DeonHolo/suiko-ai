import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import { parseProviderJson } from '../../ai-review/src/provider-json.js';
import { checkWorkbenchResult } from '../../ai-review/src/workbench-review.js';
import { storySnapshot } from '../../ai-review/src/story-input.js';
import { literalChanges } from '../../ai-review/src/revision-diff.js';
import { readProviderReply } from '../../ai-review/src/evaluation-results.js';
import * as validators from '../src/server/generated/validators.js';
import candidate from '../src/server/generated/review-data.js';

const read = async path => JSON.parse(await readFile(path, 'utf8'));
const fixture = name => new URL('../../ai-review/fixtures/' + name + '.json', import.meta.url);
const model = 'gemini-3.5-flash-lite';
const repetitions = Number(process.argv.find(arg => arg.startsWith('--repetitions='))?.slice('--repetitions='.length) ?? 3);
assert.ok(Number.isInteger(repetitions) && repetitions >= 1 && repetitions <= 3, 'Choose one to three repetitions.');
const baselineFile = process.argv[2];
if (!baselineFile || baselineFile.startsWith('--')) throw Error('Supply the baseline generated review-data JSON file.');
const baseline = await read(baselineFile);
assert.equal(typeof baseline.prompt, 'string');
assert.notEqual(candidate.prompt, baseline.prompt, 'Use two distinct prompts.');
const arms = { baseline, candidate };
const candidateOnly = process.argv.includes('--candidate-only');
const generationConfig = { responseMimeType: 'application/json',
  maxOutputTokens: 8192, thinkingConfig: { thinkingLevel: 'MINIMAL' } };
const orchard = await read(fixture('source-scope-orchard'));
const cases = await read(fixture('source-scope-cases'));
const selectedId = process.argv.find(arg => arg.startsWith('--case='))?.slice('--case='.length);
const selected = selectedId === undefined ? cases : cases.filter(item => item.id === selectedId);
assert.ok(selected.length, 'Choose a case ID from source-scope-cases.json.');
function inputFor(item) {
  if (item.id === '01') return orchard;
  const sources = item.sources.map(([host, text], i) => ({
    source_id: 'source-' + (i + 1), url: 'https://' + host + '/records', status: 'read',
    passages: [{ passage_id: 'passage-1', text }],
  }));
  const draft = storySnapshot({ title: item.title, text: item.body, version: 1, content_kind: 'news',
    content_format: 'article', source_urls: sources.map(source => source.url) });
  return { ...orchard, request_id: 'study-' + item.id, content_id: 'study-' + item.id,
    candidate_revision: draft, source_material: sources };
}
const root = fileURLToPath(new URL('../../ai-review/output/', import.meta.url));
await mkdir(root, { recursive: true });
const directory = await mkdtemp(join(root, 'source-scope-'));
const save = (name, value) => writeFile(join(directory, name + '.json'), JSON.stringify(value, null, 2), { flag: 'wx' });
const sha = value => createHash('sha256').update(value).digest('hex');
const entries = selected.map(item => {
  const input = inputFor(item);
  const wire = { ...input, literal_edits: literalChanges(input.baseline_revision, input.candidate_revision) };
  return { item, input, wire, input_sha256: sha(JSON.stringify(wire)) };
});
const schedule = [];
for (let round = 1; round <= repetitions; round++) {
  for (const [i, entry] of entries.entries()) {
    const order = (round + i) % 2 ? ['baseline', 'candidate'] : ['candidate', 'baseline'];
    for (const arm of order) if (!candidateOnly || arm === 'candidate') schedule.push({ id: entry.item.id, round, arm });
  }
}
await save('expected', { written_at: new Date().toISOString(), model, generationConfig, repetitions,
  acceptance: 'Every scheduled candidate target must match, including the cited source and value for support and conflict. Missing or duplicate target claims require review. Record raw and checked labels and report other diagnostics separately. Retry only a temporary provider failure once. No model substitution.',
  installed_check: 'Review the saved Orchard Screen version in ServiceNow. Expect Needs confirmation for 40 seats, an accessible Halyard passage and no second check.',
  provenance: '01 replays the original fictional installed review. All other cases use fictional passages supplied directly, with no production notes or live URL retrieval. Cases 07 and 08 were first used for the subject check. Cases 09 and 10 were first used for the per-passage judgment check.',
  arms: Object.fromEntries(Object.entries(arms).map(([name, data]) => [name, { version: data.promptVersion, prompt: data.prompt, sha256: sha(data.prompt), providerSchema: data.providerSchema }])),
  entries, schedule });
console.log('Frozen expectations: ' + directory);
if (process.argv.includes('--dry-run')) process.exit(0);
const env = parseEnv(await readFile(new URL('../../ai-review/.env.local', import.meta.url), 'utf8'));
const key = env.GEMINI_API_KEY?.trim();
if (!key) throw Error('Configure the local Gemini API key.');
const hasNumber = (text, value) => typeof text === 'string' && (text.match(/\d+/g) || []).includes(value);
function target(claims, entry) {
  if (!Array.isArray(claims)) return [];
  return claims.filter(claim => entry.input.source_rule_ids.includes(claim?.rule_id)
    && claim.claim?.segment_id === entry.item.segment && hasNumber(claim.claim.quote, entry.item.quantity));
}
function matches(claims, item) {
  if (claims.length !== 1 || claims[0].status !== item.expected) return false;
  if (!item.source) return true;
  const refs = claims[0].sources || [];
  return refs.length > 0 && refs.every(ref => ref.source_id === item.source && ref.passage_id === 'passage-1')
    && refs.some(ref => hasNumber(ref.quote, item.sourceQuantity));
}
async function trial(entry, job) {
  const prefix = [job.round, job.id, job.arm].join('-');
  const config = arms[job.arm];
  const required = config.providerSchema.properties.claim_checks.items.properties.sources.items.required;
  const attempts = [];
  let rawClaims = [], checkedClaims = [], issues = [], failure;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const record = { started_at: new Date().toISOString() };
    let retry = false;
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        signal: AbortSignal.timeout(45000), redirect: 'error', body: JSON.stringify({
          systemInstruction: { parts: [{ text: config.prompt }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify(entry.wire) }] }],
          generationConfig: { ...generationConfig, responseJsonSchema: config.providerSchema },
        }),
      });
      retry = [429, 502, 503, 504].includes(response.status);
      record.http = response.status;
      record.reply = await readProviderReply(response);
      if (!response.ok) throw Error('Provider HTTP ' + response.status);
      const result = record.reply.payload?.candidates?.[0];
      if (result?.finishReason !== 'STOP') throw Error('Provider did not finish.');
      const raw = parseProviderJson(result.content.parts.filter(part => !part.thought).map(part => part.text || '').join(''));
      rawClaims = target(raw.claim_checks, entry);
      record.checked = checkWorkbenchResult(entry.input, raw, validators, { requireOverviewEvidence: true,
        requireSourceScope: required.includes('subject_scope'), requireSourceStance: required.includes('stance'), revisionDiff: entry.wire.literal_edits });
      checkedClaims = target(record.checked.claim_checks, entry);
      issues = record.checked.checks.issues.map(issue => issue.code);
      failure = undefined;
    } catch (error) {
      failure = error.message.replaceAll(key, '[redacted]');
      record.failure = failure;
      retry ||= error.name === 'TimeoutError';
    }
    record.finished_at = new Date().toISOString();
    attempts.push({ http: record.http, model: record.reply?.payload?.modelVersion, failure: record.failure });
    await save(prefix + '-' + attempt, record);
    if (!failure || !retry || attempt === 2) break;
    await delay(4000);
  }
  const result = { ...job, attempts, rawClaims, checkedClaims, issues, failure,
    match: !failure && rawClaims.length === 1 && matches(checkedClaims, entry.item) };
  console.log(prefix + ' ' + (failure || checkedClaims.map(claim => claim.status).join(',') || 'missing') + ' ' + (result.match ? 'PASS' : 'CHECK'));
  return result;
}
// Each pair uses the same input, and the first prompt alternates across cases and rounds.
const results = [];
for (const job of schedule) results.push(await trial(entries.find(entry => entry.item.id === job.id), job));
await save('actual', results);
if (results.some(row => row.arm === 'candidate' && !row.match)) process.exitCode = 1;
