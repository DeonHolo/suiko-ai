export async function readProviderReply(response) {
  const http = response.status;
  const raw_body = await response.text();
  try { return { http, raw_body, payload: JSON.parse(raw_body) }; }
  catch { return { http, raw_body, payload: null, decode_error: 'The provider returned a non-JSON body.' }; }
}

export function evaluationFailed(result) {
  const expectedGaps = new Set(['MISSING_EVIDENCE', 'DESCRIPTION_NEEDS_CONFIRMATION']);
  return !!(result.failure || result.issues?.some(code => !expectedGaps.has(code))
    || result.comparisons?.some(check => !check.match)
    || result.claims?.some(check => !check.matches.length || check.matches.some(match => !match.match))
    || (result.decision && (result.decision.http !== 200 || !result.decision.coverage_complete
      || result.decision.comparisons.some(check => !check.match))));
}
