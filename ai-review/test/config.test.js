import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

function checkConfig(t, contents) {
  const directory = mkdtempSync(join(tmpdir(), 'backyardigans-config-'));
  const file = join(directory, '.env.local');
  writeFileSync(file, contents, 'utf8');
  t.after(() => { rmSync(file, { force: true }); rmdirSync(directory); });
  const env = { ...process.env };
  delete env.GEMINI_API_KEY;
  delete env.GOOGLE_API_KEY;
  delete env.GEMINI_MODEL;
  const script = fileURLToPath(new URL('../src/check-gemini-config.js', import.meta.url));
  return spawnSync(process.execPath, [`--env-file=${file}`, script], { encoding: 'utf8', env });
}

test('a key loaded from a local file is detected without printing its value', t => {
  const sentinel = 'test-only-secret-do-not-print-48271';
  const result = checkConfig(t, `GEMINI_API_KEY=${sentinel}\nGEMINI_MODEL=gemini-3.5-flash-lite\n`);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /configured/);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(sentinel));
});

test('an empty key file reports configuration missing without contacting Gemini', t => {
  const result = checkConfig(t, 'GEMINI_API_KEY=\nGEMINI_MODEL=gemini-3.5-flash-lite\n');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /not configured/);
});

test('a value pasted into the wrong model field is not echoed', t => {
  const sentinel = 'test-only-secret-in-wrong-field-97142';
  const result = checkConfig(t, `GEMINI_API_KEY=test-key\nGEMINI_MODEL=${sentinel}\n`);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /model identifier/);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(sentinel));
});
