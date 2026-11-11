import assert from 'node:assert/strict';
import { createPdiClient, instance } from './pdi-client.mjs';

const client = await createPdiClient();
const state = await client('/api/x_2236136_suiko_ai/v1/workbench/state');
assert.ok(Array.isArray(state.stories) && Array.isArray(state.rules), 'The review API must return saved stories and editable rules.');
const page = await client('/x_2236136_suiko_ai_review.do', { text: true });
assert.match(page, /Suiko AI/);
console.log(JSON.stringify({
  app: 'Suiko AI', instance, page: 'reachable', api: 'reachable',
  rules: state.rules.length, gemini_configured: state.provider.configured,
}));
