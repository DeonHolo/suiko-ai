import { GlideRecord, gs } from '@servicenow/glide';
import { getStories, readStateForLegalTest, reviewSavedVersion, saveRevision, workflowActionForTest as workflowAction } from './workbench.ts';

function expect(assertion: unknown, message: string) {
  if (!assertion) throw new Error(message);
}

function call(handler, data, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, {
    setStatus: value => { status = value; },
    setBody: value => { body = value; },
  });
  return { status, body };
}

function workflow(storyId: string) {
  const response = call(readStateForLegalTest, null, { story: storyId });
  expect(response.status === 200 && response.body.workflow, 'Expected readable story workflow.');
  return response.body.workflow;
}

const requestKey = () => 'ATF-workflow-' + gs.generateGUID();

export function testEditorWorkflow() {
  expect(gs.hasRole('x_2236136_suiko_ai.editor') && !gs.hasRole('admin'), 'Run as a regular Editor.');
  const story = {
    title: 'ATF inbox workflow ' + gs.generateGUID(), text: 'A fictional editor reviews this draft.',
    notes: '', content_format: 'article', content_kind: 'news', source_urls: [],
  };
  const first = call(saveRevision, { ...story, request_key: requestKey() });
  expect(first.status === 200 && first.body.version === 1, 'The first version did not save.');
  const storyId = first.body.story_id;
  const initial = workflow(storyId);
  const decision = {
    action: 'request_changes', revision_id: first.body.id, expected_modified: initial.modified,
    note: 'Confirm the opening time.',
  };
  const legalOnly = { editor: false, legal: true };
  const gatedState = call((request, response) => readStateForLegalTest(request, response, legalOnly), null, { story: storyId });
  expect(gatedState.body.workflow.actions.every(action => action === 'send_to_legal')
    && call((request, response) => workflowAction(request, response, legalOnly), decision).status === 403,
  'A Legal-only rollout exposed or accepted editor decisions.');
  const editorOnly = { editor: true, legal: false };
  const editorState = call((request, response) => readStateForLegalTest(request, response, editorOnly), null, { story: storyId });
  expect(editorState.body.workflow.reviewers.length === 0 && !editorState.body.workflow.actions.includes('send_to_legal')
    && call((request, response) => workflowAction(request, response, editorOnly), { ...decision, action: 'send_to_legal' }).status === 403,
  'An Editor-only rollout exposed or accepted legal routing.');
  expect(call(workflowAction, { ...decision, note: '' }).status === 400, 'An empty changes request was accepted.');
  const changed = call(workflowAction, decision);
  const after = changed.body?.workflow;
  expect(changed.status === 200 && after.status === 'changes_requested' && after.modified !== initial.modified,
    'The changes request did not update status and modification count.');
  expect(after.history.length === 1 && after.history[0].revision_id === first.body.id
    && after.history[0].actor_id === String(gs.getUserID()) && after.history[0].note === decision.note
    && after.history[0].version === 1 && after.history[0].decided_at, 'Decision history omitted the saved version or actor.');
  const reread = workflow(storyId);
  expect(reread.history.length === 1 && reread.history[0].id === after.history[0].id,
    'The regular Editor reopened ' + reread.history.length + ' decisions; expected the one accepted decision.');
  const staleChange = call(workflowAction, decision);
  const repeatChange = call(workflowAction, { ...decision, expected_modified: after.modified });
  expect(staleChange.status === 409 && repeatChange.status === 409 && workflow(storyId).history.length === 1,
    'A repeated changes request was not rejected. HTTP ' + staleChange.status + ' and ' + repeatChange.status + '.');

  const same = call(saveRevision, { ...story, request_key: requestKey(), story_id: storyId, expected_revision_id: first.body.id });
  expect(same.status === 200 && same.body.id === first.body.id && workflow(storyId).modified === after.modified,
    'The identical save changed revision or human workflow.');
  const filtered = call(getStories, null, { q: story.title, status: 'changes_requested' });
  expect(filtered.status === 200 && filtered.body.items.length === 1 && filtered.body.items[0].id === storyId,
    'The Inbox did not return the story filtered by its editor decision.');

  const second = call(saveRevision, {
    ...story, text: 'The fictional editor confirmed the opening time.',
    request_key: requestKey(), story_id: storyId, expected_revision_id: first.body.id,
  });
  const current = workflow(storyId);
  expect(second.status === 200 && second.body.version === 2 && current.status === 'needs_review'
    && current.history.length === 1, 'Saving a changed draft failed to reset only the current status.');
  const signOff = { action: 'sign_off', revision_id: second.body.id, expected_modified: current.modified };
  expect(call(workflowAction, { ...signOff, revision_id: first.body.id }).status === 409
    && call(workflowAction, { ...signOff, expected_modified: after.modified }).status === 409,
    'An outdated draft or tab passed the sign-off guard.');
  const failure = call((request, response) => reviewSavedVersion(request, response, () => ({
    model: 'injected-test-failure',
    generate() { throw new Error('Simulated provider outage.'); },
  }), () => []), { revision_id: second.body.id, request_key: requestKey() });
  expect(failure.status === 200 && failure.body.state === 'failed' && workflow(storyId).modified === current.modified,
    'A failed AI review changed human status or the decision guard.');
  const signed = call(workflowAction, signOff);
  const signOffEntry = signed.body?.workflow?.history.find(entry => entry.action === 'sign_off');
  expect(signed.status === 200 && signed.body.workflow.status === 'signed_off'
    && signed.body.workflow.history.length === 2 && call(workflowAction, signOff).status === 409
    && signOffEntry?.revision_id === second.body.id && signOffEntry?.version === 2 && signOffEntry?.actor_id === String(gs.getUserID()),
  'The current version did not receive exactly one sign-off.');
  const stored = new GlideRecord('x_2236136_suiko_ai_story');
  expect(stored.get(storyId) && stored.getValue('editor_decision_head') === signOffEntry.id, 'The accepted history and native status did not share a write.');
  const prepared = new GlideRecord('x_2236136_suiko_ai_revision');
  const retryKey = requestKey();
  const preparedText = 'A third fictional draft is staged but unpublished.';
  prepared.initialize();
  prepared.setValue('story', storyId);
  prepared.setValue('version', 3);
  prepared.setValue('version_key', storyId + ':3');
  prepared.setValue('request_key', retryKey);
  prepared.setValue('title', story.title);
  prepared.setValue('body', preparedText);
  prepared.setValue('content_format', 'article');
  prepared.setValue('content_kind', 'news');
  const preparedId = String(prepared.insert() || '');
  expect(preparedId, 'The staged draft could not be inserted.');
  const visible = call(readStateForLegalTest, null, { story: storyId }).body;
  expect(visible.workflow.current_revision_id === second.body.id && visible.revisions.every(revision => revision.id !== preparedId)
    && call(workflowAction, { ...signOff, revision_id: preparedId, expected_modified: visible.workflow.modified }).status === 409,
  'A prepared revision was exposed before the story published it.');
  expect(call(saveRevision, { ...story, text: preparedText, story_id: storyId,
    expected_revision_id: second.body.id, request_key: requestKey() }).body.id === preparedId
    && call(saveRevision, { ...story, request_key: retryKey }).body.id === preparedId
    && workflow(storyId).status === 'needs_review' && workflow(storyId).history.some(entry => entry.id === signOffEntry.id),
  'Retry failed to publish the prepared revision while preserving the older sign-off.');
}

export function createInboxFixtures() {
  expect(gs.hasRole('admin'), 'Create pagination fixtures as the ATF administrator.');
  const title = 'ATF Inbox page ' + gs.generateGUID();
  let fixture = '';
  for (let index = 0; index < 54; index++) {
    const story = new GlideRecord('x_2236136_suiko_ai_story');
    story.initialize();
    story.setValue('title', title + ' ' + index);
    story.setValue('archived', index === 53);
    const id = story.insert();
    expect(id, 'Could not insert an Inbox fixture.');
    if (index === 0) fixture = String(id);
  }
  return fixture;
}

export function testInboxPagination(fixture: string) {
  expect(gs.hasRole('x_2236136_suiko_ai.editor') && !gs.hasRole('admin'), 'Read both fixture pages as a regular Editor.');
  const story = new GlideRecord('x_2236136_suiko_ai_story');
  expect(story.get(fixture), 'The pagination fixture was not found.');
  const title = story.getValue('title').slice(0, -2);
  const first = call(getStories, null, { q: title, status: 'needs_review' });
  expect(first.status === 200 && first.body.items.length === 50 && first.body.next_cursor, 'Expected a full first page.');
  const cursor = first.body.next_cursor;
  const second = call(getStories, null, { q: title, status: 'needs_review', cursor });
  expect(second.status === 200 && second.body.items.length === 3 && second.body.next_cursor === null,
    'Expected three remaining rows without an archived result.');
  const rows = [...first.body.items, ...second.body.items];
  const ids = new Set();
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    expect(!ids.has(row.id) && row.title.startsWith(title + ' ') && row.title !== title + ' 53',
      'A story repeated or did not belong to the active fixture.');
    ids.add(row.id);
    const previous = rows[index - 1];
    expect(!previous || previous.updated_at > row.updated_at
      || (previous.updated_at === row.updated_at && previous.id > row.id), 'The Inbox sort order was unstable.');
  }
  expect(call(getStories, null, { q: title, status: 'signed_off', cursor }).status === 400
    && call(getStories, null, { q: title, cursor: 'invalid' }).status === 400, 'An invalid cursor was accepted.');
}

export function testNoEditorAccess() {
  expect(!gs.hasRole('admin') && !gs.hasRole('x_2236136_suiko_ai.editor'), 'Run as an outsider.');
  expect(call(getStories, null).status === 403 && call(workflowAction, null).status === 403
    && call(saveRevision, null).status === 403, 'A non-Editor reached a story endpoint.');
}
