import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { JSDOM } from 'jsdom';

const update = new URL('../dist/app/update/', import.meta.url);
const operation = await readFile(new URL('sys_ws_operation_47f6ab35e47246e584e85d7eee076711.xml', update), 'utf8');
assert.match(operation, /<relative_path>\/state<\/relative_path>/);
assert.match(
  operation,
  /\ngetState\(request, response\);\s*\]\]><\/operation_script>/,
  'The installed workspace endpoint must only pass the ServiceNow request and response to getState.',
);

const legalSteps = [
  'be02-legal-workflow-step',
  'be02-check-unassigned',
  'be02-check-outsider',
  'be02-check-older-clearance',
  'be02-check-fresh-routing',
  'be02-check-changes-requested',
  'be02-check-current-status',
  'be02-route-final-version',
  'be02-final-clearance',
  'be02-check-final-clearance',
];
const keys = await readFile(new URL('../src/fluent/generated/keys.ts', import.meta.url), 'utf8');
const { window } = new JSDOM();
const parser = new window.DOMParser();
for (const step of legalSteps) {
  const key = keys.match(new RegExp(`'${step}':\\s*\\{\\s*table: 'sys_atf_step'\\s*id: '([a-f0-9]{32})'`));
  assert.ok(key, 'Missing record identity for ' + step);
  const filename = 'sys_atf_step_' + key[1] + '.xml';
  const xml = await readFile(new URL(filename, update), 'utf8');
  const document = parser.parseFromString(xml, 'application/xml');
  const scripts = [...document.querySelectorAll('value')].map(value => value.textContent)
    .filter(value => value.includes('src/server/legal-workflow-test.ts'));
  assert.ok(scripts.length, 'Missing packaged script for ' + step);
  for (const script of scripts) {
    assert.doesNotMatch(script, /\{\{step\[/, step + ' must read prior outputs using steps().');
    assert.doesNotThrow(() => new Script(script, { filename }));
  }
}
window.close();
