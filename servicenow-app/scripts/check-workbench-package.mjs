import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Script } from 'node:vm';

const update = new URL('../dist/app/update/', import.meta.url);
const operation = await readFile(new URL('sys_ws_operation_47f6ab35e47246e584e85d7eee076711.xml', update), 'utf8');
assert.match(operation, /<relative_path>\/state<\/relative_path>/);
assert.match(
  operation,
  /\ngetState\(request, response\);\s*\]\]><\/operation_script>/,
  'The installed workspace endpoint must only pass the ServiceNow request and response to getState.',
);

const stepFiles = (await readdir(update)).filter(name => /^sys_atf_step_[a-f0-9]+\.xml$/.test(name));
const legalSteps = (await Promise.all(stepFiles.map(async filename => {
  const xml = await readFile(new URL(filename, update), 'utf8');
  return { filename, script: xml.match(/<value>([^<]*?src\/server\/legal-workflow-test\.ts[^<]*)<\/value>/)?.[1] };
}))).filter(({ script }) => script);
assert.ok(legalSteps.length > 0, 'The package must contain the scripted legal workflow steps.');
for (const { filename, script } of legalSteps) {
  assert.doesNotMatch(script, /\{\{step\[/, filename + ' must read prior outputs using steps().');
  assert.doesNotThrow(() => new Script(script, { filename }));
}
