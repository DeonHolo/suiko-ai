import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { workbenchSchemas } from '../src/workbench-contract.js';
import { reviewWorkbench } from '../src/workbench-review.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const requestExample = read('../../contracts/ai-review.request.example.json');
const assessmentExample = read('../../contracts/ai-review.response.example.json').assessment;
const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validators = Object.fromEntries(Object.entries(workbenchSchemas(read('../../contracts/ai-assessment.schema.json')))
  .map(([name, schema]) => [name, ajv.compile(schema)]));
validators.validateRequest = ajv.compile(read('../../contracts/ai-review.request.schema.json'));

function sample() {
  const request = structuredClone(requestExample);
  const assessment = structuredClone(assessmentExample);
  const result = {
    overview: 'The draft announces a community library opening. The attendance estimate needs editorial review.',
    assessment,
    findings: assessment.policy_assessments.filter(rule => rule.status === 'potential_conflict').map(rule => ({
      rule_id: rule.rule_id, summary: rule.reason, action: rule.suggested_action || 'Check the quoted passage.',
      evidence: structuredClone(rule.evidence),
    })),
  };
  return { request, result };
}
const review = (request, result) => reviewWorkbench(request, { generate: async () => JSON.stringify(result) }, validators);

test('the workbench preserves a checked overview, findings and independent sections', async () => {
  const { request, result } = sample();
  const checked = await review(request, result);
  assert.equal(checked.checks.overview_available, true);
  assert.deepEqual(checked.checks.issues, []);
  assert.equal(checked.overview, result.overview);
  assert.equal(checked.assessment.status, 'reviewed');
  assert.deepEqual(checked.assessment.changes, result.assessment.changes);
});

test('a clear sourcing assessment cannot coexist with its retained missing-source finding', async () => {
  const { request, result } = sample();
  result.assessment.policy_assessments[0].status = 'no_potential_conflict_observed';
  result.assessment.policy_assessments[0].reason = 'Every claim has a traceable source.';
  const checked = await review(request, result);
  assert.equal(checked.assessment.policy_assessments[0].status, 'potential_conflict');
  assert.ok(!checked.assessment.policy_assessments[0].reason.includes('Every claim'));
  assert.ok(checked.checks.issues.some(issue => issue.code === 'CONTRADICTORY_RULE_STATUS'));
  assert.equal(checked.assessment.status, 'partial');
  assert.equal(checked.checks.overview_available, false);
  assert.equal(checked.findings.length, result.findings.length);
});

test('missing evidence is explained as missing evidence without empty quote/source fields', async () => {
  const { request, result } = sample();
  result.assessment.policy_assessments[1].status = 'no_potential_conflict_observed';
  result.assessment.policy_assessments[1].evidence = [];
  result.findings = result.findings.filter(finding => finding.rule_id !== result.assessment.policy_assessments[1].rule_id);
  const checked = await review(request, result);
  const issue = checked.checks.issues.find(item => item.code === 'MISSING_EVIDENCE');
  assert.ok(issue);
  assert.ok(!Object.hasOwn(issue, 'quote'));
  assert.ok(!Object.hasOwn(issue, 'source'));
  assert.equal(checked.assessment.policy_assessments[1].status, 'not_assessable');
  assert.ok(checked.assessment.changes.length > 0);
});

test('an inapplicable outside-media check does not need an invented passage', async () => {
  const { request, result } = sample();
  const rule = result.assessment.policy_assessments[1];
  rule.status = 'not_applicable';
  rule.reason = 'The submitted text does not propose an outside media asset.';
  rule.evidence = [];
  rule.suggested_action = null;
  result.findings = result.findings.filter(finding => finding.rule_id !== rule.rule_id);
  const checked = await review(request, result);
  assert.equal(checked.assessment.policy_assessments[1].status, 'not_applicable');
  assert.deepEqual(checked.checks.issues, []);
});

test('an invented finding quote leaves other sections usable and shows the actual mismatch', async () => {
  const { request, result } = sample();
  const reference = result.findings[0].evidence[0];
  reference.quote = 'This sentence was never entered by the editor.';
  const checked = await review(request, result);
  const issue = checked.checks.issues.find(item => item.code === 'QUOTE_MISMATCH');
  assert.equal(issue.quote, reference.quote);
  assert.equal(issue.source, request.candidate_revision.segments.find(segment => segment.segment_id === reference.segment_id).text);
  assert.equal(checked.findings.length, 0);
  assert.equal(checked.assessment.policy_assessments[0].status, 'not_assessable');
  assert.deepEqual(checked.assessment.changes, result.assessment.changes);
  assert.equal(checked.assessment.status, 'partial');
  assert.equal(checked.checks.overview_available, false);
});

test('one bad finding cannot clear a rule or erase another valid concern under that rule', async () => {
  const { request, result } = sample();
  const invalid = structuredClone(result.findings[0]);
  invalid.evidence[0].quote = 'Invented second quotation.';
  result.findings.push(invalid);
  const checked = await review(request, result);
  assert.equal(checked.findings.length, result.findings.length - 1);
  assert.equal(checked.assessment.policy_assessments[0].status, 'potential_conflict');
  assert.equal(checked.assessment.status, 'partial');
});

test('a malformed metadata suggestion does not erase independent suggestions or changes', async () => {
  const { request, result } = sample();
  result.assessment.metadata_suggestions.tags.suggested_ids = ['not-in-the-company-taxonomy'];
  const checked = await review(request, result);
  assert.deepEqual(checked.assessment.metadata_suggestions.tags.suggested_ids, []);
  assert.equal(checked.assessment.metadata_suggestions.section.suggested_id,
    result.assessment.metadata_suggestions.section.suggested_id);
  assert.deepEqual(checked.assessment.changes, result.assessment.changes);
  assert.equal(checked.assessment.coverage.metadata_suggestions, 'incomplete');
});

test('public metadata cannot reuse a passage that remains flagged for confirmation', async () => {
  const { request, result } = sample();
  const rule = result.assessment.policy_assessments[0];
  result.assessment.metadata_suggestions.short_description = {
    suggested_text: rule.evidence[0].quote, reason: 'Describe the event.', evidence: structuredClone(rule.evidence),
  };
  const checked = await review(request, result);
  assert.equal(checked.assessment.metadata_suggestions.short_description.suggested_text, null);
  assert.ok(checked.checks.issues.some(issue => issue.code === 'DESCRIPTION_NEEDS_CONFIRMATION'));
});

test('a change with the wrong evidence sides is excluded while policy findings survive', async () => {
  const { request, result } = sample();
  result.assessment.changes[0].kind = 'removed';
  const checked = await review(request, result);
  assert.equal(checked.assessment.changes.length, result.assessment.changes.length - 1);
  assert.equal(checked.assessment.coverage.revision_comparison, 'incomplete');
  assert.deepEqual(checked.findings, result.findings);
});

test('unreadable JSON, duplicate keys and publishing fields remain technical failures', async () => {
  const { request, result } = sample();
  const valid = JSON.stringify(result);
  for (const raw of ['{"overview":', valid.replace('"status":"reviewed"', '"status":"partial","status":"reviewed"')]) {
    await assert.rejects(reviewWorkbench(request, { generate: async () => raw }, validators), { code: 'INVALID_PROVIDER_JSON' });
  }
  await assert.rejects(review(request, { ...result, approval: 'approved' }), { code: 'INVALID_WORKBENCH_FORMAT' });
});

test('missing, unknown and duplicate rule identities cannot produce a checked review', async () => {
  for (const alter of [
    value => value.assessment.policy_assessments.pop(),
    value => { value.assessment.policy_assessments[0].rule_id = 'unknown-rule'; },
    value => { value.assessment.policy_assessments[1].rule_id = value.assessment.policy_assessments[0].rule_id; },
  ]) {
    const { request, result } = sample();
    alter(result);
    await assert.rejects(review(request, result), { code: 'CHECKLIST_MISMATCH' });
  }
});

test('edits while Gemini is pending cannot change the workbench frozen passage', async () => {
  const { request, result } = sample();
  const reference = result.findings[0].evidence[0];
  reference.quote = 'Text added after the review began.';
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const work = reviewWorkbench(request, { generate: async () => pending }, validators);
  request.candidate_revision.segments.find(segment => segment.segment_id === reference.segment_id).text += ' ' + reference.quote;
  release(JSON.stringify(result));
  const checked = await work;
  assert.ok(checked.checks.issues.some(issue => issue.code === 'QUOTE_MISMATCH'));
  assert.ok(!checked.findings.some(finding => finding.evidence.some(item => item.quote === reference.quote)));
});

test('all provider limitations remain visible when the first-draft notice needs extra room', async () => {
  const { request, result } = sample();
  request.baseline_revision = null;
  result.assessment.changes = [];
  result.assessment.coverage.revision_comparison = 'not_requested';
  result.assessment.limitations = Array.from({ length: 12 }, (_, index) => `Supplied limitation ${index + 1}.`);
  const checked = await review(request, result);
  assert.deepEqual(checked.assessment.limitations, result.assessment.limitations);
  assert.ok(checked.checks.notes.some(note => note.startsWith('No baseline revision')));
  assert.equal(checked.assessment.status, 'partial');
});

test('the recorded fictional radio replies now retain findings and explain their old failures', async () => {
  const fixture = read('../fixtures/radio-review-regression.json');
  const request = structuredClone(requestExample);
  request.request_id = 'radio-validator-regression';
  request.content_id = 'radio-regression';
  request.baseline_revision = null;
  request.taxonomy = fixture.taxonomy;
  request.candidate_revision = {
    revision_id: 'radio-v1',
    segments: [
      { segment_id: 'title', field: 'title', text: fixture.input.title },
      ...fixture.input.text.split(/\n\s*\n/).map((text, index) => ({ segment_id: `body-${index + 1}`, field: 'body', text })),
      ...fixture.input.notes.split(/\n\s*\n/).map((text, index) => ({ segment_id: `production_notes-${index + 1}`, field: 'production_notes', text })),
    ],
  };
  request.policy_pack.rules = fixture.runs[0].result.assessment.policy_assessments.map(rule => ({
    rule_id: rule.rule_id, title: rule.rule_id, priority: 'high', text: 'Historical fictional rule identity for validator regression; this test does not evaluate the rule interpretation.',
  }));
  for (const run of fixture.runs) {
    const checked = await review(request, run.result);
    assert.equal(checked.assessment.status, 'partial', run.name);
    assert.equal(checked.findings.length, run.result.findings.length, run.name);
    assert.equal(checked.assessment.policy_assessments.find(rule => rule.rule_id === 'SOURCING').status, 'potential_conflict');
    assert.equal(checked.assessment.policy_assessments.find(rule => rule.rule_id === 'OUTSIDE-ASSETS').status, 'not_assessable');
    assert.ok(!checked.checks.issues.some(issue => issue.code === 'QUOTE_MISMATCH'), run.name);
    assert.ok(checked.checks.issues.some(issue => issue.code === 'MISSING_EVIDENCE'), run.name);
    assert.ok(checked.checks.issues.some(issue => issue.code === 'CONTRADICTORY_RULE_STATUS'), run.name);
  }
});

test('ambiguous workbench sources are rejected before the provider runs', async () => {
  const { request } = sample();
  request.candidate_revision.segments[1].segment_id = request.candidate_revision.segments[0].segment_id;
  await assert.rejects(reviewWorkbench(request, { generate: async () => { throw new Error('Provider must not run.'); } }, validators),
    { code: 'INVALID_REQUEST' });
});

test('an unsupported assessment status is explained instead of silently appearing complete', async () => {
  const { request, result } = sample();
  result.assessment.status = 'approved';
  const checked = await review(request, result);
  assert.equal(checked.assessment.status, 'partial');
  assert.ok(checked.checks.issues.some(issue => issue.code === 'INVALID_ASSESSMENT_STATUS'));
});

test('an overview with independent story evidence survives an unrelated rule failure', async () => {
  const { request, result } = sample();
  const title = request.candidate_revision.segments.find(segment => segment.field === 'title');
  result.overview = 'This draft announces a community library opening.';
  result.overview_evidence = [{ revision_id: request.candidate_revision.revision_id, segment_id: title.segment_id, quote: title.text }];
  result.assessment.policy_assessments[1].status = 'no_potential_conflict_observed';
  result.assessment.policy_assessments[1].evidence = [];
  const checked = await review(request, result);
  assert.equal(checked.assessment.status, 'partial');
  assert.equal(checked.checks.overview_available, true);
  assert.equal(checked.overview, result.overview);
  assert.deepEqual(checked.overview_evidence, result.overview_evidence);
});

test('an unknown-rule finding cannot lend its rejected passage to the overview', async () => {
  const { request, result } = sample();
  const evidence = structuredClone(result.findings[0].evidence);
  result.findings = [{ ...result.findings[0], rule_id: 'NOT-A-SUPPLIED-RULE', evidence }];
  result.overview_evidence = evidence;
  const checked = await review(request, result);
  assert.equal(checked.checks.overview_available, false);
  assert.equal(checked.checks.withheld_overview, result.overview);
  assert.equal(checked.findings.length, 0);
  assert.ok(checked.checks.issues.some(issue => issue.code === 'UNKNOWN_FINDING_RULE'));
  assert.deepEqual(checked.assessment.changes, result.assessment.changes);
});

test('unmatched overview evidence is withheld without erasing usable rule findings', async () => {
  const { request, result } = sample();
  result.overview_evidence = [{ revision_id: request.candidate_revision.revision_id, segment_id: 'title', quote: 'An invented headline.' }];
  const checked = await review(request, result);
  assert.equal(checked.checks.overview_available, false);
  assert.equal(checked.checks.withheld_overview, result.overview);
  assert.deepEqual(checked.findings, result.findings);
  assert.ok(checked.checks.issues.some(issue => issue.code === 'QUOTE_MISMATCH' && issue.path.startsWith('/overview_evidence')));
});

test('an internal overview can explain a valid concern while a public description is withheld', async () => {
  const { request, result } = sample();
  const evidence = structuredClone(result.assessment.policy_assessments[0].evidence);
  result.overview = 'The draft announces a library event; the attendance estimate needs confirmation.';
  result.overview_evidence = evidence;
  result.assessment.metadata_suggestions.short_description = {
    suggested_text: evidence[0].quote, reason: 'Describe attendance.', evidence,
  };
  const checked = await review(request, result);
  assert.equal(checked.checks.overview_available, true);
  assert.equal(checked.overview, result.overview);
  assert.equal(checked.assessment.metadata_suggestions.short_description.suggested_text, null);
  assert.equal(checked.checks.issues.find(issue => issue.code === 'DESCRIPTION_NEEDS_CONFIRMATION').rejected_suggestion, evidence[0].quote);
});
