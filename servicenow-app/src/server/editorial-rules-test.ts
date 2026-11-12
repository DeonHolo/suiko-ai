import { GlideRecord, gs } from '@servicenow/glide';
import { saveRule, approveRule, setRuleActive, saveRevision, getState } from './workbench.ts';
import { approveSavedRule, listEditorialRules, setSavedRuleActive } from './editorial-rules.ts';
import { approvedRulesForReview } from './generated/editorial-rules.js';

function expect(value, message) {
  if (!value) throw new Error(message);
}
function action(handler, data) {
  let status = 200;
  let body;
  handler({ body: { data } }, { setStatus: value => { status = value; }, setBody: value => { body = value; } });
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
  for (const handler of [saveRule, approveRule, setRuleActive]) {
    expect(action(handler, {}).status === 403, 'The everyday editor could change shared rules.');
  }
  const saved = action(saveRevision, {
    request_key: 'ATF-editor-' + gs.generateGUID(), title: 'ATF everyday editor draft', text: 'A fictional crew rehearses a scene.',
    notes: '', content_format: 'script', content_kind: 'opinion', source_urls: [],
  });
  expect(saved.status === 200 && !!saved.body.id, 'The everyday editor could not save a story.');
  let state;
  getState({ queryParams: { story: saved.body.story_id } }, { setBody: value => { state = value; }, setStatus: value => { throw new Error('State failed: ' + value); } });
  expect(state.can_manage_rules === false && state.revisions[0].text === 'A fictional crew rehearses a scene.', 'The everyday editor state did not preserve its role boundary or saved draft.');
  return 'Passed as a non-admin everyday editor: story save/reopen allowed; all three shared-rule actions denied. No Gemini calls.';
}
