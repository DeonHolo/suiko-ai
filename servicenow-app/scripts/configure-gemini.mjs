import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { createPdiClient } from './pdi-client.mjs';

const config = parseEnv(await readFile(new URL('../../ai-review/.env.local', import.meta.url), 'utf8'));
if (!config.GEMINI_API_KEY?.trim()) throw new Error('Add the Gemini key to ai-review/.env.local first.');
const client = await createPdiClient();
const result = await client('/api/x_2236136_suiko_ai/v1/workbench/provider', {
  method: 'POST',
  body: { api_key: config.GEMINI_API_KEY.trim(), model: config.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite' },
});
console.log(JSON.stringify({ configured: result.configured, model: result.model }));
