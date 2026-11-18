import { GlideRecordSecure, gs } from '@servicenow/glide';
import { getState, legalDecision, legalTasks, saveRevision, workflowAction } from './workbench.ts';

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
  const result = action((request, response) => getState(request, response, true), null, { story: storyId });
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
  const sent = action(workflowAction, route);
  expect(sent.status === 200 && sent.body.workflow.status === 'waiting_for_legal', 'Sending the revision to legal did not update workflow status.');
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
  expect(result.status === 200 && result.body.task.status === status && result.body.task.actions.length === 0 && native.get(taskId)
    && native.getValue('decision_by') === String(gs.getUserID()) && !!native.getValue('decided_at')
    && (native.getValue('decision_note') || '') === decide.note && native.getValue('revision') === task.revision.id,
  'The decision did not preserve the submitted revision, actor, time and note.');
  expect(action(legalDecision, { ...decide, expected_modified: result.body.task.modified }).status === 409, 'The task accepted a second decision.');
  return task.revision.story_id;
}

export function runFreshLegalRoutingRegression(storyId: string, assignedId: string) {
  expect(gs.hasRole(editor) && !gs.hasRole(legal) && !gs.hasRole('admin'), 'Use the dedicated Editor only.');
  const afterOlder = state(storyId);
  const latest = afterOlder.revisions[0];
  expect(latest.version === 2 && afterOlder.workflow.current_revision_id === latest.id
    && afterOlder.workflow.status === 'needs_review', 'The old clearance changed the newer story status.');
  const sent = action(workflowAction, { action: 'send_to_legal', revision_id: latest.id,
    reviewer_id: assignedId, note: reason, expected_modified: afterOlder.workflow.modified });
  expect(sent.status === 200 && sent.body.workflow.status === 'waiting_for_legal', 'The newer version could not obtain its own task.');
  return sent.body.task_id;
}

export function verifyLegalChangesRequested(storyId: string) {
  const after = state(storyId);
  expect(after.workflow.status === 'changes_requested' && after.workflow.current_revision_id === after.revisions[0].id,
    'The current revision did not reflect the legal changes request.');
}
