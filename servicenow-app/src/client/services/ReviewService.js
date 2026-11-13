const base = '/api/x_2236136_suiko_ai/v1/workbench';

async function call(path, payload, service = base) {
  const response = await fetch(service + path, {
    method: payload ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-UserToken': window.g_ck || '' },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  let body;
  try { body = await response.json(); }
  catch { throw new Error('Suiko could not open this. Try again or sign back in.'); }
  const result = body.result ?? body;
  if (!response.ok) throw new Error(result.message || body.error?.message || 'The action could not finish. Your saved drafts are in history.');
  return result;
}

export const reviewService = {
  state: storyId => call('/state' + (storyId ? '?story=' + encodeURIComponent(storyId) : '')),
  save: payload => call('/revisions', payload),
  review: revisionId => call('/reviews', {
    revision_id: revisionId, request_key: crypto.randomUUID(),
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

const legal = '/api/x_2236136_suiko_ai/v1/legal';
export const workspaceService = {
  stories: ({ search, status, cursor }) => call('/stories?' + new URLSearchParams({ q: search, status, cursor })),
  archive: ({ kind, cursor }) => call('/archive?' + new URLSearchParams({ kind, cursor })),
  changeArchive: (action, kind, item) => call('/archive', { action, kind, id: item.id, expected_modified: item.modified }),
  workflowAction: payload => call('/workflow/actions', payload),
  legal: task => call('/tasks' + (task ? '?task=' + encodeURIComponent(task) : ''), undefined, legal),
  legalDecision: payload => call('/tasks/decision', payload, legal),
};
