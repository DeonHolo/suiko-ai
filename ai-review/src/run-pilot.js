import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGeminiReviewer } from './gemini-review.js';

const root = new URL('../../', import.meta.url);
const files = new Map([
  ['library', 'contracts/ai-review.request.example.json'],
  ['river-first-draft', 'ai-review/fixtures/river-video.request.json'],
  ['river-video', 'ai-review/fixtures/river-video.request.json'],
  ['sponsored-caption', 'ai-review/fixtures/sponsored-caption.request.json'],
]);
const models = new Set(['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']);
const [caseId, modelOverride, ...extraArgs] = process.argv.slice(2);
const requestPath = files.get(caseId);
if (!requestPath || extraArgs.length || (modelOverride && !models.has(modelOverride))) {
  console.error('Usage: node ai-review/src/run-pilot.js <library|river-first-draft|river-video|sponsored-caption> [gemini-3.5-flash-lite|gemini-3.1-flash-lite]');
  process.exit(2);
}

const requestText = await readFile(new URL(requestPath, root), 'utf8');
const fixture = JSON.parse(requestText);
const request = caseId === 'river-first-draft'
  ? {
      ...fixture,
      request_id: `${fixture.request_id}-first-draft`,
      baseline_revision: null,
      candidate_revision: fixture.baseline_revision,
    }
  : fixture;
const syntheticApproval = caseId === 'library' ? 'synthetic-policy-approval-001' : 'synthetic-media-pilot';
if (request.policy_pack?.approval_reference !== syntheticApproval) {
  throw new Error('This runner accepts the supplied fictional test cases only.');
}

const { model, review } = await createGeminiReviewer(modelOverride);
const record = { run: 'local Gemini pilot', case_id: caseId, ...await review(request) };
record.request.file = requestPath;
record.request.sha256 = createHash('sha256').update(requestText).digest('hex');

const outputDir = new URL('ai-review/output/', root);
const output = new URL(`${caseId}-${model}-${randomUUID().slice(0, 8)}.json`, outputDir);
await mkdir(outputDir, { recursive: true });
await writeFile(output, JSON.stringify(record, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
console.log('Saved ' + relative(fileURLToPath(root), fileURLToPath(output)).split(sep).join('/'));
console.log(JSON.stringify(record, null, 2));
process.exitCode = record.validation.passed ? 0 : 1;
