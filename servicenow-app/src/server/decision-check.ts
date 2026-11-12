import { RESTMessageV2 } from '@servicenow/glide/sn_ws';
import { buildDecisionRequest, decisionModel, decisionQuestionVersion, decisionResults } from './generated/decision-review.js';

type DecisionResponse = { getStatusCode(): number; getBody(): string };

function executeDecision(request, key): DecisionResponse {
  const message = new RESTMessageV2();
  message.setEndpoint('https://generativelanguage.googleapis.com/v1beta/decisions');
  message.setHttpMethod('POST');
  message.setHttpTimeout(8000);
  message.setRequestHeader('Content-Type', 'application/json');
  message.setRequestHeader('x-goog-api-key', key);
  message.setRequestBody(JSON.stringify(request));
  return message.execute();
}

export function addDecisionConfidence(input, result, key, execute = executeDecision) {
  const batch = buildDecisionRequest(input, result.claim_checks || []);
  if (!batch) return result;
  const { request, skippedClaimIds } = batch;
  const base = { model: decisionModel, question_version: decisionQuestionVersion, skipped_claim_ids: skippedClaimIds };
  const started = Date.now();
  try {
    const response = execute(request, key);
    const http = response.getStatusCode();
    if (http !== 200) return { ...result, decision_check: { ...base, status: 'unavailable', http_status: http, elapsed_ms: Date.now() - started } };
    const payload = JSON.parse(response.getBody());
    const answers = decisionResults(request, payload);
    const answered = Object.keys(answers).length;
    const expected = Object.keys(request.questions).length;
    return { ...result, decision_check: {
      ...base, status: answered === expected && !skippedClaimIds.length ? 'complete' : answered ? 'partial' : 'unavailable',
      elapsed_ms: Date.now() - started, input_tokens: payload.usage?.total_input_tokens, answers,
    } };
  } catch {
    return { ...result, decision_check: { ...base, status: 'unavailable', elapsed_ms: Date.now() - started } };
  }
}
