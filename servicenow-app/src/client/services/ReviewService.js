const base = '/api/x_2236136_suiko_ai/v1/workbench';

async function call(path, payload) {
  const response = await fetch(base + path, {
    method: payload ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-UserToken': window.g_ck || '' },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const body = await response.json();
  const result = body.result ?? body;
  if (!response.ok) throw new Error(result.message || body.error?.message || 'The action could not finish. Your saved drafts are in history.');
  return result;
}

export const reviewService = {
  state: storyId => call('/state' + (storyId ? '?story=' + encodeURIComponent(storyId) : '')),
  save: payload => call('/revisions', payload),
  review: (revisionId, decisionCheck) => call('/reviews', {
    revision_id: revisionId, request_key: crypto.randomUUID(), decision_check: decisionCheck,
  }),
  metadata: (review, metadata) => call('/metadata', {
    review_id: review.id, expected_modified: review.modified, metadata,
  }),
  rule: payload => call('/rules', payload),
  approveRule: rule => call('/rules/approve', { id: rule.id, version_id: rule.draft.id, expected_modified: rule.modified }),
  setRuleActive: (rule, active) => call('/rules/active', { id: rule.id, active, expected_modified: rule.modified }),
  policies: version => call('/policies' + (version ? '?version=' + encodeURIComponent(version) : '')),
  savePolicy: payload => call('/policies', payload),
  suggestPolicy: (policy, passageId) => call('/policies/suggest', { policy_version_id: policy.id, passage_id: passageId }),
};
