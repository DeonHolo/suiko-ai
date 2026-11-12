import { ReviewValidationError } from './assessment-checks.js';
import { parseProviderJson } from './provider-json.js';
import { checkWorkbenchResult } from './workbench-review.js';

// The production handler and the ServiceNow server test use this same save path.
// generate is synchronous because ServiceNow's RESTMessageV2 executes on the server.
export function persistReviewAttempt(run, input, generate, validators, finish = result => result) {
  try {
    const raw = generate();
    if (typeof raw !== 'string') throw new ReviewValidationError('INVALID_PROVIDER_JSON', 'Gemini did not return readable review text. Your saved version is available for a retry.');
    run.setValue('response_json', JSON.stringify({ unparsed_text: raw.slice(0, 12000), truncated: raw.length > 12000 }));
    const reply = parseProviderJson(raw);
    const unchecked = JSON.stringify(reply);
    run.setValue('response_json', unchecked.length <= 199000 ? unchecked
      : JSON.stringify({ unverified_excerpt: unchecked.slice(0, 12000), truncated: true }));
    const checked = JSON.stringify(finish(checkWorkbenchResult(input, reply, validators, { requireOverviewEvidence: true })));
    if (checked.length > 199000) throw new ReviewValidationError('SAVED_RESULT_LIMIT', 'The review exceeded the saved-result limit. Your saved version is available for a retry.');
    run.setValue('response_json', checked);
    run.setValue('error_json', '');
    run.setValue('state', 'complete');
  } catch (error) {
    const known = error instanceof ReviewValidationError;
    run.setValue('error_json', JSON.stringify({
      code: known ? error.code : 'REVIEW_FAILED',
      message: known ? error.message : 'The AI review could not be verified. Your draft is saved and you can retry or review it manually.',
      details: known ? error.issues || null : null,
    }));
    run.setValue('state', 'failed');
  } finally {
    run.setValue('active_revision', '');
    if (!run.update()) throw new ReviewValidationError('REVIEW_SAVE_FAILED', 'The review result could not be saved. Reload the story before retrying.');
  }
}
