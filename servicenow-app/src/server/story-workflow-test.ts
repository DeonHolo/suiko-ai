import { GlideRecord, gs } from '@servicenow/glide';
import { getStories, readStateForLegalTest, reviewSavedVersion, saveRevision, workflowAction } from './workbench.ts';

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
  expect(call(workflowAction, { ...decision, note: '' }).status === 400, 'An empty changes request was accepted.');
  const changed = call(workflowAction, decision);
  const after = changed.body?.workflow;
  expect(changed.status === 200 && after.status === 'changes_requested' && after.modified !== initial.modified,
    'The changes request did not update status and modification count.');
  expect(after.history.length === 1 && after.history[0].revision_id === first.body.id
    && after.history[0].actor_id === String(gs.getUserID()) && after.history[0].note === decision.note
    && after.history[0].version === 1 && after.history[0].decided_at, 'Decision history omitted the saved version or actor.');
  expect(call(workflowAction, decision).status === 409
    && call(workflowAction, { ...decision, expected_modified: after.modified }).status === 409
    && workflow(storyId).history.length === 1, 'A repeated changes request created duplicate history.');

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
  expect(signed.status === 200 && signed.body.workflow.status === 'signed_off'
    && signed.body.workflow.history.length === 2 && call(workflowAction, signOff).status === 409,
  'The current version did not receive exactly one sign-off.');
}

export function testInboxPagination() {
  expect(gs.hasRole('admin'), 'Create pagination fixtures as the ATF administrator.');
  const title = 'ATF Inbox page ' + gs.generateGUID();
  const activeIds = new Set();
  for (let index = 0; index < 54; index++) {
    const story = new GlideRecord('x_2236136_suiko_ai_story');
    story.initialize();
    story.setValue('title', title + ' ' + index);
    story.setValue('archived', index === 53);
    const id = story.insert();
    expect(id, 'Could not insert an Inbox fixture.');
    if (index !== 53) activeIds.add(String(id));
  }
  const first = call(getStories, null, { q: title, status: 'needs_review' });
  expect(first.status === 200 && first.body.items.length === 50 && first.body.next_cursor, 'Expected a full first page.');
  const cursor = first.body.next_cursor;
  const second = call(getStories, null, { q: title, status: 'needs_review', cursor });
  expect(second.status === 200 && second.body.items.length === 3 && second.body.next_cursor === null,
    'Expected three remaining rows without an archived result.');
  const rows = [...first.body.items, ...second.body.items];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    expect(activeIds.delete(row.id), 'A story repeated or did not belong to the active fixture.');
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
