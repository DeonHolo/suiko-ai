import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { command, sdk, createPdiClient } from './pdi-client.mjs';

const config = JSON.parse(await readFile(new URL('../now.config.json', import.meta.url), 'utf8'));
const client = await createPdiClient();
const scopes = await client('/api/now/table/sys_scope?sysparm_query=scope%3D' +
  encodeURIComponent(config.scope) + '&sysparm_fields=sys_id,scope&sysparm_limit=2');
if (scopes.some(scope => scope.sys_id !== config.scopeId)) {
  throw new Error('The instance already has this scope with a different app ID. Import that app before pushing.');
}
await command(process.execPath, ['--test'], { cwd: fileURLToPath(new URL('../../ai-review/', import.meta.url)) });
await command(process.execPath, [fileURLToPath(new URL('prepare-review.mjs', import.meta.url))]);
await sdk(['build']);
const auth = process.env.SN_SDK_NODE_ENV === 'SN_SDK_CI_INSTALL' ? [] : ['--auth', 'suiko-pdi'];
await sdk(['install', ...auth]);
await command(process.execPath, [fileURLToPath(new URL('smoke-pdi.mjs', import.meta.url))]);
