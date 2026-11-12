import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { workbenchSchemas } from '../src/workbench-contract.js';
import { reviewWorkbench } from '../src/workbench-review.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validators = Object.fromEntries(Object.entries(workbenchSchemas(read('../../contracts/ai-assessment.schema.json')))
  .map(([name, schema]) => [name, ajv.compile(schema)]));
validators.validateRequest = ajv.compile(read('../../contracts/ai-review.request.schema.json'));

function sample() {
  const request = read('../../contracts/ai-review.request.example.json');
  request.schema_version = '0.4.0';
  request.capabilities = { source_reading: false, rights_verification: false };
  Object.assign(request.candidate_revision, { content_format: 'article', content_kind: 'news', source_urls: [] });
  for (const rule of request.policy_pack.rules) rule.applicability = {
    formats: ['article', 'script', 'caption'], content_kinds: ['news', 'opinion', 'sponsored'], conditions: '', human_checks: [],
  };
  const assessment = read('../../contracts/ai-review.response.example.json').assessment;
  const result = {
    overview: 'A library opening is being prepared.',
    overview_evidence: [{ revision_id: 'rev-002', segment_id: 'title', quote: request.candidate_revision.segments[0].text }],
    assessment, findings: assessment.policy_assessments.filter(rule => rule.status === 'potential_conflict').map(rule => ({
      rule_id: rule.rule_id, summary: rule.reason, action: rule.suggested_action, evidence: rule.evidence,
    })),
  };
  return { request, result };
}

test('the approved-rule contract preserves typed scope and available capabilities', async () => {
  const { request, result } = sample();
  let received;
  const checked = await reviewWorkbench(request, { generate: async input => { received = input; return JSON.stringify(result); } }, validators);
  assert.deepEqual(received.policy_pack.rules[0].applicability, request.policy_pack.rules[0].applicability);
  assert.equal(received.capabilities.source_reading, false);
  assert.equal(checked.assessment.status, 'reviewed');
});

test('a finding outside the editor-approved format and kind cannot override that scope', async () => {
  const { request, result } = sample();
  request.policy_pack.rules[1].applicability.formats = ['script'];
  const outside = { ...structuredClone(result.findings[0]), rule_id: request.policy_pack.rules[1].rule_id };
  result.findings.push(outside);
  result.assessment.policy_assessments[1].status = 'potential_conflict';
  const checked = await reviewWorkbench(request, { generate: async () => JSON.stringify(result) }, validators);
  assert.equal(checked.assessment.policy_assessments[1].status, 'not_applicable');
  assert.match(checked.assessment.policy_assessments[1].reason, /article \/ news/);
  assert.equal(checked.findings.length, 1);
  assert.equal(checked.findings[0].rule_id, request.policy_pack.rules[0].rule_id);
  assert.equal(checked.checks.overview_available, true);
});

test('new approved-rule requests require scope and do not alter the older protocols', async () => {
  for (const alter of [
    input => { delete input.capabilities; },
    input => { delete input.policy_pack.rules[0].applicability; },
    input => { input.schema_version = '0.3.0'; },
  ]) {
    const { request } = sample();
    alter(request);
    await assert.rejects(reviewWorkbench(request, { generate: async () => { throw new Error('Provider must not run.'); } }, validators), { code: 'INVALID_REQUEST' });
  }
});
