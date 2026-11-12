import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { literalChanges, fitsLiteralEdit, combineRepeatedChanges } from '../src/revision-diff.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const library = read('../../contracts/ai-review.request.example.json');
const caption = read('../fixtures/sponsored-caption.request.json');
const quote = (revision, id, text) => ({ revision_id: revision.revision_id, segment_id: id,
  quote: text || revision.segments.find(segment => segment.segment_id === id).text });

test('identical text and a first draft have distinct comparison outcomes', () => {
  const story = library.candidate_revision;
  assert.equal(literalChanges(null, story), null);
  assert.deepEqual(literalChanges({ ...story, revision_id: 'earlier' }, story), { changes: [], limited: false });
});

test('the date edit in the title and body can share one summary, and the unchanged admission cannot become an edit', () => {
  const { baseline_revision: before, candidate_revision: after } = library;
  const diff = literalChanges(before, after);
  const date = id => ({ change_id: id, kind: 'modified', summary: 'The opening date changed to December 12.',
    before: [quote(before, id)], after: [quote(after, id)] });
  assert.equal(fitsLiteralEdit(date('p1'), before, after, diff), true);
  const duplicateDate = [date('p1'), { ...date('title'), before: [quote(before, 'title', 'December 5')], after: [quote(after, 'title', 'December 12')] }];
  const combined = combineRepeatedChanges(duplicateDate, before, after, diff);
  assert.equal(combined.length, 1);
  assert.equal(combined[0].before.length, 2);
  assert.equal(combined[0].after.length, 2);
  const invented = { kind: 'modified', before: [quote(before, 'p3')], after: [quote(after, 'p3')] };
  assert.equal(fitsLiteralEdit(invented, before, after, diff), false);
  const attribution = { kind: 'modified', before: [quote(before, 'p2')], after: [quote(after, 'p2')] };
  assert.equal(fitsLiteralEdit(attribution, before, after, diff), true);
  assert.ok(diff.changes.some(edit => edit.before.includes('Organizers')));
});

test('shortening a caption permits a two-sided edit or a removal of just the deleted disclosure', () => {
  const { baseline_revision: before, candidate_revision: after } = caption;
  const diff = literalChanges(before, after);
  const removed = { kind: 'removed', before: [quote(before, 'public-caption', 'Paid partnership with Lantern Coffee.')], after: [] };
  const retained = { kind: 'removed', before: [quote(before, 'public-caption', 'Watch cast interviews from Harbor Film Night.')], after: [] };
  const modified = { kind: 'modified', before: [quote(before, 'public-caption')], after: [quote(after, 'public-caption')] };
  assert.equal(fitsLiteralEdit(removed, before, after, diff), true);
  assert.equal(fitsLiteralEdit(retained, before, after, diff), false);
  assert.equal(fitsLiteralEdit(modified, before, after, diff), true);
  assert.equal(fitsLiteralEdit({ ...modified, after: [quote(after, 'end-card')] }, before, after, diff), false);
});
