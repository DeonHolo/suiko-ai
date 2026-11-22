import { GlideRecord, GlideDateTime, gs } from '@servicenow/glide';
import { ReviewValidationError } from './generated/assessment-checks.js';
import { WorkbenchError } from './workbench-error.ts';

// FE-02 (#2): archive storage, archive/restore actions and guarded deletion.
// See docs/25-workspace-service-contract.md "FE-02: Archive" and TEAM-TASKS.md.

const tables = {
  story: 'x_2236136_suiko_ai_story',
  rule: 'x_2236136_suiko_ai_rule',
  revision: 'x_2236136_suiko_ai_revision',
  ruleVersion: 'x_2236136_suiko_ai_rule_version',
  review: 'x_2236136_suiko_ai_review',
  decision: 'x_2236136_suiko_ai_decision',
  legalTask: 'x_2236136_suiko_ai_legal_task',
};

// Capstone evidence recorded in docs/23-acceptance-results.md. These records stay
// in the instance even when an administrator marks or treats them as disposable.
const protectedEvidence = {
  story: [
    '89688f4583e4db106fffc629feaad327', // Article story
    'eaa8c78583e4db106fffc629feaad33e', // Script story
  ],
  rule: [
    'c1484b4583e4db106fffc629feaad326', // Headline rule
  ],
};

const id = row => String(row.getUniqueValue());
const archived = row => row.getValue('archived') === '1';
const canArchiveStories = () => gs.hasRole('admin') || gs.hasRole('x_2236136_suiko_ai.editor');
const canArchiveRules = () => gs.hasRole('admin') || gs.hasRole('x_2236136_suiko_ai.rules_editor');
export { canArchiveStories, canArchiveRules };

function respond(response, action) {
  try {
    response.setBody(action());
  } catch (error) {
    response.setStatus(error instanceof WorkbenchError ? error.status : error instanceof ReviewValidationError ? 400 : 500);
    response.setBody({ message: error instanceof WorkbenchError || error instanceof ReviewValidationError
      ? error.message : 'The archive could not finish this action. Refresh the archive and try again.',
      details: error instanceof WorkbenchError ? error.details : error instanceof ReviewValidationError ? error.issues : null });
  }
}

function kindTable(kind: string) {
  if (kind !== 'story' && kind !== 'rule') throw new WorkbenchError('Choose an archived story or rule.');
  return tables[kind];
}

function requireArchiveRole(kind: string) {
  if (kind === 'story' ? !canArchiveStories() : !canArchiveRules()) {
    throw new WorkbenchError('Only editors manage archived stories, and the designated rules editor manages archived rules.', 403);
  }
}

function target(kind: string, sysId: unknown) {
  if (typeof sysId !== 'string' || !/^[a-f0-9]{32}$/.test(sysId)) throw new WorkbenchError('Choose a saved record.');
  const row = new GlideRecord(kindTable(kind));
  if (!row.get(sysId)) throw new WorkbenchError('This saved record could not be found.', 404);
  return row;
}

function hasRetainedReview(kind: string, row: GlideRecord) {
  const reviews = new GlideRecord(tables.review);
  if (kind === 'story') reviews.addQuery('revision.story', id(row));
  else {
    const snapshot = reviews.addQuery('request_json', 'CONTAINS', id(row));
    const ruleId = row.getValue('rule_id');
    if (ruleId) snapshot.addOrCondition('request_json', 'CONTAINS', JSON.stringify(ruleId));
  }
  reviews.setLimit(1);
  reviews.query();
  return reviews.next();
}

function retentionReason(kind: string, row: GlideRecord) {
  if (row.getValue('protected_evidence') === '1') {
    return 'This item was marked as protected evidence.';
  }
  if (protectedEvidence[kind].includes(id(row))) {
    return 'Protected capstone evidence from the acceptance report stays in this instance.';
  }
  if (kind === 'story') {
    if (row.getValue('editor_decision_head')) return 'Retained editor decision history depends on this story.';
    const tasks = new GlideRecord(tables.legalTask);
    tasks.addQuery('story', id(row)).addOrCondition('revision.story', id(row));
    tasks.setLimit(1);
    tasks.query();
    if (tasks.next()) return 'Retained legal review history depends on this story.';
    const decisions = new GlideRecord(tables.decision);
    decisions.addQuery('story', id(row)).addOrCondition('revision.story', id(row));
    decisions.setLimit(1);
    decisions.query();
    if (decisions.next()) return 'Retained editor decision history depends on this story.';
  }
  if (hasRetainedReview(kind, row)) {
    return kind === 'story'
      ? 'Retained AI review history depends on this story.'
      : 'Retained reviews used this rule, so its saved history stays readable.';
  }
  return null;
}

const deleteFlag = 'x_2236136_suiko_ai.archive_delete_enabled';
const deleteReservation = 'archive_delete_key';
const writeReservation = 'archive_write_key';

// An archive or deletion cannot overtake a write that can add a child to the
// record set. This transient reservation does not change the editor's version.
export function withArchiveWriter<T>(kind: string, sysId: string, write: () => T): T {
  const token = String(gs.generateGUID());
  const table = kindTable(kind);
  const claim = new GlideRecord(table);
  claim.addQuery('sys_id', sysId);
  claim.addQuery('archived', false).addOrCondition('archived', 'ISEMPTY', '');
  claim.addNullQuery(deleteReservation);
  claim.addNullQuery(writeReservation);
  claim.autoSysFields(false);
  claim.setValue(writeReservation, token);
  claim.updateMultiple();
  if (target(kind, sysId).getValue(writeReservation) !== token) {
    throw new WorkbenchError('This ' + kind + ' is archived or another change is being saved. Reopen it before trying again.', 409);
  }
  try {
    return write();
  } finally {
    releaseReservation(table, sysId, writeReservation, token, false);
  }
}

function releaseReservation(table: string, sysId: string, field: string, token: string, audit: boolean) {
  const release = new GlideRecord(table);
  release.addQuery('sys_id', sysId);
  release.addQuery(field, token);
  if (!audit) release.autoSysFields(false);
  // GlideRecord.updateMultiple ignores empty strings when clearing a field.
  release.setValue(field, 'NULL');
  release.updateMultiple();
}

function savedChildren(kind: string, sysId: string) {
  const children = new GlideRecord(kind === 'story' ? tables.revision : tables.ruleVersion);
  children.addQuery(kind === 'story' ? 'story' : 'parent_rule', sysId);
  children.query();
  return children;
}

function deletionReason(kind: string, row: GlideRecord) {
  const retained = retentionReason(kind, row);
  if (retained) return retained;
  if (kind === 'story' && row.getValue('disposable') !== '1') return 'Only stories marked as disposable demos can be permanently deleted.';
  if (kind === 'rule' && row.getValue('approved_json')) return 'Previously approved rules stay archived to preserve their publishing history.';
  return null;
}

function deletionEnabled() {
  return gs.getProperty(deleteFlag, 'false') === 'true';
}

function scopedDeletionConfiguration(kind: string, sysId: string) {
  const parentTable = kindTable(kind);
  const versionTable = kind === 'story' ? tables.revision : tables.ruleVersion;
  const ownedField = kind === 'story' ? 'story' : 'parent_rule';
  const allowedReferences = kind === 'story' ? [
    tables.story + '.current_revision',
    tables.revision + '.story',
    tables.decision + '.story',
    tables.decision + '.revision',
    tables.review + '.revision',
    tables.legalTask + '.story',
    tables.legalTask + '.revision',
  ] : [tables.ruleVersion + '.parent_rule'];
  const dictionary = new GlideRecord('sys_dictionary');
  dictionary.addQuery('reference', 'IN', parentTable + ',' + versionTable);
  dictionary.query();
  let ownedCascade = false;
  while (dictionary.next()) {
    const name = dictionary.getValue('name');
    const field = dictionary.getValue('element');
    if (!allowedReferences.includes(name + '.' + field)) return 'This item has a reference type that Archive cannot remove safely.';
    if (name === versionTable && field === ownedField && dictionary.getValue('reference_cascade_rule') === 'delete') {
      ownedCascade = true;
    }
  }
  if (!ownedCascade) return 'ServiceNow could not verify safe removal of the saved versions.';
  const rules = new GlideRecord('sys_script');
  rules.addQuery('collection', 'IN', parentTable + ',' + versionTable);
  rules.addQuery('active', true);
  rules.addQuery('action_delete', true);
  rules.query();
  const ownGuard = 'Suiko Archive owns ' + kind + ' deletion';
  let installedGuard = false;
  while (rules.next()) {
    if (rules.getValue('collection') !== parentTable || rules.getValue('name') !== ownGuard) {
      return 'A separate ServiceNow delete rule can prevent safe removal of the saved set.';
    }
    installedGuard = true;
  }
  if (!installedGuard) return 'ServiceNow could not verify the Archive delete guard.';
  const attachments = new GlideRecord('sys_attachment');
  attachments.addQuery('table_sys_id', sysId);
  attachments.addQuery('table_name', parentTable);
  attachments.setLimit(1);
  attachments.query();
  if (attachments.next()) return 'An attachment still depends on this item.';
  return null;
}

function itemView(kind: string, row: GlideRecord, deleteEnabled: boolean) {
  const reason = deletionReason(kind, row) || (row.getValue(deleteReservation)
    ? 'Permanent deletion is already in progress.' : null);
  const canDelete = archived(row) && !reason && gs.hasRole('admin') && deleteEnabled;
  let deleteSummary;
  if (canDelete) {
    const count = savedChildren(kind, id(row)).getRowCount();
    deleteSummary = 'Permanently removes this ' + kind + ' and ' + count + ' saved version'
      + (count === 1 ? '' : 's') + '. You cannot undo this.';
  }
  return {
    id: id(row), title: row.getValue('title') || '', modified: String(row.getValue('sys_mod_count')),
    archived_at: row.getValue('archived_at') || '',
    can_restore: !row.getValue(deleteReservation) && (kind === 'story' ? canArchiveStories() : canArchiveRules()),
    can_delete: canDelete, retention_reason: reason,
    ...(deleteSummary ? { delete_summary: deleteSummary } : {}),
  };
}

const cursorPattern = /^(story|rule)\|(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\|([a-f0-9]{32})$/;

function cursorToken(kind: string, row: GlideRecord) {
  return kind + '|' + row.getValue('sys_updated_on') + '|' + id(row);
}

const PAGE = 50;

export function getArchive(request, response) {
  return getArchiveForTest(request, response, deletionEnabled());
}

export function getArchiveForTest(request, response, deleteEnabled: boolean) {
  respond(response, () => {
    const kind = String(request.queryParams.kind || '');
    kindTable(kind);
    requireArchiveRole(kind);
    const cursor = String(request.queryParams.cursor || '');
    const rows = new GlideRecord(kindTable(kind));
    if (cursor) {
      const match = cursorPattern.exec(cursor);
      if (!match || match[1] !== kind || !new GlideDateTime(match[2]).isValid()) {
        throw new WorkbenchError('This archive page could not be opened. Return to the first page.');
      }
      const [, , updated, rowId] = match;
      // Both branches require archived=true. Only equal timestamps use the ID bound.
      rows.addEncodedQuery('archived=true^sys_updated_on<' + updated
        + '^NQarchived=true^sys_updated_on=' + updated + '^sys_id<' + rowId);
    } else rows.addQuery('archived', true);
    rows.orderByDesc('sys_updated_on');
    rows.orderByDesc('sys_id');
    rows.setLimit(PAGE + 1);
    rows.query();
    const items = [];
    let lastReturned = null;
    while (rows.next()) {
      if (items.length === PAGE) return { kind, items, next_cursor: lastReturned };
      items.push(itemView(kind, rows, deleteEnabled));
      lastReturned = cursorToken(kind, rows);
    }
    return { kind, items, next_cursor: null };
  });
}

function expectedCount(kind: string, row: GlideRecord, expectedModified: unknown) {
  const count = Number(row.getValue('sys_mod_count'));
  if ((typeof expectedModified !== 'string' && typeof expectedModified !== 'number')
    || !/^\d+$/.test(String(expectedModified)) || !Number.isSafeInteger(count) || Number(expectedModified) !== count) {
    throw new WorkbenchError('This ' + kind + ' changed elsewhere. Reopen the Archive before acting again.', 409);
  }
  return count;
}

function guardedWrite(kind: string, row: GlideRecord, expectedModified: unknown, changes: Record<string, unknown>) {
  const sysId = id(row);
  const count = expectedCount(kind, row, expectedModified);
  const changeKey = String(gs.generateGUID());
  const update = new GlideRecord(kindTable(kind));
  update.addQuery('sys_id', sysId);
  update.addQuery('sys_mod_count', String(count));
  update.addNullQuery(deleteReservation);
  update.addNullQuery(writeReservation);
  for (const [field, value] of Object.entries(changes)) update.setValue(field, value);
  update.setValue('archive_change_key', changeKey);
  update.updateMultiple();
  const refreshed = target(kind, sysId);
  if (refreshed.getValue('archive_change_key') !== changeKey || archived(refreshed) !== changes.archived) {
    throw new WorkbenchError('This ' + kind + ' changed elsewhere. Reopen the Archive before acting again.', 409);
  }
  return refreshed;
}

function deleteArchived(kind: string, row: GlideRecord, expectedModified: unknown, enabled: boolean) {
  if (!archived(row)) throw new WorkbenchError('Only archived items can be deleted. Archive this ' + kind + ' first.', 409);
  const count = expectedCount(kind, row, expectedModified);
  const blocked = deletionReason(kind, row);
  if (blocked) throw new WorkbenchError('This ' + kind + ' stays archived. ' + blocked, 409);
  if (!enabled) throw new WorkbenchError('Permanent deletion is not enabled on this instance.', 503);
  const sysId = id(row);
  const token = String(gs.generateGUID());
  const claim = new GlideRecord(kindTable(kind));
  claim.addQuery('sys_id', sysId);
  claim.addQuery('sys_mod_count', String(count));
  claim.addQuery('archived', true);
  claim.addNullQuery(deleteReservation);
  claim.addNullQuery(writeReservation);
  claim.setValue(deleteReservation, token);
  claim.updateMultiple();
  const locked = target(kind, sysId);
  if (locked.getValue(deleteReservation) !== token || !archived(locked)) {
    throw new WorkbenchError('This ' + kind + ' changed elsewhere. Reopen the Archive before acting again.', 409);
  }
  try {
    const retained = deletionReason(kind, locked);
    if (retained) throw new WorkbenchError('This ' + kind + ' stays archived. ' + retained, 409);
    const configuration = scopedDeletionConfiguration(kind, sysId);
    if (configuration) throw new WorkbenchError('This ' + kind + ' stays archived. ' + configuration, 409);
    // The only cascade is the parent-owned versions. Retained review and
    // decision references restrict deletion at the platform's data layer.
    if (!locked.deleteRecord()) {
      throw new WorkbenchError('ServiceNow refused to remove this ' + kind + '. It stays archived.', 409);
    }
    if (savedChildren(kind, sysId).hasNext()) {
      throw new WorkbenchError('ServiceNow could not confirm removal of the complete saved set.', 500);
    }
    return { deleted: true, kind, id: sysId };
  } finally {
    releaseReservation(kindTable(kind), sysId, deleteReservation, token, true);
  }
}

export function postArchive(request, response) {
  return postArchiveForTest(request, response, deletionEnabled());
}

export function postArchiveForTest(request, response, deleteEnabled: boolean) {
  respond(response, () => {
    const body = request.body.data;
    if (!body || typeof body !== 'object') throw new WorkbenchError('Supply the archive action as a JSON object.');
    const action = String(body.action || '');
    const kind = String(body.kind || '');
    kindTable(kind);
    if (action === 'delete') {
      if (!gs.hasRole('admin')) throw new WorkbenchError('Permanent deletion is an administrator action from the Archive.', 403);
      return deleteArchived(kind, target(kind, body.id), body.expected_modified, deleteEnabled);
    }
    requireArchiveRole(kind);
    const row = target(kind, body.id);
    if (action === 'archive') {
      if (archived(row)) throw new WorkbenchError('This ' + kind + ' is already archived. Reopen the Archive before acting again.', 409);
      const refreshed = guardedWrite(kind, row, body.expected_modified, {
        archived: true, archived_at: new GlideDateTime().getValue(), archived_by: String(gs.getUserID()),
        ...(kind === 'rule' ? { active: false } : {}),
      });
      return { item: itemView(kind, refreshed, deleteEnabled) };
    }
    if (action === 'restore') {
      if (!archived(row)) throw new WorkbenchError('This ' + kind + ' is not archived. Reopen the Archive before acting again.', 409);
      // A restored rule returns off until an editor turns it on again.
      const refreshed = guardedWrite(kind, row, body.expected_modified, {
        archived: false, archived_at: 'NULL', archived_by: 'NULL', ...(kind === 'rule' ? { active: false } : {}),
      });
      return { item: itemView(kind, refreshed, deleteEnabled) };
    }
    throw new WorkbenchError('Choose archive, restore or delete.');
  });
}

// Guards used by the everyday save/review paths: archived stories cannot receive
// new versions, reviews or human decisions; archived rules stay out of new reviews.
export function assertStoryNotArchived(story: GlideRecord) {
  if (archived(story)) {
    throw new WorkbenchError('This story is archived. Restore it from the Archive before saving changes.', 409);
  }
}

export function assertRevisionNotArchived(revision: GlideRecord) {
  const story = new GlideRecord(tables.story);
  if (!story.get(revision.getValue('story'))) throw new WorkbenchError('This saved version has no story.', 409);
  assertStoryNotArchived(story);
}

export function guardArchiveParentDelete(current: GlideRecord) {
  if (!gs.hasRole('admin') || !archived(current) || !current.getValue(deleteReservation)) {
    current.setAbortAction(true);
  }
}
