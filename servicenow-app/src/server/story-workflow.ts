import { GlideDateTime, GlideRecord, GlideRecordSecure, gs } from '@servicenow/glide';
import { WorkbenchError } from './workbench-error.ts';

export const storyTable = 'x_2236136_suiko_ai_story';
export const revisionTable = 'x_2236136_suiko_ai_revision';
export const legalTaskTable = 'x_2236136_suiko_ai_legal_task';
const decisionTable = 'x_2236136_suiko_ai_decision';

export const workflowStatuses = [
  'needs_review', 'changes_requested', 'signed_off', 'waiting_for_legal', 'ready_for_sign_off',
];

export function requireEditor() {
  if (!gs.hasRole('admin') && !gs.hasRole('x_2236136_suiko_ai.editor')) {
    throw new WorkbenchError('This action is available to Editors.', 403);
  }
}

export function readableRecord(table: string, sysId: string) {
  if (!/^[a-f0-9]{32}$/.test(String(sysId))) throw new WorkbenchError('Choose a saved record.');
  const row = new GlideRecordSecure(table);
  if (!row.get(sysId) || !row.canRead()) throw new WorkbenchError('This saved record could not be found.', 404);
  return row;
}

export function highestRevision(storyId: string) {
  const row = new GlideRecordSecure(revisionTable);
  row.addQuery('story', storyId);
  row.orderByDesc('version');
  row.orderByDesc('sys_id');
  row.setLimit(1);
  row.query();
  return row.next() ? row : null;
}

// The story pointer publishes an immutable revision and its workflow status together.
// Existing rows without a pointer or write identity use their last legacy save.
export function currentRevision(story: GlideRecord) {
  const pointer = story.getValue('current_revision');
  if (!pointer) return story.getValue('workflow_change_key') ? null : highestRevision(String(story.getUniqueValue()));
  const row = new GlideRecordSecure(revisionTable);
  return row.get(pointer) && row.getValue('story') === String(story.getUniqueValue()) && row.canRead() ? row : null;
}

export function legalTaskForRevision(revisionId: string) {
  const row = new GlideRecord(legalTaskTable);
  row.addQuery('revision', revisionId);
  row.setLimit(1);
  row.query();
  return row.next() ? row : null;
}

export function needsLegalClearance(story: GlideRecord) {
  if (story.getValue('legal_clearance_required') === '1') return true;
  const row = new GlideRecord(legalTaskTable);
  row.addQuery('story', story.getUniqueValue());
  row.setLimit(1);
  row.query();
  return row.next();
}

export function workflowStatus(story: GlideRecord, revisionId: string, taskStatus?: string | null) {
  return deriveWorkflowStatus(story.getValue('current_revision'), story.getValue('workflow_status'), revisionId, taskStatus);
}

export function deriveWorkflowStatus(published: string | null, status: string | null, revisionId: string, taskStatus?: string | null) {
  const stored = (published || '') === revisionId ? status : 'needs_review';
  if (stored === 'signed_off') return stored;
  if (taskStatus === 'pending') return 'waiting_for_legal';
  if (stored === 'changes_requested' || taskStatus === 'changes_requested') return 'changes_requested';
  if (taskStatus === 'cleared') return 'ready_for_sign_off';
  return stored === 'waiting_for_legal' ? stored : 'needs_review';
}

export function editorActions(status: string, requiresClearance: boolean, cleared: boolean) {
  if (status === 'signed_off' || status === 'waiting_for_legal') return [];
  const actions = status === 'changes_requested' ? [] : ['request_changes'];
  if (!requiresClearance || cleared) actions.push('sign_off');
  return actions;
}

export function guardedStoryUpdate(story: GlideRecord, values: Record<string, string>, includeArchived = false) {
  const changeKey = String(gs.generateGUID());
  const update = new GlideRecord(storyTable);
  update.addQuery('sys_id', story.getUniqueValue());
  update.addQuery('sys_mod_count', String(story.getValue('sys_mod_count')));
  const current = story.getValue('current_revision');
  if (current) update.addQuery('current_revision', current);
  else update.addNullQuery('current_revision');
  if (!includeArchived) update.addQuery('archived', false).addOrCondition('archived', 'ISEMPTY', '');
  for (const field of Object.keys(values)) update.setValue(field, values[field]);
  update.setValue('workflow_change_key', changeKey);
  update.updateMultiple();
  const refreshed = new GlideRecord(storyTable);
  if (!refreshed.get(story.getUniqueValue()) || refreshed.getValue('workflow_change_key') !== changeKey) return null;
  return refreshed;
}

function decisionEntries(story: GlideRecord) {
  let next = story.getValue('editor_decision_head');
  if (!next) return [];
  const rows = new GlideRecord(decisionTable);
  rows.addQuery('story', story.getUniqueValue());
  rows.query();
  const entries = new Map();
  while (rows.next()) {
    const id = String(rows.getUniqueValue());
    const action = rows.getValue('action');
    entries.set(id, { previous: rows.getValue('previous'), item: {
      id, revision_id: rows.getValue('revision'), version: Number(rows.getValue('version')), action,
      label: action === 'sign_off' ? 'Signed off' : 'Changes requested',
      actor: rows.getValue('actor_name'), actor_id: rows.getValue('actor'),
      decided_at: rows.getValue('decided_at'), note: rows.getValue('note') || '',
    } });
  }
  const history = [];
  // Only entries reachable from the accepted story pointer are decisions.
  while (next) {
    const entry = entries.get(next);
    if (!entry) throw new WorkbenchError('The saved decision history is incomplete. Reload the story before deciding.', 409);
    history.push(entry.item);
    entries.delete(next);
    next = entry.previous;
  }
  return history;
}

export function prepareEditorDecision(story: GlideRecord, revision: GlideRecord, action: string, note: string) {
  const entry = new GlideRecord(decisionTable);
  entry.initialize();
  entry.setValue('story', story.getUniqueValue());
  entry.setValue('revision', revision.getUniqueValue());
  entry.setValue('previous', story.getValue('editor_decision_head') || '');
  entry.setValue('version', revision.getValue('version'));
  entry.setValue('action', action);
  entry.setValue('actor', gs.getUserID());
  entry.setValue('actor_name', gs.getUserDisplayName());
  entry.setValue('decided_at', new GlideDateTime().getValue());
  entry.setValue('note', note);
  const id = entry.insert();
  if (!id) throw new WorkbenchError('The editor decision could not be saved. Try again.', 500);
  return String(id);
}

export function hasEditorDecision(story: GlideRecord, decisionId: string) {
  return decisionEntries(story).some(entry => entry.id === decisionId);
}

export function workflowHistory(story: GlideRecord, displayName: (userId: string) => string) {
  const history = decisionEntries(story);
  const task = new GlideRecord(legalTaskTable);
  task.addQuery('story', story.getUniqueValue());
  task.query();
  while (task.next()) {
    const revisionId = task.getValue('revision');
    const revision = new GlideRecordSecure(revisionTable);
    if (!revision.get(revisionId) || !revision.canRead()) continue;
    const version = Number(revision.getValue('version'));
    const taskId = String(task.getUniqueValue());
    const requestedBy = task.getValue('requested_by');
    history.push({
      id: taskId + '-route', revision_id: revisionId, version, action: 'send_to_legal',
      label: 'Sent to legal', actor_id: requestedBy, actor: displayName(requestedBy),
      decided_at: task.getValue('requested_at'), note: task.getValue('reason') || '',
    });
    const decidedBy = task.getValue('decision_by');
    if (!decidedBy) continue;
    const cleared = task.getValue('status') === 'cleared';
    history.push({
      id: taskId + '-decision', revision_id: revisionId, version,
      action: cleared ? 'legal_clear' : 'legal_request_changes',
      label: cleared ? 'Cleared by legal' : 'Changes requested by legal',
      actor_id: decidedBy, actor: displayName(decidedBy),
      decided_at: task.getValue('decided_at'), note: task.getValue('decision_note') || '',
    });
  }
  return history.sort((a, b) => String(b.decided_at || '').localeCompare(String(a.decided_at || '')) || b.id.localeCompare(a.id));
}

// Run as an admin after installation. Reconcile existing stories against
// their latest saved version without modifying frozen revisions or archive data.
export function backfillCurrentRevisions() {
  if (!gs.hasRole('admin')) throw new WorkbenchError('Only an admin can backfill stories.', 403);
  const stories = new GlideRecord(storyTable);
  stories.query();
  const result = { updated: 0, already_current: 0, conflicts: 0, no_revision: 0 };
  while (stories.next()) {
    const storyId = String(stories.getUniqueValue());
    const latest = stories.getValue('workflow_change_key') ? currentRevision(stories) : highestRevision(storyId);
    if (!latest) { result.no_revision++; continue; }
    const revisionId = String(latest.getUniqueValue());
    const task = legalTaskForRevision(revisionId);
    const status = workflowStatus(stories, revisionId, task?.getValue('status'));
    const legalRequired = needsLegalClearance(stories) ? '1' : '0';
    if (stories.getValue('current_revision') === revisionId
      && stories.getValue('workflow_status') === status
      && (stories.getValue('legal_clearance_required') || '0') === legalRequired) { result.already_current++; continue; }
    const refreshed = guardedStoryUpdate(stories, {
      current_revision: revisionId, workflow_status: status, legal_clearance_required: legalRequired,
    }, true);
    if (refreshed?.getValue('current_revision') === revisionId && refreshed.getValue('workflow_status') === status
      && (refreshed.getValue('legal_clearance_required') || '0') === legalRequired) result.updated++;
    else result.conflicts++;
  }
  return result;
}
