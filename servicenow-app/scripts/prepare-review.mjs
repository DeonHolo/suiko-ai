import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import standaloneCode from 'ajv/dist/standalone/index.js';
import unicodeLengthModule from 'ajv/dist/runtime/ucs2length.js';

const project = new URL('../', import.meta.url);
const workspace = new URL('../../', import.meta.url);
const output = new URL('src/server/generated/', project);
await mkdir(output, { recursive: true });
const load = async path => JSON.parse(await readFile(new URL(path, workspace), 'utf8'));
const request = await load('contracts/ai-review.request.schema.json');
const assessment = await load('contracts/ai-assessment.schema.json');
const nested = structuredClone(assessment);
delete nested.$schema;
delete nested.$defs;
const response = {
  $id: 'urn:suiko-ai:workbench-result:1',
  type: 'object',
  additionalProperties: false,
  required: ['overview', 'assessment', 'findings'],
  $defs: assessment.$defs,
  properties: {
    overview: { type: 'string', minLength: 1, maxLength: 1500 },
    assessment: nested,
    findings: {
      type: 'array', maxItems: 24,
      items: {
        type: 'object', additionalProperties: false,
        required: ['rule_id', 'summary', 'action', 'evidence'],
        properties: {
          rule_id: { type: 'string', minLength: 1, maxLength: 100 },
          summary: { type: 'string', minLength: 1, maxLength: 1500 },
          action: { type: 'string', minLength: 1, maxLength: 1500 },
          evidence: { type: 'array', minItems: 1, items: { $ref: '#/$defs/evidence' } },
        },
      },
    },
  },
};
const ajv = new Ajv2020({
  strict: true, allErrors: true, ownProperties: true,
  code: { source: true, esm: true, lines: true },
});
ajv.addSchema(request, 'request');
ajv.addSchema(response, 'response');
let validators = standaloneCode(ajv, {
  validateRequest: 'request', validateReview: 'response',
});
const unicodeHelper = 'require("ajv/dist/runtime/ucs2length").default';
validators = validators.replaceAll(unicodeHelper, 'unicodeLength');
const unicodeLength = typeof unicodeLengthModule === 'function' ? unicodeLengthModule : unicodeLengthModule.default;
const helper = 'const unicodeLength = ' + unicodeLength.toString() + ';\n';
await writeFile(new URL('validators.js', output), helper + validators);
await rm(new URL('validators.cjs', output), { force: true });
await writeFile(new URL('assessment-checks.js', output),
  await readFile(new URL('ai-review/src/assessment-checks.js', workspace), 'utf8'));
const promptFile = await readFile(new URL('prompts/editorial-review-v0.4.md', workspace), 'utf8');
const original = promptFile.match(/^## System instruction\r?\n([\s\S]+?)^## Adapter notes/m)?.[1]?.trim();
if (!original) throw new Error('The editorial review prompt is missing its system instruction.');
const additions = [
  'Return the supplied workbench response envelope with overview, assessment, and findings.',
  'Always write a short internal overview for the editor. It should describe this draft even when no rule raises a concern. It is separate from the public metadata description.',
  'Assess every supplied rule once in assessment.policy_assessments. The findings list may contain several distinct concerns under one rule. Each finding must cite its rule and exact current-revision evidence. Every potential_conflict needs at least one finding. Keep findings empty when no rule raises a concern.',
  'Segments marked production_notes or source_notes are internal context. They may explain sourcing or permissions and can support a finding. Suggested public metadata must cite only title, body, or caption segments.',
  'A source named in a draft or supplied note can satisfy a sourcing rule. A supplied link identifies a source but you have not visited it. Assess what the editor was given. Avoid demanding a source for ordinary transitions or clearly identified opinion.',
];
const remove = new Set(['$schema', '$id', 'minLength', 'maxLength', 'minItems', 'maxItems', 'uniqueItems']);
const providerSchema = JSON.parse(JSON.stringify(response), (key, value) => remove.has(key) ? undefined : value);
const profile = await load('ai-review/fixtures/news-article-profile.json');
profile.taxonomy.tags.push(
  { id: 'environment', label: 'Environment' }, { id: 'volunteering', label: 'Volunteering' },
  { id: 'local-government', label: 'Local government' }, { id: 'education', label: 'Education' },
  { id: 'libraries', label: 'Libraries' }, { id: 'video', label: 'Video' },
);
const data = {
  prompt: original + '\n\n' + additions.join('\n'),
  promptVersion: '0.4-workbench-1', providerSchema, taxonomy: profile.taxonomy,
};
await writeFile(new URL('review-data.js', output), 'export default ' + JSON.stringify(data, null, 2) + ';\n');
await rm(new URL('review-data.json', output), { force: true });
console.log('Prepared the shared prompt, schemas, and quote checks.');
