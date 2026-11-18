import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide';
import { saveRevision, getState, saveRule, approveRule, reviewSavedVersion } from './workbench.ts';
import { getArchive, postArchive } from './archive.ts';
import { readSavedSources } from './read-sources.ts';

// FE-02 (#2) regressions: archive, restore and guarded deletion. The steps run as
// dedicated users. ATF rolls back only fictional fixtures. No Gemini or edits
// to shared acceptance records.

const capstoneStory = '89688f4583e4db106fffc629feaad327';
const capstoneRule = 'c1484b4583e4db106fffc629feaad326';

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
function storyState(storyId) {
  let state;
  getState({ queryParams: { story: storyId } }, { setBody: value => { state = value; }, setStatus: value => { throw new Error('State failed: ' + value); } });
  return state;
}
function rulesState() {
  let state;
  getState({ queryParams: {} }, { setBody: value => { state = value; }, setStatus: value => { throw new Error('State failed: ' + value); } });
  return state;
}
function archivedItem(kind, id) {
  let cursor = '';
  const visited = new Set();
  do {
    const page = action(getArchive, null, { kind, cursor });
    expect(page.status === 200, 'Could not read the archive fixture page.');
    const item = page.body.items.find(entry => entry.id === id);
    if (item) return item;
    cursor = page.body.next_cursor;
    expect(!cursor || !visited.has(cursor), 'Archive pagination repeated a cursor.');
    if (cursor) visited.add(cursor);
  } while (cursor);
  return null;
}
function reviewReply(input, title, text) {
  const ref = (segment_id, quote) => ({ revision_id: 'draft-1', segment_id, quote });
  return {
    overview: 'A fictional archive fixture draft.', overview_evidence: [ref('body-1', text)],
    findings: [], claim_checks: [],
    assessment: {
      status: 'reviewed', coverage: { revision_comparison: 'not_requested', metadata_suggestions: 'complete' },
      changes: [], limitations: [],
      policy_assessments: input.policy_pack.rules.map(rule => ({
        rule_id: rule.rule_id, status: 'no_potential_conflict_observed', reason: 'Fixture rule assessment.',
        evidence: [ref('title', title)], suggested_action: null,
      })),
      metadata_suggestions: {
        section: { suggested_id: null, reason: 'No section selected.', evidence: [] },
        tags: { suggested_ids: [], reason: 'No tags selected.', evidence: [] },
        short_description: { suggested_text: null, reason: 'No public description selected.', evidence: [] },
      },
    },
  };
}

export function runArchiveStoryRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.editor') && !gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated everyday-editor test user.');
  const saved = action(saveRevision, {
    request_key: 'ATF-arch-' + gs.generateGUID(), title: 'ATF archive story', text: 'A fictional archive fixture draft.',
    notes: '', content_format: 'article', content_kind: 'news', source_urls: [],
  });
  expect(saved.status === 200 && !!saved.body.story_id, 'The fixture story could not be saved.');
  const storyId = saved.body.story_id;
  expect(storyState(storyId).story.can_archive === true && storyState(storyId).story.archived === false, 'The editor was not offered the archive action.');
  let modified = storyState(storyId).story.modified;
  let page = action(getArchive, null, { kind: 'story', cursor: '' });
  expect(page.status === 200, 'The editor could not open the story archive.');
  const archived = action(postArchive, { action: 'archive', kind: 'story', id: storyId, expected_modified: modified });
  expect(archived.status === 200 && archived.body.item.can_restore === true, 'The story archive action failed: ' + JSON.stringify(archived.body));
  expect(storyState(storyId).story.archived === true, 'The story did not report its archived state.');
  expect(storyState(storyId).stories.some(item => item.id === storyId) === false, 'The archived story stayed in the daily list.');
  const item = archivedItem('story', storyId);
  expect(!!item && item.archived_at && item.can_restore === true && item.can_delete === false, 'The archived story was not listed for the editor.');
  expect(item.retention_reason.includes('Permanent deletion is unavailable'), 'The held deletion path was not explained.');
  expect(action(getArchive, null, { kind: 'story', cursor: 'not-a-page' }).status === 400, 'An unreadable cursor was accepted.');
  const revisionId = storyState(storyId).revisions[0].id;
  let providerTouched = false;
  const review = action((request, response) => reviewSavedVersion(request, response, () => {
    providerTouched = true;
    throw new Error('The provider must not be created for an archived story.');
  }, readSavedSources), { request_key: 'ATF-arch-rev-' + gs.generateGUID(), revision_id: revisionId });
  expect(review.status === 409 && providerTouched === false, 'The archived story accepted a direct review request.');
  const save = action(saveRevision, {
    request_key: 'ATF-arch2-' + gs.generateGUID(), story_id: storyId, title: 'ATF archive story',
    text: 'Changed text for an archived story.', notes: '', content_format: 'article', content_kind: 'news', source_urls: [],
  });
  expect(save.status === 409, 'The archived story accepted a direct save request.');
  const restored = action(postArchive, { action: 'restore', kind: 'story', id: storyId, expected_modified: storyState(storyId).story.modified });
  expect(restored.status === 200, 'The story could not be restored: ' + JSON.stringify(restored.body));
  expect(storyState(storyId).story.archived === false && storyState(storyId).stories.some(item => item.id === storyId) === true, 'The restored story did not return to the daily list.');
  expect(action(postArchive, { action: 'restore', kind: 'story', id: storyId, expected_modified: storyState(storyId).story.modified }).status === 409, 'A duplicate restore was accepted.');
  expect(action(postArchive, { action: 'archive', kind: 'story', id: storyId, expected_modified: '0' }).status === 409, 'A stale archive request was accepted.');
  modified = storyState(storyId).story.modified;
  expect(action(postArchive, { action: 'delete', kind: 'story', id: storyId, expected_modified: modified }).status === 403, 'A non-admin deleted a story.');
  expect(action(getArchive, null, { kind: 'rule', cursor: '' }).status === 403, 'A non-rules editor opened the rule archive.');
  return 'Passed as an everyday editor: archive/restore round trip, daily-list hiding, stale and duplicate rejection, direct save/review guards and denied deletion.';
}

export function runArchiveRuleRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  const identity = 'ATF-arch-rule-' + gs.generateGUID();
  const definition = {
    title: 'ATF archive rule fixture', text: 'Check the fictional archive fixture wording.', priority: 'standard',
    formats: ['article'], content_kinds: ['news'], conditions: '', human_checks: [], origin: { kind: 'manual' }, requires_sources: true,
  };
  let rule = current(action(saveRule, { rule_id: identity, ...definition }), identity);
  rule = current(action(approveRule, approvalInput(rule)), identity);
  expect(rule.active, 'The fixture rule was not approved.');
  const saved = action(saveRevision, {
    request_key: 'ATF-rule-story-' + gs.generateGUID(), title: 'ATF archive rule story', text: 'A fictional draft for the archive rule.',
    notes: '', content_format: 'article', content_kind: 'news', source_urls: [],
  });
  expect(saved.status === 200, 'The fixture story could not be saved.');
  const revisionId = saved.body.id;
  const title = 'ATF archive rule story';
  const text = 'A fictional draft for the archive rule.';
  const inputs = [];
  const provider = () => ({
    model: 'injected-archive-fixture',
    generate(input) {
      inputs.push(input);
      return { model: 'injected-archive-fixture', raw: JSON.stringify(reviewReply(input, title, text)) };
    },
  });
  const read = (urls, needed) => readSavedSources(urls, needed, () => ({ status: 200, body: '{}' }));
  const before = action((request, response) => reviewSavedVersion(request, response, provider, read),
    { request_key: 'ATF-rule-rev-' + gs.generateGUID(), revision_id: revisionId });
  expect(before.status === 200 && before.body.state === 'complete', 'The review with the active rule failed: ' + JSON.stringify(before.body.error));
  const ruleIds = input => input.policy_pack.rules.map(rule => rule.rule_id);
  expect(ruleIds(inputs[0]).includes(identity), 'The active fixture rule was missing from the review pack.');
  const otherRuleIds = ruleIds(inputs[0]).filter(ruleId => ruleId !== identity);
  const listed = rulesState().rules.find(entry => entry.rule_id === identity);
  expect(listed.archived === false && listed.can_archive === true, 'The rules view did not report archive eligibility.');
  let modified = listed.modified;
  const archived = action(postArchive, { action: 'archive', kind: 'rule', id: rule.id, expected_modified: modified });
  expect(archived.status === 200 && archived.body.item.can_restore === true, 'The rule archive action failed: ' + JSON.stringify(archived.body));
  const afterArchive = rulesState().rules.find(entry => entry.rule_id === identity);
  expect(afterArchive.archived === true, 'The archived rule left the readable rules view.');
  const item = archivedItem('rule', rule.id);
  expect(!!item && item.retention_reason && item.retention_reason.includes('Retained reviews'), 'The archived rule did not report its retained-review protection.');
  expect(item.can_delete === false, 'A non-admin was offered permanent deletion.');
  const after = action((request, response) => reviewSavedVersion(request, response, provider, read),
    { request_key: 'ATF-rule-rev2-' + gs.generateGUID(), revision_id: revisionId });
  expect(after.status === 200 && after.body.state === 'complete', 'The review after archiving failed: ' + JSON.stringify(after.body.error));
  expect(!ruleIds(inputs[1]).includes(identity) && otherRuleIds.every(ruleId => ruleIds(inputs[1]).includes(ruleId)),
    'The archived fixture was retained or another active rule was removed.');
  // A URL is not needed to determine which rules require sources.
  expect(inputs[0].source_rule_ids.includes(identity) && !inputs[1].source_rule_ids.includes(identity),
    'The archived rule was not removed from the source-rule selection.');
  const restored = action(postArchive, { action: 'restore', kind: 'rule', id: rule.id, expected_modified: rulesState().rules.find(entry => entry.rule_id === identity).modified });
  expect(restored.status === 200, 'The rule could not be restored: ' + JSON.stringify(restored.body));
  const afterRestore = rulesState().rules.find(entry => entry.rule_id === identity);
  expect(afterRestore.archived === false && afterRestore.active === false, 'A restored rule did not return off.');
  expect(action(postArchive, { action: 'restore', kind: 'rule', id: rule.id, expected_modified: afterRestore.modified }).status === 409, 'A duplicate restore was accepted.');
  expect(action(postArchive, { action: 'archive', kind: 'rule', id: rule.id, expected_modified: '0' }).status === 409, 'A stale archive request was accepted.');
  expect(action(postArchive, { action: 'delete', kind: 'rule', id: rule.id, expected_modified: afterRestore.modified }).status === 403, 'A non-admin deleted a rule.');
  return 'Passed as a rules editor: approved rule archived and restored off, retained-review protection reported, archived rule excluded from new reviews, stale and duplicate rejection and denied deletion.';
}

export function runArchiveOutsiderRegression() {
  expect(!gs.hasRole('x_2236136_suiko_ai.editor') && !gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated no-role test user.');
  expect(action(getArchive, null, { kind: 'story', cursor: '' }).status === 403, 'An outsider opened the story archive.');
  expect(action(getArchive, null, { kind: 'rule', cursor: '' }).status === 403, 'An outsider opened the rule archive.');
  expect(action(postArchive, { action: 'archive', kind: 'story', id: capstoneStory, expected_modified: '0' }).status === 403, 'An outsider archived a story.');
  expect(action(postArchive, { action: 'delete', kind: 'rule', id: capstoneRule, expected_modified: '0' }).status === 403, 'An outsider requested deletion.');
  const missing = gs.generateGUID();
  expect(action(postArchive, { action: 'archive', kind: 'story', id: missing, expected_modified: '0' }).status === 403
    && action(postArchive, { action: 'delete', kind: 'rule', id: missing, expected_modified: '0' }).status === 403,
  'Denial depended on whether the selected record existed.');
  return 'Passed as a no-role user: archive reads and actions, including protected records, are denied.';
}

export function runArchiveAdminRegression() {
  expect(gs.hasRole('admin'), 'Use the dedicated admin test user.');
  const demo = action(saveRevision, {
    request_key: 'ATF-demo-' + gs.generateGUID(), title: 'ATF disposable demo', text: 'Throwaway demo content for the archive suite.',
    notes: '', content_format: 'article', content_kind: 'news', source_urls: [],
  });
  expect(demo.status === 200, 'The disposable demo story could not be saved.');
  const demoId = demo.body.story_id;
  const marker = new GlideRecord('x_2236136_suiko_ai_story');
  expect(marker.get(demoId), 'The disposable demo story disappeared.');
  marker.setValue('disposable', true);
  marker.update();
  let archived = action(postArchive, { action: 'archive', kind: 'story', id: demoId, expected_modified: storyState(demoId).story.modified });
  expect(archived.status === 200 && archived.body.item.can_delete === false, 'The disposable story was not safely archived.');
  const held = action(postArchive, { action: 'delete', kind: 'story', id: demoId, expected_modified: archived.body.item.modified });
  expect(held.status === 503 && storyState(demoId).revisions[0].id === demo.body.id, 'The held deletion path touched the saved version.');
  expect(marker.get(demoId), 'The held demo story was removed.');
  marker.setValue('protected_evidence', true);
  expect(!!marker.update(), 'The fixture evidence marker could not be written.');
  const markedStory = action(postArchive, { action: 'delete', kind: 'story', id: demoId, expected_modified: storyState(demoId).story.modified });
  expect(markedStory.status === 409 && markedStory.body.message.includes('marked as protected evidence')
    && storyState(demoId).story.archived, 'A marked disposable story did not stay archived.');

  const identity = 'ATF-demo-rule-' + gs.generateGUID();
  const rule = current(action(saveRule, {
    rule_id: identity, title: 'ATF disposable demo rule', text: 'Throwaway demo rule.', priority: 'standard',
    formats: ['article'], content_kinds: ['news'], conditions: '', human_checks: [], origin: { kind: 'manual' },
  }), identity);
  const ruleRow = new GlideRecord('x_2236136_suiko_ai_rule');
  expect(ruleRow.get(rule.id), 'The disposable demo rule disappeared.');
  ruleRow.setValue('protected_evidence', true);
  expect(!!ruleRow.update(), 'The rule evidence marker could not be written.');
  archived = action(postArchive, { action: 'archive', kind: 'rule', id: rule.id, expected_modified: rulesState().rules.find(entry => entry.rule_id === identity).modified });
  expect(archived.status === 200 && !archived.body.item.can_delete && archived.body.item.retention_reason.includes('marked as protected evidence'),
    'The marked rule did not report evidence protection.');
  expect(action(postArchive, { action: 'delete', kind: 'rule', id: rule.id, expected_modified: '0' }).status === 409, 'A stale deletion request was accepted.');
  const ruleModified = rulesState().rules.find(entry => entry.rule_id === identity).modified;
  const markedRule = action(postArchive, { action: 'delete', kind: 'rule', id: rule.id, expected_modified: ruleModified });
  expect(markedRule.status === 409 && rulesState().rules.find(entry => entry.rule_id === identity).archived, 'A marked rule did not stay archived.');
  const versions = new GlideRecord('x_2236136_suiko_ai_rule_version');
  expect(versions.get(rule.draft.id), 'The marked rule lost its saved proposal.');
  verifyArchivePagination();
  return 'Passed as admin: marked story/rule retention, held deletion preserves children, stale rejection and two-page archive ordering.';
}

function verifyArchivePagination() {
  const timestamp = new GlideDateTime();
  timestamp.addDaysUTC(2);
  const newest = timestamp.getValue();
  timestamp.addDaysUTC(-1);
  const older = timestamp.getValue();
  // New IDs are random then sorted so the older row has a larger ID than the
  // entire tied group. The handler still needs to return it on page two.
  const ids = Array.from({ length: 52 }, () => String(gs.generateGUID())).sort().reverse();
  for (const [i, sysId] of ids.entries()) {
    const row = new GlideRecord('x_2236136_suiko_ai_story');
    row.initialize();
    row.setNewGuidValue(sysId);
    row.autoSysFields(false);
    row.setValue('title', 'ATF archive page fixture');
    row.setValue('archived', true);
    row.setValue('archived_at', newest);
    row.setValue('sys_updated_on', i === 0 ? older : newest);
    expect(!!row.insert(), 'A fictional pagination row could not be saved.');
  }
  const first = action(getArchive, null, { kind: 'story' });
  expect(first.status === 200 && first.body.items.length === 50 && first.body.next_cursor
    && first.body.items.every((item, i) => item.id === ids[i + 1]), 'The first page missed the expected timestamp and ID order.');
  const next = action(getArchive, null, { kind: 'story', cursor: first.body.next_cursor });
  expect(next.status === 200 && next.body.items[0]?.id === ids[51] && next.body.items[1]?.id === ids[0],
    'The second page skipped the next tied row or the older row with a greater ID.');
  expect(action(getArchive, null, { kind: 'rule', cursor: first.body.next_cursor }).status === 400, 'A story cursor was accepted for rules.');
}
