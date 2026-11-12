import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { collectSourceEvidence, needsPublicSources, publicReaderUrl } from '../src/source-reader.js';

const brief = 'https://example.org/production-brief';
const missing = 'https://example.org/missing';
const source = (url, text, status = 200, more = {}) => ({ status: 200, body: JSON.stringify({ data: {
  url, finalUrl: url, httpStatus: status, title: 'Production brief', text, ...more,
} }) });
const time = () => 10000;
const options = {
  needed: true, milliseconds: time, timestamp: () => '2026-11-12 14:00:00',
  hash: value => createHash('sha256').update(value).digest('hex'),
};

test('a pending rule edit does not trigger external reads and an approved rule must match the story scope', () => {
  const candidate = { content_format: 'article', content_kind: 'news' };
  const rule = { active: true, approved: { definition: { requires_sources: false, formats: ['article'], content_kinds: ['news'] } }, draft: { definition: { requires_sources: true } } };
  assert.equal(needsPublicSources([rule], candidate), false);
  rule.approved.definition.requires_sources = true;
  assert.equal(needsPublicSources([rule], { ...candidate, content_format: 'script' }), false);
  assert.equal(needsPublicSources([rule], candidate), true);
  const [unread] = collectSourceEvidence([brief], { ...options, needed: false, read() { assert.fail('No source should be fetched.'); } });
  assert.equal(unread.status, 'not_read');
  assert.equal(unread.requested, false);
});

test('the reader checks the target status, even when the reader wrapper returns 200', () => {
  const [read, failed] = collectSourceEvidence([brief, missing], { ...options, read: url => url === brief
    ? source(url, 'The screening starts at six.') : source(url, 'Friendly 404 page', 404) });
  assert.equal(read.status, 'read');
  assert.equal(read.passages[0].text, 'The screening starts at six.');
  assert.match(read.fingerprint, /^[a-f0-9]{64}$/);
  assert.equal(failed.status, 'unavailable');
  assert.equal(failed.http_status, 404);
  assert.equal(failed.passages, undefined);
});

test('a changed link creates a separate snapshot while the earlier passages and fingerprint survive', () => {
  const [first] = collectSourceEvidence([brief], { ...options, read: url => source(url, 'Starts at six.\r\n\r\nRoom A.') });
  const saved = JSON.stringify(first);
  const [second] = collectSourceEvidence([brief], { ...options, read: url => source(url, 'Starts at seven.\n\nRoom A.') });
  assert.notEqual(first.fingerprint, second.fingerprint);
  assert.match(second.passages[0].text, /seven/);
  assert.match(first.passages[0].text, /six/);
  assert.equal(JSON.stringify(first), saved);
});

test('the reader rejects private access parameters, nonpublic targets and redirects to unsafe addresses', () => {
  for (const url of ['https://host.internal/', 'http://0x7f.0.0.1/', 'https://host.example.org:80/',
    'https://example.org/?api%5fkey=fake', 'https://example.org/?X-Amz-Signature=fake', 'https://example.org/#token=fake']) {
    assert.equal(publicReaderUrl(url), null, url);
  }
  const [redirect, rejected] = collectSourceEvidence([brief, 'https://work.local/'], { ...options, read: url => {
    assert.equal(url, brief);
    return source(url, 'Internal address', 200, { finalUrl: 'http://127.0.0.1/' });
  } });
  assert.equal(redirect.status, 'unavailable');
  assert.equal(rejected.status, 'unavailable');
  assert.equal(redirect.passages, undefined);
  assert.equal(rejected.retrieved_at, undefined);
});

test('partial text, time budget and provider failures keep each link result separate', () => {
  let now = 0;
  const urls = ['a', 'b', 'c', 'd', 'e', 'f'].map(value => 'https://example.org/' + value);
  const results = collectSourceEvidence(urls, { ...options, milliseconds: () => now, read: (url, timeout) => {
    assert.ok(timeout <= 7000);
    now += timeout;
    if (url.endsWith('/a')) return source(url, 'A'.repeat(6001));
    if (url.endsWith('/b')) return { status: 429, body: '{}' };
    throw new Error('Simulated timeout');
  } });
  assert.deepEqual(results.map(item => item.status), ['partial', 'unavailable', 'unavailable', 'not_read', 'not_read']);
  assert.equal(results[0].passages.map(item => item.text).join('').length, 6000);
  assert.equal(results[3].requested, true);
});
