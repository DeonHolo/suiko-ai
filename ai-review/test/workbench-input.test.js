import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reviewArticle } from '../src/review.js';

function fixture() {
  const load = name => JSON.parse(readFileSync(new URL('../../contracts/' + name, import.meta.url), 'utf8'));
  return {
    request: load('ai-review.request.example.json'),
    assessment: load('ai-review.response.example.json').assessment,
  };
}

test('a source note can accompany a free-form draft without changing its article passages', async () => {
  const { request, assessment } = fixture();
  request.candidate_revision.segments.push({
    segment_id: 'source-note', field: 'source_notes', text: 'Reporting notes identify the library event coordinator.',
  });
  const result = await reviewArticle(request, { generate: async () => JSON.stringify(assessment) });
  assert.ok(result.metadata_suggestions);
});

test('an editor can review a draft after disabling all shared rules', async () => {
  const { request, assessment } = fixture();
  request.policy_pack.rules = [];
  assessment.policy_assessments = [];
  const result = await reviewArticle(request, { generate: async () => JSON.stringify(assessment) });
  assert.deepEqual(result.policy_assessments, []);
  assert.ok(result.metadata_suggestions);
});

test('internal source notes cannot become evidence for a public metadata description', async () => {
  const { request, assessment } = fixture();
  const note = { segment_id: 'internal-note', field: 'production_notes', text: 'Private production planning note.' };
  request.candidate_revision.segments.push(note);
  assessment.metadata_suggestions.short_description.evidence = [{
    revision_id: request.candidate_revision.revision_id, segment_id: note.segment_id, quote: note.text,
  }];
  await assert.rejects(reviewArticle(request, { generate: async () => JSON.stringify(assessment) }),
    error => error.code === 'INVALID_METADATA');
});
