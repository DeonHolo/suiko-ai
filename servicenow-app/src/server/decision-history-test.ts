import { GlideRecord, GlideRecordSecure, gs } from '@servicenow/glide';
import {
  approveRule, configureProvider, getStories, getState, readStateForLegalTest, reviewSavedVersion, saveMetadata, saveRevision, saveRule,
  workflowActionForTest,
} from './workbench.ts';
import { postArchive } from './archive.ts';
import { approveSavedRule, listEditorialRules, setSavedRuleActive } from './editorial-rules.ts';
import { readSavedSources } from './read-sources.ts';

// BE-03 (#6) regressions: the shared human decision history already written by
// BE-01/BE-02, its readback shape and combined role access. These tests add
// evidence; they do not add a second decision table or writer. No model calls.

const decisionTable = 'x_2236136_suiko_ai_decision';
const storyTable = 'x_2236136_suiko_ai_story';
const editorRole = 'x_2236136_suiko_ai.editor';
const rulesRole = 'x_2236136_suiko_ai.rules_editor';
const legalRole = 'x_2236136_suiko_ai.legal_reviewer';
const capstoneStory = '89688f4583e4db106fffc629feaad327';
const capstoneRule = 'c1484b4583e4db106fffc629feaad326';
const fixtureSourceUrl = 'https://example.org/suiko-history-fixture';
// Test-only feature gates so the checks do not depend on the instance properties.
const features = { editor: true, legal: true };

function expect(value: unknown, message: string) {
  if (!value) throw new Error(message);
}

function action(handler, data?, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, {
    setStatus: value => { status = value; },
    setBody: value => { body = value; },
  });
  return { status, body };
}

function state(storyId: string) {
  const result = action((request, response) => readStateForLegalTest(request, response, features), null, { story: storyId });
  expect(result.status === 200 && !!result.body.workflow, 'The readable story state was not returned.');
  return result.body;
}

function decide(input) {
  return action((request, response) => workflowActionForTest(request, response, features), input);
}

function save(title: string, text: string, sourceUrls: string[] = []) {
  return action(saveRevision, {
    request_key: 'ATF-dec-' + gs.generateGUID(), title, text,
    notes: '', content_format: 'article', content_kind: 'news', source_urls: sourceUrls,
  });
}

function historyOf(storyId: string) {
  return state(storyId).workflow.history;
}

function assertOrdered(history, message: string) {
  const expected = history.slice().sort((a, b) =>
    String(b.decided_at || '').localeCompare(String(a.decided_at || '')) || String(b.id).localeCompare(String(a.id)));
  expect(history.map(entry => entry.id).join(',') === expected.map(entry => entry.id).join(','), message);
}

function assertNativeDenied(decisionId: string, message: string) {
  const native = new GlideRecordSecure(decisionTable);
  const loaded = native.get(decisionId);
  expect(!loaded || !native.canRead(), message + ' The row stayed readable.');
  const fixture = new GlideRecord(decisionTable);
  expect(fixture.get(decisionId) && !fixture.canWrite() && !fixture.canDelete(), message + ' The fixture was editable or deletable.');
}

function assertNativeAllowed(decisionId: string) {
  const native = new GlideRecordSecure(decisionTable);
  expect(native.get(decisionId) && native.canRead() && native.canWrite(),
    'An administrator could not read or correct a native decision row.');
  return native;
}

export function runDecisionEditorHistoryRegression() {
  expect(gs.hasRole(editorRole) && !gs.hasRole(rulesRole) && !gs.hasRole('admin'),
    'Use the dedicated everyday Editor.');
  const saved = save('ATF decision history story', 'The first fictional copy of the decision fixture.');
  expect(saved.status === 200 && saved.body.version === 1, 'The first fixture copy could not be saved.');
  const storyId = saved.body.story_id;
  const initial = state(storyId).workflow;

  const changes = decide({
    action: 'request_changes', revision_id: saved.body.id, expected_modified: initial.modified,
    note: 'Confirm the fictional opening time.',
  });
  expect(changes.status === 200, 'The Editor changes request failed: ' + JSON.stringify(changes.body));
  const first = changes.body.workflow.history.find(entry => entry.action === 'request_changes');
  expect(!!first && first.revision_id === saved.body.id && first.version === 1
    && first.actor_id === String(gs.getUserID()) && first.actor === gs.getUserDisplayName()
    && first.label === 'Changes requested' && first.note === 'Confirm the fictional opening time.'
    && !!first.decided_at, 'The decision history lost its actor, exact copy, label, note or UTC time.');

  const second = action(saveRevision, {
    request_key: 'ATF-dec-second-' + gs.generateGUID(), story_id: storyId,
    expected_revision_id: saved.body.id, title: 'ATF decision history story',
    text: 'The second fictional copy of the decision fixture.',
    notes: '', content_format: 'article', content_kind: 'news', source_urls: [],
  });
  expect(second.status === 200 && second.body.version === 2, 'The second fixture copy could not be saved.');
  const beforeSignOff = state(storyId).workflow;
  const signed = decide({
    action: 'sign_off', revision_id: second.body.id, expected_modified: beforeSignOff.modified,
  });
  expect(signed.status === 200, 'The Editor sign-off failed: ' + JSON.stringify(signed.body));
  const signOff = signed.body.workflow.history.find(entry => entry.action === 'sign_off');
  expect(!!signOff && signOff.revision_id === second.body.id && signOff.version === 2
    && signOff.label === 'Signed off' && signOff.actor_id === String(gs.getUserID()),
  'The sign-off did not keep its own exact version, label and actor.');

  const history = historyOf(storyId);
  expect(history.length === 2 && history.some(entry => entry.id === first.id)
    && history.some(entry => entry.id === signOff.id), 'The two accepted decisions were not returned once each.');
  expect(JSON.stringify(history.find(entry => entry.id === first.id)) === JSON.stringify(first),
    'Reopening the earlier decision changed its revision, actor, time, label or note.');
  assertOrdered(history, 'The history was not ordered newest first with a stable tie-break.');
  expect(historyOf(storyId).map(entry => entry.id).join(',') === history.map(entry => entry.id).join(','),
    'Repeated history reads returned a different order or different decisions.');

  const workspace = state(storyId);
  expect(workspace.can_manage_rules === false, 'An everyday Editor was offered rule management.');
  expect(Object.keys(workspace.provider).sort().join(',') === 'configured,model',
    'The Editor workspace exposed private provider configuration.');
  const config = new GlideRecordSecure('x_2236136_suiko_ai_config');
  config.query();
  expect(!config.next() || !config.canRead(), 'An everyday Editor could read native provider configuration.');
  expect(action(configureProvider, { model: 'gemini-3.5-flash-lite' }).status === 403,
    'A non-admin Editor reached provider configuration.');
  expect(action(saveRule, { rule_id: 'ATF-denied-' + gs.generateGUID(), title: 'ATF rule write denial',
    text: 'Check required attribution.', formats: ['article'], content_kinds: ['news'], priority: 'standard',
    origin: { kind: 'manual' } }).status === 403, 'An everyday Editor could save a rule.');
  assertNativeDenied(first.id, 'An everyday Editor could rewrite a native decision row.');
  return 'Passed as an everyday Editor: history returned both decisions once with actor, label, note, UTC time and exact versions in a stable order; native decision rows were unreadable and unwritable; rule management and provider configuration were denied.';
}

function historyRuleDefinition() {
  return { rule_id: 'ATF-history-rule-' + gs.generateGUID(), title: 'ATF attribution', text: 'Keep the original attribution.',
    formats: ['article'], content_kinds: ['news'], priority: 'standard', origin: { kind: 'manual' }, requires_sources: true };
}

function approvalInput(rule) {
  return { id: rule.id, version_id: rule.draft.id, expected_modified: rule.modified };
}

function approveHistoryRule(rule) {
  const result = approveSavedRule(approvalInput(rule));
  return result.rules.find(item => item.rule_id === rule.rule_id);
}

function createHistoryRule(definition = historyRuleDefinition()) {
  const createRule = action(saveRule, definition);
  expect(createRule.status === 200, 'The fictional rule draft could not be saved.');
  return createRule.body.rules.find(rule => rule.rule_id === definition.rule_id);
}

function setFixtureRuleActive(rule, active: boolean) {
  return setSavedRuleActive({ id: rule.id, active, expected_modified: rule.modified }).rules
    .find(item => item.id === rule.id);
}

function preserveEarlierReview(saved, firstDecision, definition, approved) {
  const run = action((request, response) => reviewSavedVersion(request, response, () => ({
    model: 'injected-history-fixture',
    generate(input) {
      const quote = { revision_id: input.candidate_revision.revision_id, segment_id: 'body-1', quote: saved.text };
      return { model: 'injected-history-fixture', raw: JSON.stringify({
        overview: 'This fictional story records an editor decision.', overview_evidence: [quote],
        claim_checks: [], findings: [],
        assessment: { status: 'reviewed', coverage: { revision_comparison: 'not_requested', metadata_suggestions: 'complete' },
          changes: [], limitations: [], policy_assessments: input.policy_pack.rules.map(rule => ({
            rule_id: rule.rule_id, status: 'not_applicable', reason: 'Fictional history fixture.', evidence: [], suggested_action: null,
          })), metadata_suggestions: { section: { suggested_id: null, reason: 'Fixture.', evidence: [] },
            tags: { suggested_ids: [], reason: 'Fixture.', evidence: [] },
            short_description: { suggested_text: saved.text, reason: 'From the draft.', evidence: [quote] } } },
      }) };
    },
  }), (urls, needed) => readSavedSources(urls, needed, url => ({
    status: 200, body: JSON.stringify({ data: { httpStatus: 200, url, finalUrl: url,
      text: 'The fictional exhibition plans to open in November.' } }),
  }))), { revision_id: saved.id, request_key: 'ATF-history-review-' + gs.generateGUID() });
  expect(run.status === 200 && run.body.state === 'complete',
    'The checked fictional review did not save: ' + JSON.stringify(run.body?.error || run.body?.message));
  expect(run.body.request.sources[0]?.passages[0]?.text === 'The fictional exhibition plans to open in November.',
    'The injected source passage was not saved.');
  expect(run.body.rules_current === true && run.body.request.input.policy_pack.rules.length === 12
    && run.body.request.input.policy_pack.rules.some(rule => rule.rule_id === definition.rule_id && rule.text === definition.text),
  'The full review did not save the original fixture rule wording.');
  const description = 'The editor wrote this fictional description.';
  const chosen = action(saveMetadata, { review_id: run.body.id, expected_modified: run.body.modified,
    metadata: { section: '', tags: [], description } });
  expect(chosen.status === 200 && chosen.body.metadata.description === description, 'The editor description was not saved.');
  const revised = action(saveRevision, { ...saved, text: 'A later fictional version changes the wording.',
    expected_revision_id: saved.id, request_key: 'ATF-history-next-' + gs.generateGUID() });
  expect(revised.status === 200 && revised.body.version === 2, 'The fictional second version did not save.');
  const change = action(saveRule, { ...definition, id: approved.id, expected_modified: approved.modified, text: 'Confirm the new attribution.' });
  expect(change.status === 200, 'The fictional rule replacement could not be saved.');
  const replacement = approveHistoryRule(change.body.rules.find(rule => rule.rule_id === definition.rule_id));
  expect(replacement.approved.definition.text !== definition.text, 'The active rule did not change.');
  const reopened = state(saved.story_id);
  const earlier = reopened.runs.find(item => item.id === run.body.id);
  expect(earlier?.revision_id === saved.id && earlier.rules_current === false
    && JSON.stringify(earlier.request) === JSON.stringify(chosen.body.request)
    && JSON.stringify(earlier.result) === JSON.stringify(chosen.body.result)
    && earlier.metadata.description === description,
  'The earlier review lost its original rule, passage, version or saved description.');
  expect(JSON.stringify(reopened.workflow.history.find(item => item.id === firstDecision.id)) === JSON.stringify(firstDecision),
    'A new revision and rule changed the earlier human decision.');
}

function checkRulesEditorHistory() {
  const saved = save('ATF rules editor decision story', 'A fictional copy reviewed by the designated rules editor.', [fixtureSourceUrl]);
  expect(saved.status === 200, 'The rules-editor fixture copy could not be saved.');
  const storyId = saved.body.story_id;
  const initial = state(storyId).workflow;
  const changes = decide({
    action: 'request_changes', revision_id: saved.body.id, expected_modified: initial.modified,
    note: 'Confirm the fictional rules-editor decision.',
  });
  expect(changes.status === 200, 'The Rules Editor changes request failed: ' + JSON.stringify(changes.body));
  const entry = changes.body.workflow.history.find(item => item.action === 'request_changes');
  expect(!!entry && entry.actor_id === String(gs.getUserID()) && entry.version === 1,
    'The Rules Editor decision history lost the actor or exact copy.');
  expect(state(storyId).can_manage_rules === true, 'The Rules Editor was not offered rule management.');
  assertNativeDenied(entry.id, 'A Rules Editor could rewrite a native decision row.');
  const definition = historyRuleDefinition();
  const draft = createHistoryRule(definition);
  const approved = approveHistoryRule(draft);
  try {
    preserveEarlierReview(saved.body, entry, definition, approved);
  } finally {
    setFixtureRuleActive(listEditorialRules().find(rule => rule.id === approved.id), false);
  }
}

export function runDecisionRulesEditorRegression() {
  expect(gs.hasRole(rulesRole) && gs.hasRole(editorRole) && !gs.hasRole('admin'),
    'Use the dedicated Rules Editor.');
  const active = listEditorialRules().filter(rule => rule.active);
  expect(active.length <= 12, 'The test instance already exceeds the active rule limit.');
  const filler = [];
  let paused;
  try {
    for (let count = active.length; count < 12; count++) {
      filler.push(approveHistoryRule(createHistoryRule({ ...historyRuleDefinition(), requires_sources: false })));
    }
    // The fixed capstone rule is never edited. Prefer a disposable filler for
    // the full-rulebook case. ATF rolls back the whole test, including counts.
    const spare = filler[filler.length - 1] || active.find(rule => rule.id !== capstoneRule);
    const overCapacity = action(approveRule, approvalInput(createHistoryRule()));
    expect(overCapacity.status === 400 && overCapacity.body.message.includes('twelve rules'),
      'A thirteenth rule was not rejected.');
    paused = setFixtureRuleActive(spare, false);
    checkRulesEditorHistory();
    setFixtureRuleActive(paused, true);
    paused = undefined;
    expect(listEditorialRules().filter(rule => rule.active).length === 12, 'The full rulebook was not restored.');
  } finally {
    if (paused && !filler.some(rule => rule.id === paused.id)) setFixtureRuleActive(paused, true);
    for (const rule of listEditorialRules().filter(rule => rule.active && filler.some(item => item.id === rule.id))) {
      setFixtureRuleActive(rule, false);
    }
  }
  expect(listEditorialRules().filter(rule => rule.active).map(rule => rule.id).join(',')
    === active.map(rule => rule.id).join(','), 'The test left a different set of active rules.');
  return 'Passed as Rules Editor: native decisions were restricted. A full rulebook refused another approval. With one slot available the earlier review, quoted evidence, original rule, saved description and exact human decision survived a new revision and rule.';
}

export function runDecisionLegalOnlyRegression() {
  expect(gs.hasRole(legalRole) && !gs.hasRole(editorRole) && !gs.hasRole(rulesRole) && !gs.hasRole('admin'),
    'Use the dedicated legal-only account.');
  const denied = action((request, response) => readStateForLegalTest(request, response, features), null,
    { story: capstoneStory });
  expect(denied.status === 403 && !denied.body?.workflow,
    'A legal-only account read the Editor workspace or its history.');
  expect(decide({ action: 'sign_off', revision_id: capstoneStory, expected_modified: '0', note: '' }).status === 403,
    'A legal-only account reached an Editor decision.');
  expect(action(getStories, null).status === 403, 'A legal-only account read the Editor story list.');
  expect(action(configureProvider, { model: 'gemini-3.5-flash-lite' }).status === 403,
    'A legal-only account reached provider configuration.');
  return 'Passed as a legal-only reviewer: Editor state, Editor decisions, the story list and provider configuration were all denied before any record was read.';
}

export function runDecisionOutsiderRegression() {
  expect(!gs.hasRole(editorRole) && !gs.hasRole(rulesRole) && !gs.hasRole(legalRole) && !gs.hasRole('admin'),
    'Use the dedicated no-role account.');
  expect(action((request, response) => readStateForLegalTest(request, response, features), null,
    { story: capstoneStory }).status === 403, 'A no-role account read the Editor workspace.');
  expect(decide({ action: 'request_changes', revision_id: capstoneStory, expected_modified: '0', note: 'x' }).status === 403,
    'A no-role account reached an Editor decision.');
  expect(action(getStories, null).status === 403 && action(configureProvider, {}).status === 403,
    'A no-role account reached the story list or provider configuration.');
  return 'Passed as a no-role account: history, decisions, the story list and provider configuration were denied.';
}

export function runDecisionAdminRegression() {
  expect(gs.hasRole('admin'), 'Run the admin step as the suite administrator.');
  const saved = save('ATF retained decision story', 'A fictional copy retained by a human decision.');
  expect(saved.status === 200, 'The admin fixture copy could not be saved.');
  const storyId = saved.body.story_id;
  const initial = state(storyId).workflow;
  const changes = decide({
    action: 'request_changes', revision_id: saved.body.id, expected_modified: initial.modified,
    note: 'Confirm the fictional admin decision.',
  });
  expect(changes.status === 200, 'The admin decision failed: ' + JSON.stringify(changes.body));
  const entry = changes.body.workflow.history.find(item => item.action === 'request_changes');

  const native = assertNativeAllowed(entry.id);
  expect(String(native.getValue('actor')) === String(gs.getUserID())
    && native.getValue('action') === 'request_changes' && !!native.getValue('decided_at')
    && String(native.getValue('revision')) === saved.body.id,
  'The native decision row lost its actor, action, UTC time or exact revision.');

  const before = action(getState, null).body.provider;
  const invalid = action(configureProvider, { model: 'not-a-supported-model' });
  const after = action(getState, null).body.provider;
  expect(invalid.status === 400 && JSON.stringify(after) === JSON.stringify(before),
    'An invalid provider request was not rejected before changing the saved provider.');

  const archived = action(postArchive, {
    action: 'archive', kind: 'story', id: storyId, expected_modified: state(storyId).story.modified,
  });
  expect(archived.status === 200, 'The retained-decision story could not be archived: ' + JSON.stringify(archived.body));
  const archivedState = state(storyId);
  expect(archivedState.workflow.history.some(item => item.id === entry.id),
    'The retained decision was hidden while the story was archived.');
  const retained = action(postArchive, {
    action: 'delete', kind: 'story', id: storyId, expected_modified: archivedState.story.modified,
  });
  expect(retained.status === 409
    && String(retained.body?.message || '').includes('Retained editor decision history depends on this story.'),
  'Retained human decisions did not block permanent deletion: ' + JSON.stringify(retained.body));
  const stored = new GlideRecord(storyTable);
  expect(stored.get(storyId) && stored.getValue('archived') === '1',
    'The refused deletion removed or restored the story.');
  const restored = action(postArchive, {
    action: 'restore', kind: 'story', id: storyId, expected_modified: archivedState.story.modified,
  });
  expect(restored.status === 200, 'The retained-decision story could not be restored.');
  expect(JSON.stringify(historyOf(storyId).find(item => item.id === entry.id)) === JSON.stringify(entry),
    'Restoring the story changed its earlier decision.');
  return 'Passed as admin: the native decision row kept its actor, action, time and exact revision; an invalid provider request changed nothing; and a retained human decision kept the archived story from deletion and readable until restore.';
}
