import { GlideRecord, gs } from '@servicenow/glide';
import { saveRule, approveRule, setRuleActive, saveRevision, getState, savePolicy, getPolicies, suggestPolicyChecks, executeGemini, proposePolicyChecks } from './workbench.ts';
import { approveSavedRule, listEditorialRules, setSavedRuleActive } from './editorial-rules.ts';
import { approvedRulesForReview } from './generated/editorial-rules.js';

function expect(value, message) {
  if (!value) throw new Error(message);
}
function action(handler, data, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, { setStatus: value => { status = value; }, setBody: value => { body = value; } });
  return { status, body };
}
function current(result, identity) {
  expect(result.status === 200, 'Rule action failed: ' + JSON.stringify(result.body));
  const rule = result.body.rules.find(item => item.rule_id === identity);
  expect(!!rule, 'Saved rule was not returned.');
  return rule;
}

function approvalInput(rule) {
  return { id: rule.id, version_id: rule.draft.id, expected_modified: rule.modified };
}

function expectCapacityRejection(rule) {
  try {
    approveSavedRule(approvalInput(rule), () => 12);
  } catch (error) {
    expect(error.status === 400 && error.message.includes('twelve rules'), 'A full pack did not report the capacity limit.');
    const saved = listEditorialRules().find(item => item.id === rule.id);
    expect(!saved.active && !saved.approved && saved.modified === rule.modified, 'The capacity rejection changed the saved proposal.');
    return;
  }
  throw new Error('The thirteenth rule was approved.');
}

export function runRuleManagerRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  const identity = 'ATF-' + gs.generateGUID();
  const definition = {
    title: 'ATF headline wording fixture', text: 'Keep the uncertainty stated in the reporting.', priority: 'standard',
    formats: ['article'], content_kinds: ['news'], conditions: 'When the headline describes a proposed plan.',
    human_checks: ['The editor decides whether the wording is appropriate.'], origin: { kind: 'manual' },
  };
  let rule = current(action(saveRule, { rule_id: identity, ...definition }), identity);
  expect(rule.pending && !rule.active && !rule.approved, 'An unapproved proposal became active.');
  // Use a controlled pack for capacity. This test does not turn off anyone's saved rules.
  expectCapacityRejection(rule);
  const fixtureCapacity = () => 11;
  const firstProposal = rule.draft.id;
  const firstApproval = approvalInput(rule);
  const staleEdit = { id: rule.id, rule_id: identity, ...definition, expected_modified: rule.modified };
  rule = approveSavedRule(firstApproval, fixtureCapacity).rules.find(item => item.rule_id === identity);
  expect(rule.active && rule.approved.definition.text === definition.text, 'The first approval did not capture the saved wording.');
  expect(rule.approved.approval.by === String(gs.getUserID()), 'The approval did not identify the actual editor.');
  expect(action(approveRule, firstApproval).status === 409, 'A repeated approval with the old revision token was accepted.');
  expect(action(saveRule, staleEdit).status === 409, 'A stale edit was accepted after approval changed the rule.');
  const first = JSON.stringify(rule.approved);
  expect(action(approveRule, approvalInput(rule)).status === 409, 'The same version was approved twice with a fresh revision token.');
  const afterRetry = listEditorialRules().find(item => item.id === rule.id);
  expect(afterRetry.modified === rule.modified && JSON.stringify(afterRetry.approved) === first, 'Repeat approval rewrote the original record.');
  const stale = { id: rule.id, version_id: firstProposal, expected_modified: rule.modified };

  // Model the retained version from an interrupted concurrent proposal.
  const interrupted = new GlideRecord('x_2236136_suiko_ai_rule_version');
  interrupted.initialize();
  interrupted.setValue('parent_rule', rule.id);
  interrupted.setValue('version', rule.version + 1);
  interrupted.setValue('version_key', rule.id + ':' + (rule.version + 1));
  interrupted.setValue('definition_json', JSON.stringify(definition));
  expect(!!interrupted.insert(), 'Could not prepare the interrupted-proposal fixture.');

  rule = current(action(saveRule, { id: rule.id, rule_id: identity, expected_modified: rule.modified,
    ...definition, text: 'Preserve uncertainty in both the headline and public caption.' }), identity);
  expect(rule.pending && rule.active && JSON.stringify(rule.approved) === first, 'A proposed replacement changed the active approval.');
  expect(approvedRulesForReview([rule])[0].text === definition.text, 'Review input used the unapproved replacement.');
  expect(action(approveRule, stale).status === 409, 'A stale approval was not rejected.');
  expect(action(approveRule, { ...stale, expected_modified: rule.modified }).status === 409, 'An old version identity approved the replacement.');

  const secondProposal = rule.draft.id;
  rule = approveSavedRule(approvalInput(rule), fixtureCapacity).rules.find(item => item.rule_id === identity);
  expect(rule.approved.version_id === secondProposal && rule.approved.definition.text !== definition.text, 'The replacement approval did not identify its exact saved version.');
  const original = new GlideRecord('x_2236136_suiko_ai_rule_version');
  expect(original.get(firstProposal), 'The original rule version disappeared.');
  expect(JSON.parse(original.getValue('definition_json')).text === definition.text, 'The original rule wording was overwritten.');
  expect(JSON.stringify(JSON.parse(original.getValue('approval_json'))) === JSON.stringify(JSON.parse(first).approval), 'The original approval details were overwritten.');
  const second = JSON.stringify(rule.approved);
  rule = current(action(setRuleActive, { id: rule.id, active: false, expected_modified: rule.modified }), identity);
  expect(!rule.active && JSON.stringify(rule.approved) === second, 'Turning a rule off changed its approval record.');
  rule = setSavedRuleActive({ id: rule.id, active: true, expected_modified: rule.modified }, fixtureCapacity).rules.find(item => item.rule_id === identity);
  expect(rule.active && JSON.stringify(rule.approved) === second, 'Re-enabling an approved rule changed its wording or approval.');
  return 'Passed as a non-admin rules editor: capacity rejection, one approval per saved version, stale edits, pending replacement, retained interrupted version, original approval and disable/re-enable.';
}

export function runEverydayEditorRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.editor') && !gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated everyday-editor test user.');
  for (const handler of [saveRule, approveRule, setRuleActive, getPolicies, savePolicy, suggestPolicyChecks]) {
    expect(action(handler, {}).status === 403, 'The everyday editor could change rules or open company-policy setup.');
  }
  const saved = action(saveRevision, {
    request_key: 'ATF-editor-' + gs.generateGUID(), title: 'ATF everyday editor draft', text: 'A fictional crew rehearses a scene.',
    notes: '', content_format: 'script', content_kind: 'opinion', source_urls: [],
  });
  expect(saved.status === 200 && !!saved.body.id, 'The everyday editor could not save a story.');
  let state;
  getState({ queryParams: { story: saved.body.story_id } }, { setBody: value => { state = value; }, setStatus: value => { throw new Error('State failed: ' + value); } });
  expect(state.can_manage_rules === false && state.revisions[0].text === 'A fictional crew rehearses a scene.', 'The everyday editor state did not preserve its role boundary or saved draft.');
  return 'Passed as a non-admin everyday editor: story save/reopen allowed; shared-rule and company-policy setup actions denied. No Gemini calls.';
}

export function runPolicySetupRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  const text = 'A proposal remains pending unless the council records a vote.\n\nThe editor confirms the recorded vote.';
  const payload = { title: 'ATF handbook', text, request_key: 'ATF-' + gs.generateGUID() };
  const saved = action(savePolicy, payload);
  expect(saved.status === 200 && saved.body.policy.text === text, 'The saved policy lost its original text.');
  const policy = saved.body.policy;
  const repeated = action(savePolicy, payload);
  expect(repeated.status === 200 && repeated.body.policy.id === policy.id, 'Retrying a save made a second copy.');
  expect(action(savePolicy, { ...payload, text: 'Different wording.' }).status === 409, 'A conflicting save reused the old request.');
  const replacement = action(savePolicy, { ...payload, text: 'Revised wording.', request_key: 'ATF-' + gs.generateGUID() });
  expect(replacement.status === 200 && replacement.body.policy.id !== policy.id, 'An edited policy overwrote the original copy.');
  const old = action(getPolicies, {}, { version: policy.id });
  expect(old.status === 200 && old.body.policy.text === text, 'The original policy copy could not be reopened.');

  const ruleId = 'ATF-' + gs.generateGUID();
  const definition = {
    rule_id: ruleId, title: 'ATF policy headline', text: policy.passages[0].text, priority: 'standard',
    formats: ['article'], content_kinds: ['news'], origin: { kind: 'policy', policy_version_id: policy.id, passage_ids: ['policy-1'] },
  };
  expect(action(saveRule, { ...definition, origin: { ...definition.origin, passage_ids: ['policy-99'] } }).status === 400, 'A forged policy reference was accepted.');
  const draft = current(action(saveRule, definition), ruleId);
  expect(draft.pending && !draft.active && draft.text === policy.passages[0].text, 'The original wording was changed or activated without approval.');
  const approved = approveSavedRule(approvalInput(draft), () => 0).rules.find(rule => rule.rule_id === ruleId);
  expect(approved.active && approved.approved.definition.origin.policy_version_id === policy.id && approved.approved.definition.text === policy.passages[0].text, 'Approval lost the saved policy reference or verbatim wording.');

  const before = JSON.stringify(listEditorialRules());
  let calls = 0;
  let fallbackEndpoint = '';
  const fakeReply = { proposals: [{ ...definition, conditions: '', human_checks: [], checks: ['text_review'],
    evidence: [{ passage_id: 'policy-1', quote: policy.passages[0].text }] }], questions: [] };
  const message = {
    setEndpoint: url => { fallbackEndpoint = url; },
    execute: () => {
      calls++;
      return calls === 1 ? { getStatusCode: () => 503 } : {
        getStatusCode: () => 200,
        getBody: () => JSON.stringify({ modelVersion: 'gemini-3.1-flash-lite',
          candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(fakeReply) }] } }] }),
      };
    },
  };
  const suggestions = proposePolicyChecks({ policy_version_id: policy.id },
    () => executeGemini(message, 'gemini-3.5-flash-lite', 'suggest checks', 'The saved policy is available.'));
  expect(calls === 2 && fallbackEndpoint.endsWith('/gemini-3.1-flash-lite:generateContent'), 'Policy suggestions did not retry the expected model.');
  expect(suggestions.model === 'gemini-3.1-flash-lite' && suggestions.proposals.length === 1, 'The fallback did not retain a usable suggestion.');
  let failed = false;
  try {
    proposePolicyChecks({ policy_version_id: policy.id }, () => ({ raw: 'Unreadable JSON' }));
  } catch (error) {
    failed = error.code === 'INVALID_POLICY_INPUT';
  }
  expect(failed, 'A failed suggestion was accepted.');
  expect(JSON.stringify(listEditorialRules()) === before, 'The suggestion or failed reply changed the approved rules.');
  return 'Passed as rules editor: saved copies, repeat saves, exact passage references, approval, fallback from a simulated 503, and unchanged rules after a failed reply. No live Gemini calls.';
}
