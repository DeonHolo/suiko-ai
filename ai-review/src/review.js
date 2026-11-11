import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { visit } from 'jsonc-parser';
import { checkAssessment, ReviewValidationError } from './assessment-checks.js';
export { ReviewValidationError } from './assessment-checks.js';

const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validateAssessment = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/ai-assessment.schema.json', import.meta.url), 'utf8')));
const validateRequest = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/ai-review.request.schema.json', import.meta.url), 'utf8')));


function parseProviderJson(raw) {
  if (typeof raw !== 'string' || Buffer.byteLength(raw, 'utf8') > 262144) {
    throw new ReviewValidationError('INVALID_PROVIDER_JSON', 'The provider must return a JSON string no larger than 256 KiB.');
  }
  const objects = [];
  try {
    visit(raw, {
      onObjectBegin() { objects.push(new Set()); },
      onObjectProperty(property) {
        const keys = objects.at(-1);
        if (keys.has(property)) throw new Error('Duplicate JSON key.');
        keys.add(property);
      },
      onObjectEnd() { objects.pop(); },
      onError() { throw new Error('Malformed JSON.'); },
    }, { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false });
    return JSON.parse(raw);
  } catch {
    throw new ReviewValidationError('INVALID_PROVIDER_JSON', 'The provider response must be strict JSON with no duplicate keys.');
  }
}

function verifyRequest(request) {
  if (!validateRequest(request)) {
    throw new ReviewValidationError('INVALID_REQUEST', 'The request does not match the review contract.',
      validateRequest.errors.map(error => ({ path: error.instancePath || '/', message: error.message })));
  }
  const unique = items => new Set(items).size === items.length;
  const revisions = [request.baseline_revision, request.candidate_revision].filter(Boolean);
  if (!unique(revisions.map(revision => revision.revision_id)) ||
      !unique(request.policy_pack.rules.map(rule => rule.rule_id)) ||
      !unique(request.taxonomy.sections.map(section => section.id)) ||
      !unique(request.taxonomy.tags.map(tag => tag.id))) {
    throw new ReviewValidationError('INVALID_REQUEST', 'Revision, rule, and taxonomy identities must be unambiguous.');
  }
  for (const revision of revisions) {
    if (!unique(revision.segments.map(segment => segment.segment_id)) ||
        revision.segments.reduce((total, segment) => total + [...segment.text].length, 0) > 12000 ||
        !revision.segments.some(segment => segment.text.trim())) {
      throw new ReviewValidationError('INVALID_REQUEST', 'Each revision needs unique segments and readable text within the 12,000-character limit.');
    }
  }
}


function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export async function reviewArticle(request, provider) {
  verifyRequest(request);
  const snapshot = freeze(structuredClone(request));
  const assessment = parseProviderJson(await provider.generate(snapshot));
  if (!validateAssessment(assessment)) {
    throw new ReviewValidationError('INVALID_ASSESSMENT', 'The provider response does not match the assessment contract.',
      validateAssessment.errors.map(error => ({ path: error.instancePath || '/', message: error.message })));
  }
  return checkAssessment(snapshot, assessment);
}
