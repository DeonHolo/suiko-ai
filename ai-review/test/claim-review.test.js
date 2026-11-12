import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { workbenchSchemas } from '../src/workbench-contract.js';
import { reviewWorkbench } from '../src/workbench-review.js';
import { buildDecisionRequest, decisionResults } from '../src/decision-review.js';

const read = path => JSON.parse(readFileSync(new URL('../../contracts/' + path, import.meta.url), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validators = Object.fromEntries(Object.entries(workbenchSchemas(read('ai-assessment.schema.json')))
  .map(([name, schema]) => [name, ajv.compile(schema)]));
validators.validateRequest = ajv.compile(read('ai-review.request.schema.json'));

const title = 'Juniper Cut prepares a screening';
const time = 'The screening starts at 6 p.m.';
const seats = 'The screening room has 120 seats.';
const tickets = 'Tickets cost five dollars.';
const newerTime = 'The screening starts at 7 p.m.';
const ref = (segment_id, quote) => ({ revision_id: 'draft-1', segment_id, quote });
const source = quote => ({ source_id: 'source-1', passage_id: 'passage-1', quote });
const scope = { formats: ['article'], content_kinds: ['news'], conditions: '', human_checks: [] };

function sample() {
  const request = read('ai-review.request.example.json');
  const url = 'https://example.org/brief';
  Object.assign(request, {
    schema_version: '0.5.0', baseline_revision: null,
    capabilities: { source_reading: true, rights_verification: false },
    candidate_revision: { revision_id: 'draft-1', content_format: 'article', content_kind: 'news', source_urls: [url], segments: [
      { segment_id: 'title', field: 'title', text: title },
      { segment_id: 'body-1', field: 'body', text: [time, seats, tickets].join(' ') },
      { segment_id: 'production_notes-1', field: 'production_notes', text: 'Producer heard that tickets cost five dollars.' },
    ] },
    source_rule_ids: ['SOURCES'],
    source_material: [{ source_id: 'source-1', url, status: 'read', passages: [{ passage_id: 'passage-1', text: [newerTime, seats].join(' ') }] }],
  });
  request.policy_pack.rules = [{ rule_id: 'SOURCES', title: 'Check important claims', text: 'Compare claims with the supplied production brief.', priority: 'high', applicability: scope }];
  const check = (status, quote, sourceText) => ({
    rule_id: 'SOURCES', status, claim: ref('body-1', quote), sources: sourceText ? [source(sourceText)] : [],
    context: [], reason: 'This check concerns the saved event brief.', action: 'Compare the current wording and the saved brief.',
  });
  const reply = {
    overview: 'This draft covers a screening.', overview_evidence: [ref('title', title)],
    findings: [],
    claim_checks: [check('contradicted', time, newerTime), check('supported', seats, seats), check('insufficient', tickets)],
    assessment: {
      status: 'reviewed', coverage: { revision_comparison: 'not_requested', metadata_suggestions: 'complete' }, changes: [], limitations: [],
      policy_assessments: [{ rule_id: 'SOURCES', status: 'no_potential_conflict_observed', evidence: [ref('body-1', seats)], reason: 'The brief supports the seats.', suggested_action: null }],
      metadata_suggestions: {
        section: { suggested_id: null, evidence: [], reason: 'No section selected.' },
        tags: { suggested_ids: [], evidence: [], reason: 'No tags selected.' },
        short_description: { suggested_text: seats, evidence: [ref('body-1', seats)], reason: 'The draft describes the venue.' },
      },
    },
  };
  return { request, reply };
}

const review = (request, reply) => reviewWorkbench(request, { generate: async () => JSON.stringify(reply) }, validators);

test('one rule can show a supported count, conflicting time and missing price in the same saved paragraph', async () => {
  const { request, reply } = sample();
  const checked = await review(request, reply);
  assert.deepEqual(checked.claim_checks.map(check => check.status), ['contradicted', 'supported', 'insufficient']);
  assert.equal(checked.assessment.policy_assessments[0].status, 'potential_conflict');
  assert.match(checked.assessment.policy_assessments[0].reason, /1 need confirmation/);
  assert.equal(checked.assessment.status, 'partial');
  assert.equal(checked.assessment.metadata_suggestions.short_description.suggested_text, seats);
  reply.assessment.metadata_suggestions.short_description = { suggested_text: 'Tickets are $5.', evidence: [ref('body-1', tickets)], reason: 'The draft mentions price.' };
  assert.equal((await review(request, reply)).assessment.metadata_suggestions.short_description.suggested_text, null);
});

test('a wrong source quote becomes an unresolved claim while other claims and the overview remain visible', async () => {
  const { request, reply } = sample();
  reply.claim_checks[0].sources[0].quote = 'The screening starts at 8 p.m.';
  const checked = await review(request, reply);
  assert.equal(checked.claim_checks[0].status, 'insufficient');
  assert.deepEqual(checked.claim_checks[0].sources, []);
  assert.equal(checked.claim_checks[1].status, 'supported');
  assert.equal(checked.assessment.policy_assessments[0].status, 'not_assessable');
  assert.equal(checked.checks.overview_available, true);
});

test('supplied notes can be cited with their own identity, while a source URL cannot become a retrieved passage', async () => {
  const { request, reply } = sample();
  const note = request.candidate_revision.segments.at(-1);
  reply.claim_checks[2].status = 'supported';
  reply.claim_checks[2].context = [ref(note.segment_id, note.text)];
  const checked = await review(request, reply);
  assert.equal(checked.claim_checks[2].status, 'supported');
  assert.deepEqual(checked.claim_checks[2].sources, []);
  assert.equal(checked.claim_checks[2].context[0].segment_id, note.segment_id);
  reply.claim_checks[2].context = [ref('title', title)];
  assert.equal((await review(request, reply)).claim_checks[2].status, 'insufficient');
});

test('a headline conflict can cite accurate body context without disqualifying that context from metadata', async () => {
  const { request, reply } = sample();
  request.source_rule_ids = [];
  reply.claim_checks = [];
  const badHeadline = 'Screening starts at 8 p.m.';
  request.candidate_revision.segments[0].text = badHeadline;
  reply.overview_evidence = [ref('body-1', time)];
  const evidence = [ref('title', badHeadline), ref('body-1', time)];
  reply.findings = [{ rule_id: 'SOURCES', summary: 'The headline and body use different times.', action: 'Use the time in the body.', evidence, concern_evidence: [evidence[0]] }];
  reply.assessment.policy_assessments[0] = { rule_id: 'SOURCES', status: 'potential_conflict', reason: 'Different times', evidence, suggested_action: 'Check the headline.' };
  reply.assessment.metadata_suggestions.short_description = { suggested_text: time, reason: 'Uses the body.', evidence: [evidence[1]] };
  assert.equal((await review(request, reply)).assessment.metadata_suggestions.short_description.suggested_text, time);
});

test('Decision 1 receives checked claims and retrieved passages and preserves an advisory answer', async () => {
  const { request, reply } = sample();
  const checked = await review(request, reply);
  const extra = buildDecisionRequest(request, checked.claim_checks);
  assert.deepEqual(Object.keys(extra.questions), ['claim-1', 'claim-2']);
  const input = JSON.parse(extra.input);
  assert.match(input[0].sources[0].text, /7 p.m./);
  assert.equal(input[0].claim, time);
  const answers = decisionResults(extra, { answers: {
    'claim-1': { type: 'choice', choice: 'insufficient', confidence: 0.57, probabilities: { supported: 0.1, contradicted: 0.33, insufficient: 0.57 } },
    'claim-2': { type: 'choice', choice: 'supported', confidence: 4 },
  } });
  assert.equal(answers['claim-1'].confidence, 0.57);
  assert.equal(answers['claim-1'].status, 'insufficient');
  assert.equal(answers['claim-2'], undefined);
  assert.equal(checked.claim_checks[0].status, 'contradicted');
});
