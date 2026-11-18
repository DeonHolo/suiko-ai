import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const operation = await readFile(
  new URL('../dist/app/update/sys_ws_operation_47f6ab35e47246e584e85d7eee076711.xml', import.meta.url),
  'utf8',
);
assert.match(operation, /<relative_path>\/state<\/relative_path>/);
assert.match(
  operation,
  /\ngetState\(request, response\);\s*\]\]><\/operation_script>/,
  'The installed workspace endpoint must only pass the ServiceNow request and response to getState.',
);
