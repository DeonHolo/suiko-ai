import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { parseProviderJson } from './provider-json.js';
import { checkAssessment, ReviewValidationError, validateReviewInput } from './assessment-checks.js';
export { ReviewValidationError } from './assessment-checks.js';

const ajv = new Ajv2020({ strict: true, allErrors: true, ownProperties: true });
const validateAssessment = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/ai-assessment.schema.json', import.meta.url), 'utf8')));
const validateRequest = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/ai-review.request.schema.json', import.meta.url), 'utf8')));



function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export async function reviewArticle(request, provider) {
  validateReviewInput(request, validateRequest);
  const snapshot = freeze(structuredClone(request));
  const assessment = parseProviderJson(await provider.generate(snapshot));
  if (!validateAssessment(assessment)) {
    throw new ReviewValidationError('INVALID_ASSESSMENT', 'The provider response does not match the assessment contract.',
      validateAssessment.errors.map(error => ({ path: error.instancePath || '/', message: error.message })));
  }
  return checkAssessment(snapshot, assessment);
}
