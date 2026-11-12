import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { workbenchSchemas } from '../src/workbench-contract.js';
import { persistReviewAttempt } from '../src/review-attempt.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validators = Object.fromEntries(Object.entries(workbenchSchemas(read('../../contracts/ai-assessment.schema.json')))
  .map(([name, schema]) => [name, ajv.compile(schema)]));
validators.validateRequest = ajv.compile(read('../../contracts/ai-review.request.schema.json'));

function sample() {
  const input = read('../../contracts/ai-review.request.example.json');
  const assessment = read('../../contracts/ai-review.response.example.json').assessment;
  const title = input.candidate_revision.segments[0];
  const reply = {
    overview: 'This draft announces a community library opening.',
    overview_evidence: [{ revision_id: input.candidate_revision.revision_id, segment_id: title.segment_id, quote: title.text }],
    assessment,
    findings: assessment.policy_assessments.filter(rule => rule.status === 'potential_conflict').map(rule => ({
      rule_id: rule.rule_id, summary: rule.reason, action: rule.suggested_action, evidence: structuredClone(rule.evidence),
    })),
  };
  const values = { state: 'running', active_revision: input.candidate_revision.revision_id };
  let writes = 0;
  const row = { setValue: (name, value) => { values[name] = value; }, update: () => { writes++; return 'saved-review-id'; } };
  return { input, reply, values, row, writes: () => writes };
}

test('the attempt saves a partial checked result and releases the revision lock', () => {
  const { input, reply, values, row, writes } = sample();
  reply.assessment.policy_assessments[1].evidence = [];
  persistReviewAttempt(row, input, () => JSON.stringify(reply), validators);
  const saved = JSON.parse(values.response_json);
  assert.equal(values.state, 'complete');
  assert.equal(saved.assessment.status, 'partial');
  assert.equal(saved.assessment.policy_assessments[1].status, 'not_assessable');
  assert.equal(saved.checks.overview_available, true);
  assert.equal(values.active_revision, '');
  assert.equal(writes(), 1);
});

test('a checklist mismatch saves the unchecked reply and named failure', () => {
  const { input, reply, values, row } = sample();
  reply.assessment.policy_assessments.pop();
  persistReviewAttempt(row, input, () => JSON.stringify(reply), validators);
  assert.equal(values.state, 'failed');
  assert.equal(JSON.parse(values.error_json).code, 'CHECKLIST_MISMATCH');
  assert.deepEqual(JSON.parse(values.response_json), reply);
  assert.equal(values.active_revision, '');
});

test('unreadable JSON remains a saved failed attempt, with an inspectable excerpt', () => {
  const { input, values, row } = sample();
  persistReviewAttempt(row, input, () => '{"overview":', validators);
  assert.equal(values.state, 'failed');
  assert.equal(JSON.parse(values.error_json).code, 'INVALID_PROVIDER_JSON');
  assert.equal(JSON.parse(values.response_json).unparsed_text, '{"overview":');
  assert.equal(values.active_revision, '');
});

test('new attempts with no overview references withhold the overview while retaining checked findings', () => {
  const { input, reply, values, row } = sample();
  delete reply.overview_evidence;
  persistReviewAttempt(row, input, () => JSON.stringify(reply), validators);
  const saved = JSON.parse(values.response_json);
  assert.equal(values.state, 'complete');
  assert.equal(saved.checks.overview_available, false);
  assert.deepEqual(saved.findings, reply.findings);
});

test('provider failures release the lock and do not expose arbitrary exception details', () => {
  const { input, values, row } = sample();
  persistReviewAttempt(row, input, () => { throw new Error('Sensitive transport internals'); }, validators);
  assert.equal(values.state, 'failed');
  assert.equal(values.active_revision, '');
  assert.ok(!values.error_json.includes('Sensitive'));
});

test('a checked result exceeding the storage limit stays failed with its original reply', () => {
  const { input, reply, values, row } = sample();
  input.candidate_revision.segments.find(segment => segment.segment_id === 'p2').text = 'A'.repeat(1600);
  reply.findings = Array.from({ length: 24 }, () => ({
    ...reply.findings[0], evidence: Array.from({ length: 6 }, () => ({ revision_id: 'rev-002', segment_id: 'p2', quote: 'Invented.' })),
  }));
  persistReviewAttempt(row, input, () => JSON.stringify(reply), validators);
  assert.equal(values.state, 'failed');
  assert.equal(JSON.parse(values.error_json).code, 'SAVED_RESULT_LIMIT');
  assert.deepEqual(JSON.parse(values.response_json), reply);
  assert.equal(values.active_revision, '');
});

test('a failed database update cannot be returned as a saved review', () => {
  const { input, reply, row } = sample();
  row.update = () => null;
  assert.throws(() => persistReviewAttempt(row, input, () => JSON.stringify(reply), validators), { code: 'REVIEW_SAVE_FAILED' });
});
