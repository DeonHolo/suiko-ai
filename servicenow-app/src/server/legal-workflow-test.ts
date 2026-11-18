import { GlideRecord, GlideRecordSecure, gs } from '@servicenow/glide';
import { getState, getStories, legalDecision, legalTasks, readStateForLegalTest, saveRevision, workflowActionForTest as workflowAction } from './workbench.ts';
import { postArchive } from './archive.ts';

function expect(value, message) {
  if (!value) throw new Error(message);
}

function action(handler, data, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, {
    setStatus: value => { status = value; },
    setBody: value => { body = value; },
  });
  return { status, body };
}

const editor = 'x_2236136_suiko_ai.editor';
const legal = 'x_2236136_suiko_ai.legal_reviewer';
const taskTable = 'x_2236136_suiko_ai_legal_task';
const text = 'A fictional clip appears in the finished package.';
const notes = 'Confirm the clip permission before sign-off.';
const reason = 'Confirm the fictional clip permission.';

function state(storyId) {
  const result = action(readStateForLegalTest, null, { story: storyId });
  expect(result.status === 200 && !!result.body.workflow, 'The fixture workspace state was not returned.');
  return result.body;
}

export function runLegalRoutingRegression(assignedId: string, unassignedId: string, inactiveId: string) {
  expect(gs.hasRole(editor) && !gs.hasRole(legal) && !gs.hasRole('admin'), 'Use the dedicated Editor only.');
  const saved = action(saveRevision, {
    request_key: 'ATF-legal-' + gs.generateGUID(),
    title: 'ATF legal workflow story', text, notes, content_format: 'script', content_kind: 'news', source_urls: [],
  });
  expect(saved.status === 200 && saved.body.id, 'Could not save the legal workflow fixture.');
  const initial = state(saved.body.story_id);
  expect(initial.workflow.status === 'needs_review' && initial.workflow.current_revision_id === saved.body.id,
    'The new story did not start with the saved current version.');
  expect(initial.workflow.reviewers.some(user => user.id === assignedId)
    && !initial.workflow.reviewers.some(user => user.id === inactiveId), 'The reviewer list did not require an active legal-only account.');
  const route = {
    action: 'send_to_legal', revision_id: saved.body.id,
    reviewer_id: assignedId, note: reason, expected_modified: initial.workflow.modified,
  };
  expect(action(workflowAction, { ...route, expected_modified: '999999' }).status === 409, 'A stale story request was accepted.');
  expect(action(workflowAction, { ...route, reviewer_id: inactiveId }).status === 400
    && action(workflowAction, { ...route, reviewer_id: gs.generateGUID() }).status === 400, 'An inactive or missing reviewer was accepted.');
  const failed = action((request, response) => workflowAction(request, response, { editor: true, legal: true }, () => {
    throw new Error('Simulated legal task insert failure.');
  }), route);
  const recovered = state(saved.body.story_id).workflow;
  expect(failed.status === 500 && recovered.status === 'needs_review' && recovered.history.length === 0
    && recovered.actions.includes('sign_off'), 'A failed legal request left a false clearance requirement.');
  route.expected_modified = recovered.modified;
  const sent = action(workflowAction, route);
  expect(sent.status === 200 && sent.body.workflow.status === 'waiting_for_legal', 'Sending the revision to legal did not update workflow status.');
  expect(action(getStories, null, { q: saved.body.title, status: 'waiting_for_legal' }).body.items.some(item => item.id === saved.body.story_id),
    'The Editor Inbox did not return the pending legal status.');
  const repeat = action(workflowAction, route);
  expect(repeat.status === 200 && repeat.body.task_id === sent.body.task_id, 'The original request did not reuse its task.');
  expect(action(workflowAction, { ...route, reviewer_id: unassignedId }).status === 409
    && action(workflowAction, { ...route, note: 'Different request.' }).status === 409,
  'A different request silently reused the pending task.');
  expect(action(legalTasks, null, { task: sent.body.task_id }).status === 403
    && action(legalDecision, { task_id: sent.body.task_id, revision_id: saved.body.id, action: 'clear' }).status === 403,
  'The Editor-only user reached a legal handler.');
  const newer = action(saveRevision, {
    ...saved.body, request_key: 'ATF-legal-next-' + gs.generateGUID(), expected_revision_id: saved.body.id,
    title: 'ATF legal workflow newer story', text: 'The newer copy describes a different fictional clip.',
  });
  expect(newer.status === 200 && newer.body.id !== saved.body.id, 'The newer fictional version did not save.');
  expect(action(workflowAction, route).status === 409, 'A superseded revision was routed.');
  return sent.body.task_id;
}

export function runUnassignedLegalRegression(taskId: string, legalRole: boolean) {
  expect(gs.hasRole(legal) === legalRole && !gs.hasRole(editor) && !gs.hasRole('admin'), 'Use the selected unassigned test account.');
  const detail = action(legalTasks, null, { task: taskId });
  const list = action(legalTasks, null);
  const native = new GlideRecordSecure(taskTable);
  expect(!native.get(taskId) || !native.canRead(), 'This account could read another reviewer’s native task.');
  expect(detail.status === (legalRole ? 404 : 403) && (legalRole ? list.status === 200 && list.body.tasks.every(task => task.id !== taskId) : list.status === 403),
    'The list or detail permissions did not match this account.');
  expect(action(legalDecision, { task_id: taskId, revision_id: gs.generateGUID(), action: 'clear' }).status === (legalRole ? 404 : 403),
    'An unauthorized decision reached the task.');
  expect(action(workflowAction, null).status === 403 && action(getState, null).status === 403, 'An account without Editor accessed the workbench.');
}

export function runAssignedLegalRegression(taskId: string, newer: boolean) {
  expect(gs.hasRole(legal) && !gs.hasRole(editor) && !gs.hasRole('admin'), 'Use the assigned legal-only account.');
  expect(action(getState, null).status === 403 && action(workflowAction, null).status === 403, 'Legal-only access included Editor actions.');
  const opened = action(legalTasks, null, { task: taskId });
  const list = action(legalTasks, null);
  const task = opened.body?.task;
  expect(opened.status === 200 && task?.revision?.version === (newer ? 2 : 1)
    && list.status === 200 && list.body.tasks.some(item => item.id === taskId), 'The assigned frozen task was unavailable.');
  if (!newer) expect(task.revision.text === text && task.revision.notes === notes, 'The task changed when a newer version was saved.');
  const native = new GlideRecordSecure(taskTable);
  expect(native.get(taskId) && native.canRead() && !native.canWrite() && native.getValue('submitted_title') === task.revision.title
    && native.getValue('submitted_text') === task.revision.text && native.getValue('submitted_notes') === task.revision.notes,
  'The assigned native inspection copy was wrong or editable.');
  const decide = { task_id: taskId, revision_id: task.revision.id,
    expected_modified: task.modified, action: newer ? 'request_changes' : 'clear', note: newer ? 'Confirm the new clip.' : '' };
  expect(action(legalDecision, { ...decide, expected_modified: '999999' }).status === 409
    && action(legalDecision, { ...decide, revision_id: gs.generateGUID() }).status === 409, 'A stale or mismatched decision was accepted.');
  if (newer) expect(action(legalDecision, { ...decide, note: '' }).status === 400, 'A changes request was accepted without a note.');
  const result = action(legalDecision, decide);
  const status = newer ? 'changes_requested' : 'cleared';
  expect(result.status === 200, 'The decision failed with HTTP ' + result.status + ': ' + (result.body?.message || 'no message'));
  const reopened = action(legalTasks, null, { task: taskId });
  const saved = reopened.body?.task;
  expect(reopened.status === 200 && saved?.status === status && saved.actions.length === 0
    && saved.revision.id === task.revision.id && saved.decision?.note === decide.note && !!saved.decision?.decided_at,
  'Reopening the task did not show its saved decision, exact revision, note and time.');
  // The native view is checked above. Read storage separately so field-level
  // restrictions on the native form do not prevent asserting the actor's ID.
  const audit = new GlideRecord(taskTable);
  expect(audit.get(taskId), 'The decided task was missing from the legal audit.');
  expect(String(audit.getValue('decision_by')) === String(gs.getUserID()), 'The audit did not identify the signed-in reviewer.');
  expect(String(audit.getValue('revision')) === task.revision.id, 'The audit did not retain the submitted revision.');
  expect(action(legalDecision, { ...decide, expected_modified: result.body.task.modified }).status === 409, 'The task accepted a second decision.');
  return task.revision.story_id;
}

export function runFreshLegalRoutingRegression(storyId: string, assignedId: string) {
  expect(gs.hasRole(editor) && !gs.hasRole(legal) && !gs.hasRole('admin'), 'Use the dedicated Editor only.');
  const afterOlder = state(storyId);
  const latest = afterOlder.revisions[0];
  expect(latest.version === 2 && afterOlder.workflow.current_revision_id === latest.id
    && afterOlder.workflow.status === 'needs_review', 'The old clearance changed the newer story status.');
  expect(action(workflowAction, { action: 'sign_off', revision_id: latest.id,
    expected_modified: afterOlder.workflow.modified }).status === 409,
    'Older clearance incorrectly allowed sign-off of the new version.');
  const sent = action(workflowAction, { action: 'send_to_legal', revision_id: latest.id,
    reviewer_id: assignedId, note: reason, expected_modified: afterOlder.workflow.modified });
  expect(sent.status === 200 && sent.body.workflow.status === 'waiting_for_legal', 'The newer version could not obtain its own task.');
  return sent.body.task_id;
}

export function verifyLegalChangesRequested(storyId: string) {
  const after = state(storyId);
  expect(after.workflow.status === 'changes_requested' && after.workflow.current_revision_id === after.revisions[0].id,
    'The current revision did not reflect the legal changes request.');
  const archived = action(postArchive, { action: 'archive', kind: 'story', id: storyId, expected_modified: after.story.modified });
  expect(archived.status === 200 && archived.body.item.retention_reason.includes('Retained legal review history'),
    'The archive omitted retained legal evidence.');
  const restored = action(postArchive, { action: 'restore', kind: 'story', id: storyId, expected_modified: archived.body.item.modified });
  expect(restored.status === 200 && state(storyId).workflow.status === 'changes_requested', 'Restore lost the recorded legal decision.');
}

export function routeCurrentLegalClearanceFixture(storyId: string, assignedId: string) {
  const stateBefore = state(storyId);
  const previous = stateBefore.revisions[0];
  expect(stateBefore.workflow.status === 'changes_requested', 'The previous legal result did not survive restore.');
  const saved = action(saveRevision, { ...previous, text: 'The third fictional copy resolves the legal concern.',
    request_key: 'ATF-legal-third-' + gs.generateGUID(), expected_revision_id: previous.id });
  expect(saved.status === 200 && saved.body.version === 3, 'The fresh revision did not save.');
  const next = state(storyId);
  expect(next.workflow.status === 'needs_review' && next.workflow.current_revision_id === saved.body.id, 'The old legal decision carried over.');
  const sent = action(workflowAction, { action:'send_to_legal', revision_id:saved.body.id, reviewer_id:assignedId,
    note:reason, expected_modified:next.workflow.modified });
  expect(sent.status === 200 && sent.body.workflow.status === 'waiting_for_legal', 'The third version did not get its own legal task.');
  return sent.body.task_id;
}

export function clearCurrentLegalFixture(taskId: string) {
  expect(gs.hasRole(legal) && !gs.hasRole(editor) && !gs.hasRole('admin'), 'Use the assigned legal-only account.');
  const opened = action(legalTasks, null, {task:taskId});
  const task = opened.body?.task;
  expect(opened.status === 200 && task?.revision?.version === 3, 'The new assignment does not refer to the third version.');
  const cleared = action(legalDecision, {task_id:taskId,revision_id:task.revision.id,
    expected_modified:task.modified,action:'clear',note:''});
  expect(cleared.status === 200 && cleared.body.task.status === 'cleared', 'Clearance of the current copy did not persist.');
}

export function verifyCurrentLegalClearance(storyId: string) {
  const current = state(storyId);
  expect(current.workflow.status === 'ready_for_sign_off' && current.workflow.current_revision_id === current.revisions[0].id,
    'The legal decision did not reach the exact current revision.');
  expect(action(getStories, null, { q: current.story.title, status: 'ready_for_sign_off' }).body.items.some(item => item.id === storyId),
    'The Editor Inbox did not return the freshly cleared status.');
  const repeat = action(workflowAction, {action:'send_to_legal',revision_id:current.revisions[0].id,
    reviewer_id:current.workflow.reviewers[0].id,note:reason,expected_modified:current.workflow.modified});
  expect(repeat.status === 409, 'The already decided version was sent to legal again.');
  const signed = action(workflowAction, { action: 'sign_off', revision_id: current.revisions[0].id,
    expected_modified: current.workflow.modified });
  expect(signed.status === 200 && signed.body.workflow.status === 'signed_off',
    'Clearance of the current revision did not permit final editor sign-off.');
}
