import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { reviewArticle } from '../src/review.js';

const requestExample = JSON.parse(readFileSync(new URL('../../contracts/ai-review.request.example.json', import.meta.url), 'utf8'));
const assessmentExample = JSON.parse(readFileSync(new URL('../../contracts/ai-review.response.example.json', import.meta.url), 'utf8')).assessment;

function sample() {
  return { request: structuredClone(requestExample), assessment: structuredClone(assessmentExample) };
}

function providerReturning(assessment) {
  return { generate: async () => JSON.stringify(assessment) };
}

test('a grounded advisory review is available through the public interface', async () => {
  const { request, assessment } = sample();
  const result = await reviewArticle(request, providerReturning(assessment));

  assert.equal(result.policy_assessments[0].rule_id, 'ATTR-001');
  assert.equal(result.policy_assessments[0].status, 'potential_conflict');
  assert.equal(result.policy_assessments[0].evidence[0].quote, 'More than 500 residents are expected to attend.');
});

test('a provider cannot add a publishing approval field to the assessment', async () => {
  const { request, assessment } = sample();
  assessment.approval = 'approved';

  await assert.rejects(reviewArticle(request, providerReturning(assessment)), { code: 'INVALID_ASSESSMENT' });
});

test('a finding with an invented article quotation is rejected', async () => {
  const { request, assessment } = sample();
  assessment.policy_assessments[0].evidence[0].quote = 'The mayor confirmed 900 guests would attend.';

  await assert.rejects(reviewArticle(request, providerReturning(assessment)), { code: 'INVALID_EVIDENCE' });
});

test('a review cannot omit, invent, or duplicate checklist rule identities', async () => {
  for (const change of [
    result => result.policy_assessments.pop(),
    result => { result.policy_assessments[0].rule_id = 'INVENTED-001'; },
    result => { result.policy_assessments[1].rule_id = 'ATTR-001'; },
  ]) {
    const { request, assessment } = sample();
    change(assessment);
    await assert.rejects(reviewArticle(request, providerReturning(assessment)), { code: 'CHECKLIST_MISMATCH' });
  }
});

test('malformed or ambiguous provider JSON cannot become a successful assessment', async () => {
  const { request, assessment } = sample();
  const valid = JSON.stringify(assessment);
  const duplicateStatus = valid.replace('"status":"reviewed"', '"status":"partial","status":"reviewed"');
  const duplicateRuleKey = valid.replace('"rule_id":"ATTR-001"', '"rule_id":"INVENTED-001","rule_id":"ATTR-001"');
  for (const raw of ['{"status":', duplicateStatus, duplicateRuleKey, `/* comment */${valid}`, `${valid.slice(0, -1)},}`, `${' '.repeat(262145)}${valid}`]) {
    await assert.rejects(reviewArticle(request, { generate: async () => raw }), { code: 'INVALID_PROVIDER_JSON' });
  }
});

test('invalid or ambiguous inputs are rejected before requesting any provider work', async () => {
  for (const change of [
    input => { input.schema_version = '99.0.0'; },
    input => { input.policy_pack.rules = null; },
    input => { input.policy_pack.rules[1].rule_id = 'ATTR-001'; },
    input => { input.candidate_revision.segments[1].segment_id = 'title'; },
    input => { input.candidate_revision.segments[1].text = 'x'.repeat(12001); },
    input => { input.unrecognized_field = true; },
  ]) {
    const { request } = sample();
    change(request);
    await assert.rejects(reviewArticle(request, { generate: async () => { throw new Error('Provider must not run.'); } }),
      { code: 'INVALID_REQUEST' });
  }
});

test('existing quotations from the wrong revision cannot support current findings or changes', async () => {
  for (const change of [
    result => { result.policy_assessments[0].evidence = [{ revision_id: 'rev-001', segment_id: 'p3', quote: 'Admission is free.' }]; },
    result => { result.metadata_suggestions.section.evidence = [{ revision_id: 'rev-001', segment_id: 'p3', quote: 'Admission is free.' }]; },
    result => { result.changes[0].before = structuredClone(result.changes[0].after); },
  ]) {
    const { request, assessment } = sample();
    change(assessment);
    await assert.rejects(reviewArticle(request, providerReturning(assessment)), { code: 'INVALID_EVIDENCE' });
  }
});

test('edits made while provider work is pending cannot change the frozen review source', async () => {
  const { request, assessment } = sample();
  const invented = 'A fabricated statement added after review started.';
  assessment.policy_assessments[0].evidence[0].quote = invented;
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const review = reviewArticle(request, { generate: async () => pending });
  request.candidate_revision.segments[2].text += ` ${invented}`;
  release(JSON.stringify(assessment));

  await assert.rejects(review, { code: 'INVALID_EVIDENCE' });
});

test('metadata suggestions cannot invent section or tag identities', async () => {
  for (const change of [
    result => { result.metadata_suggestions.section.suggested_id = 'invented-section'; },
    result => { result.metadata_suggestions.tags.suggested_ids.push('invented-tag'); },
  ]) {
    const { request, assessment } = sample();
    change(assessment);
    await assert.rejects(reviewArticle(request, providerReturning(assessment)), { code: 'INVALID_METADATA' });
  }
});

test('asserted concerns and populated metadata need supporting candidate evidence', async () => {
  for (const change of [
    result => { result.policy_assessments[0].evidence = []; },
    result => { result.metadata_suggestions.section.evidence = []; },
    result => { result.metadata_suggestions.tags.evidence = []; },
  ]) {
    const { request, assessment } = sample();
    change(assessment);
    await assert.rejects(reviewArticle(request, providerReturning(assessment)), { code: 'INVALID_EVIDENCE' });
  }
});

test('change packets need unique IDs and the evidence sides required by their kind', async () => {
  for (const change of [
    ({ assessment }) => { assessment.changes[0].before = []; },
    ({ assessment }) => { assessment.changes[1].change_id = assessment.changes[0].change_id; },
    ({ request, assessment }) => { request.baseline_revision = null; assessment.changes[0].kind = 'added'; assessment.changes[0].before = []; assessment.changes.length = 1; },
  ]) {
    const example = sample();
    change(example);
    await assert.rejects(reviewArticle(example.request, providerReturning(example.assessment)), { code: 'INVALID_CHANGES' });
  }
});

test('unresolved checklist criteria cannot be reported as a complete review', async () => {
  const { request, assessment } = sample();
  assessment.policy_assessments[0].status = 'not_assessable';
  assessment.policy_assessments[0].reason = 'An editor must verify the external source of the attendance estimate.';
  assessment.policy_assessments[0].evidence = [];
  const result = await reviewArticle(request, providerReturning(assessment));

  assert.equal(result.status, 'partial');
  assert.ok(result.limitations.includes('Some requested editorial checklist criteria could not be assessed.'));
});

test('a first draft can be reviewed while clearly disclosing there was no revision comparison', async () => {
  const { request, assessment } = sample();
  request.baseline_revision = null;
  assessment.changes = [];
  assessment.coverage.revision_comparison = 'not_requested';
  const result = await reviewArticle(request, providerReturning(assessment));

  assert.equal(result.status, 'reviewed');
  assert.deepEqual(result.changes, []);
  assert.ok(result.limitations.includes('No baseline revision was supplied; revision comparison was not performed.'));
});

test('a result with no assessable criteria or other usable analysis remains unable to assess', async () => {
  const { request, assessment } = sample();
  assessment.changes = [];
  assessment.coverage = { revision_comparison: 'incomplete', metadata_suggestions: 'incomplete' };
  for (const rule of assessment.policy_assessments) {
    rule.status = 'not_assessable';
    rule.reason = 'Required source context was not supplied.';
    rule.evidence = [];
  }
  assessment.metadata_suggestions.section = { suggested_id: null, reason: 'Insufficient context.', evidence: [] };
  assessment.metadata_suggestions.tags = { suggested_ids: [], reason: 'Insufficient context.', evidence: [] };
  assessment.metadata_suggestions.short_description = { suggested_text: null, reason: 'Insufficient context.', evidence: [] };

  const result = await reviewArticle(request, providerReturning(assessment));
  assert.equal(result.status, 'unable_to_assess');
});

test('explicitly incomplete requested analysis cannot retain a complete-review status', async () => {
  const { request, assessment } = sample();
  assessment.changes = [];
  assessment.coverage = { revision_comparison: 'incomplete', metadata_suggestions: 'complete' };
  assessment.limitations = ['Revision comparison could not be performed; only candidate checklist criteria were assessed.'];
  const result = await reviewArticle(request, providerReturning(assessment));

  assert.equal(result.status, 'partial');
});

test('a declared material limitation is conservative even when coverage is overclaimed', async () => {
  const { request, assessment } = sample();
  assessment.limitations = ['Revision comparison could not be performed; only candidate checklist criteria were assessed.'];
  const result = await reviewArticle(request, providerReturning(assessment));
  assert.equal(result.status, 'partial');
});

test('comparison coverage must agree with whether a baseline was requested', async () => {
  for (const change of [
    example => { example.assessment.coverage.revision_comparison = 'not_requested'; },
    example => { example.request.baseline_revision = null; example.assessment.changes = []; },
  ]) {
    const example = sample();
    change(example);
    await assert.rejects(reviewArticle(example.request, providerReturning(example.assessment)), { code: 'INVALID_COVERAGE' });
  }
});
