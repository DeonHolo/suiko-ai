import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluationFailed, readProviderReply } from '../src/evaluation-results.js';

test('evaluation preserves HTTP status and plain-text or HTML errors when JSON decoding fails', async () => {
  for (const raw of ['Service temporarily unavailable', '<html><body>Provider unavailable</body></html>']) {
    const reply = await readProviderReply(new Response(raw, { status: 503 }));
    assert.equal(reply.http, 503);
    assert.equal(reply.raw_body, raw);
    assert.equal(reply.payload, null);
    assert.ok(reply.decode_error);
  }
});

test('evaluation retains the original body beside a decoded JSON provider reply', async () => {
  const raw = '{"answers":{}}';
  const reply = await readProviderReply(new Response(raw, { status: 200 }));
  assert.deepEqual(reply.payload, { answers: {} });
  assert.equal(reply.raw_body, raw);
  assert.equal(reply.decode_error, undefined);
});

test('a good main review cannot hide a failed, incomplete or wrong optional comparison', () => {
  const main = { comparisons: [{ match: true }], claims: [{ matches: [{ match: true }] }] };
  assert.equal(evaluationFailed(main), false);
  assert.equal(evaluationFailed({ ...main, decision: { http: 200, coverage_complete: true, comparisons: [{ match: true }] } }), false);
  for (const decision of [
    { http: 503, coverage_complete: false, comparisons: [] },
    { http: 200, coverage_complete: false, comparisons: [] },
    { http: 200, coverage_complete: true, comparisons: [{ expected: 'insufficient', actual: 'supported', match: false }] },
  ]) assert.equal(evaluationFailed({ ...main, decision }), true);
});

test('evaluation fails when an expected claim was omitted or a provider call failed', () => {
  assert.equal(evaluationFailed({ comparisons: [], claims: [{ matches: [] }] }), true);
  assert.equal(evaluationFailed({ failure: 'Provider HTTP 503' }), true);
});

test('matching labels cannot hide invalid observations, while explicit confirmation gaps remain reported', () => {
  const matching = { comparisons: [{ match: true }], claims: [{ matches: [{ match: true }] }] };
  for (const code of ['INVALID_METADATA_SECTION', 'QUOTE_MISMATCH', 'INVALID_CONCERN_PASSAGE', 'INTERNAL_METADATA_SOURCE']) {
    assert.equal(evaluationFailed({ ...matching, issues: [code] }), true, code);
  }
  assert.equal(evaluationFailed({ ...matching, issues: ['MISSING_EVIDENCE', 'DESCRIPTION_NEEDS_CONFIRMATION'] }), false);
});
