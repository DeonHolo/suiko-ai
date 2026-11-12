import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPolicySuggestions, normalizePolicyInput, policyPassages } from '../src/policy-proposals.js';

const original = 'News headlines describe proposals as pending unless a recorded vote passed.\n\nUse a disclosure in sponsored video scripts.\n\nUse good editorial judgment.';
const policy = { id: '5'.repeat(32), passages: policyPassages(original) };
const headline = {
  title: 'Preserve uncertainty in headlines',
  text: 'In news articles, describe proposals as pending unless a recorded vote passed.',
  priority: 'high', formats: ['article'], content_kinds: ['news'], conditions: 'When the headline describes a proposal.',
  human_checks: ['Confirm the vote if the supplied material does not record it.'],
  checks: ['text_review', 'context_review'], evidence: [{ passage_id: 'policy-1', quote: 'unless a recorded vote passed.' }],
};
const disclosure = {
  ...headline, title: 'Disclose sponsorship', text: 'Put a visible disclosure in sponsored video scripts.',
  formats: ['script'], content_kinds: ['sponsored'],
  evidence: [{ passage_id: 'policy-2', quote: 'Use a disclosure in sponsored video scripts.' }],
};

test('a saved policy preserves literal wording and gives its paragraphs stable identities', () => {
  const saved = normalizePolicyInput({ title: ' News policy ', text: '  Keep the wording.\r\n \r\nNext clause.  ', request_key: 'first-copy' });
  assert.equal(saved.title, 'News policy');
  assert.equal(saved.text, '  Keep the wording.\n \nNext clause.  ');
  assert.deepEqual(policyPassages(saved.text), [{ id: 'policy-1', text: '  Keep the wording.' }, { id: 'policy-2', text: 'Next clause.  ' }]);
  assert.throws(() => normalizePolicyInput({ ...saved, text: 'x'.repeat(12001) }), /12,000/);
  assert.throws(() => normalizePolicyInput({ ...saved, text: Array(81).fill('item').join('\n\n') }), /80/);
});

test('a checked suggestion retains the exception, scope and original policy references as a proposal', () => {
  const question = { text: 'What specific checks does “good editorial judgment” require?', evidence: [{ passage_id: 'policy-3', quote: 'Use good editorial judgment.' }] };
  const result = checkPolicySuggestions(JSON.stringify({ proposals: [{ ...headline, active: true, approval: 'editor' }], questions: [question] }), policy);
  assert.equal(result.skipped, 0);
  assert.equal(result.proposals[0].definition.text, headline.text);
  assert.deepEqual(result.proposals[0].definition.content_kinds, ['news']);
  assert.deepEqual(result.proposals[0].definition.origin, { kind: 'policy', policy_version_id: policy.id, passage_ids: ['policy-1'] });
  assert.equal(result.proposals[0].definition.active, undefined);
  assert.equal(result.proposals[0].definition.approval, undefined);
  assert.deepEqual(result.questions, [question]);
});

test('a wrong quote, an unsupported check or an unrelated focused proposal does not hide valid suggestions', () => {
  const broken = { ...headline, evidence: [{ passage_id: 'policy-2', quote: headline.evidence[0].quote }] };
  const unauthorized = { ...headline, checks: ['approve_publication'] };
  const question = { text: 'Which part should I check?', evidence: [{ passage_id: 'policy-1', quote: 'Invented clause' }] };
  const result = checkPolicySuggestions(JSON.stringify({ proposals: [broken, unauthorized, disclosure, headline], questions: [question] }), policy, 'policy-1');
  assert.equal(result.skipped, 4);
  assert.equal(result.proposals.length, 1);
  assert.equal(result.proposals[0].definition.title, headline.title);
  assert.deepEqual(result.questions, []);
});

test('source needs and human confirmation remain visible on an editable proposal', () => {
  const result = checkPolicySuggestions(JSON.stringify({ proposals: [{ ...headline, checks: ['source_reading', 'permissions'] }], questions: [] }), policy);
  assert.equal(result.proposals[0].definition.requires_sources, true);
  assert.deepEqual(result.proposals[0].definition.human_checks, headline.human_checks);
  assert.deepEqual(result.proposals[0].checks, ['Compare with source material', 'Ask a person to confirm permission']);
});

test('unreadable or ambiguous suggestions cannot become policy proposals', () => {
  assert.throws(() => checkPolicySuggestions('{"proposals":[],"proposals":[],"questions":[]}', policy), /policy is saved/);
  assert.throws(() => checkPolicySuggestions('{"proposals":[]}', policy), /incomplete/);
});
