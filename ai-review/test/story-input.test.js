import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { normalizeStoryInput, normalizeSourceUrls, storySnapshot } from '../src/story-input.js';
import { workbenchSchemas } from '../src/workbench-contract.js';
import { reviewWorkbench } from '../src/workbench-review.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validators = Object.fromEntries(Object.entries(workbenchSchemas(read('../../contracts/ai-assessment.schema.json')))
  .map(([name, schema]) => [name, ajv.compile(schema)]));
validators.validateRequest = ajv.compile(read('../../contracts/ai-review.request.schema.json'));

function draft() {
  return {
    title: 'A fictional rehearsal', text: 'The crew rehearses the opening scene.', notes: 'Internal production brief.',
    content_format: 'script', content_kind: 'news', source_urls: ['https://example.com/rehearsal'],
  };
}

test('an editor can save explicit format, kind, separate URLs and context', () => {
  const input = { ...draft(), text: ' Opening scene.\r\n\r\n Closing scene. ', notes: ' Notes.\r\n' };
  const saved = normalizeStoryInput(input);
  assert.equal(saved.content_format, 'script');
  assert.equal(saved.content_kind, 'news');
  assert.equal(saved.text, 'Opening scene.\n\n Closing scene.');
  assert.equal(saved.notes, 'Notes.');
  assert.deepEqual(saved.source_urls, ['https://example.com/rehearsal']);
  assert.equal(input.text, ' Opening scene.\r\n\r\n Closing scene. ');
});

test('new and legacy save payloads require an explicit valid format and kind', () => {
  for (const fields of [
    { content_format: '' }, { content_kind: '' }, { content_format: 'pdf' }, { content_kind: 'guess-for-me' },
    { content_format: undefined, content_kind: undefined },
  ]) assert.throws(() => normalizeStoryInput({ ...draft(), ...fields }), { code: 'INVALID_STORY_INPUT' });
});

test('public URL input supports bare hosts and preserves query and fragment references', () => {
  const result = normalizeSourceUrls([' EXAMPLE.COM:443/report?q=one#section-two ', 'https://example.com:443/report?q=one#section-two', '']);
  assert.deepEqual(result, ['https://example.com/report?q=one#section-two']);
});

test('duplicates do not consume the five-source allowance and a sixth distinct source is rejected', () => {
  const links = Array.from({ length: 5 }, (_, index) => `https://example.com/source-${index}`);
  assert.deepEqual(normalizeSourceUrls([...links, links[0], '']), links);
  assert.throws(() => normalizeSourceUrls([...links, 'https://example.com/sixth']), { code: 'INVALID_STORY_INPUT' });
});

test('non-public, credential-bearing and malformed source addresses cannot be saved', () => {
  for (const link of [
    'javascript:alert(1)', 'file:///draft.pdf', 'http://localhost/report', 'http://127.0.0.1/report',
    'https://office.internal/report', 'http://192.168.1.10/report', 'https://user:pass@example.com/report',
    'https://example.com:8080/report', 'https://example.com/a b', 'https://example.com\\@localhost/',
    'https://example.com/report?access_token=private-value',
  ]) assert.throws(() => normalizeSourceUrls([link]), { code: 'INVALID_STORY_INPUT' }, link);
});

test('invalid link and note types are rejected instead of silently becoming empty fields', () => {
  for (const fields of [{ source_urls: false }, { source_urls: 'https://example.com' }, { source_urls: [42] }, { notes: {} }]) {
    assert.throws(() => normalizeStoryInput({ ...draft(), ...fields }), { code: 'INVALID_STORY_INPUT' });
  }
});

test('private access parameters in fragments are rejected while ordinary section references remain usable', () => {
  for (const link of [
    'https://example.com/report#access_token=synthetic-test-only',
    'https://example.com/report#section?api_key=synthetic-test-only',
    'https://example.com/report#section&authorization=synthetic-test-only',
  ]) assert.throws(() => normalizeStoryInput({ ...draft(), source_urls: [link] }), { code: 'INVALID_STORY_INPUT' });
  assert.deepEqual(normalizeSourceUrls(['https://example.com/report#section-two']), ['https://example.com/report#section-two']);
});

test('source sets that expand beyond the saved JSON capacity are rejected before saving', () => {
  const links = Array.from({ length: 5 }, (_, index) => 'https://example.com/' + index + '/' + '"'.repeat(980));
  assert.throws(() => normalizeStoryInput({ ...draft(), source_urls: links }), { code: 'INVALID_STORY_INPUT' });
  const ordinary = Array.from({ length: 5 }, (_, index) => 'https://example.com/' + index + '/' + 'a'.repeat(1400));
  assert.deepEqual(normalizeStoryInput({ ...draft(), source_urls: ordinary }).source_urls, ordinary);
});

test('the saved-text limit includes context and URLs and counts Unicode characters', () => {
  const unicodeTitle = '🎬'.repeat(160);
  assert.equal(normalizeStoryInput({ ...draft(), title: unicodeTitle }).title, unicodeTitle);
  assert.throws(() => normalizeStoryInput({ ...draft(), title: unicodeTitle + '🎬' }), { code: 'INVALID_STORY_INPUT' });
  assert.throws(() => normalizeStoryInput({ ...draft(), text: 'a'.repeat(11980), notes: 'A context that makes this exceed the total limit.' }), { code: 'INVALID_STORY_INPUT' });
  assert.throws(() => normalizeStoryInput({ ...draft(), notes: 'n'.repeat(4001) }), { code: 'INVALID_STORY_INPUT' });
});

test('each classified snapshot preserves its own fields and uses a short version reference', () => {
  const saved = { ...normalizeStoryInput(draft()), id: 'opaque-record-1', version: 1 };
  const first = storySnapshot(saved);
  saved.source_urls.push('https://example.com/later');
  saved.notes = 'An edited note that was never part of the first snapshot.';
  const second = storySnapshot({ ...saved, id: 'opaque-record-2', version: 2, content_kind: 'sponsored' });
  assert.equal(first.revision_id, 'draft-1');
  assert.equal(second.revision_id, 'draft-2');
  assert.equal(first.content_kind, 'news');
  assert.equal(second.content_kind, 'sponsored');
  assert.deepEqual(first.source_urls, ['https://example.com/rehearsal']);
  assert.equal(first.segments.find(segment => segment.field === 'production_notes').text, 'Internal production brief.');
  assert.equal(first.segments.find(segment => segment.field === 'source_notes').text, 'https://example.com/rehearsal');
});

test('legacy snapshots preserve their old notes without guessing format or extracting links', () => {
  const legacy = storySnapshot({ title: 'Older draft', text: 'An existing story.', notes: 'See https://example.com/old.', version: 1 });
  assert.ok(!Object.hasOwn(legacy, 'content_format'));
  assert.ok(!Object.hasOwn(legacy, 'content_kind'));
  assert.ok(!Object.hasOwn(legacy, 'source_urls'));
  assert.equal(legacy.segments.find(segment => segment.field === 'production_notes').text, 'See https://example.com/old.');
});

test('a classified candidate can be reviewed against a legacy baseline through the public entry', async () => {
  const request = read('../../contracts/ai-review.request.example.json');
  const assessment = read('../../contracts/ai-review.response.example.json').assessment;
  request.schema_version = '0.3.0';
  Object.assign(request.candidate_revision, { content_format: 'article', content_kind: 'news', source_urls: ['https://example.com/source'] });
  const result = {
    overview: 'A draft announces a library opening.', assessment,
    findings: assessment.policy_assessments.filter(rule => rule.status === 'potential_conflict').map(rule => ({
      rule_id: rule.rule_id, summary: rule.reason, action: rule.suggested_action, evidence: rule.evidence,
    })),
  };
  const checked = await reviewWorkbench(request, { generate: async () => JSON.stringify(result) }, validators);
  assert.equal(checked.assessment.status, 'reviewed');
});

test('the 0.3 contract requires classified candidate fields before any provider call', async () => {
  for (const field of ['content_format', 'content_kind', 'source_urls']) {
    const request = read('../../contracts/ai-review.request.example.json');
    request.schema_version = '0.3.0';
    Object.assign(request.candidate_revision, { content_format: 'article', content_kind: 'news', source_urls: [] });
    delete request.candidate_revision[field];
    await assert.rejects(reviewWorkbench(request, { generate: async () => { throw new Error('Provider must not run.'); } }, validators), { code: 'INVALID_REQUEST' });
  }
});

test('a 0.2 request cannot silently opt into classified candidate inputs', async () => {
  const request = read('../../contracts/ai-review.request.example.json');
  Object.assign(request.candidate_revision, { content_format: 'article', content_kind: 'news', source_urls: [] });
  await assert.rejects(reviewWorkbench(request, { generate: async () => { throw new Error('Provider must not run.'); } }, validators), { code: 'INVALID_REQUEST' });
});
