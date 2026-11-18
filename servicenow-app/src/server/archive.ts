import { GlideRecord, GlideDateTime, gs } from '@servicenow/glide';
import { ReviewValidationError } from './generated/assessment-checks.js';
import { WorkbenchError } from './workbench-error.ts';

// FE-02 (#2): archive storage, archive/restore actions and guarded deletion.
// See docs/25-workspace-service-contract.md "FE-02: Archive" and TEAM-TASKS.md.

const tables = {
  story: 'x_2236136_suiko_ai_story',
  rule: 'x_2236136_suiko_ai_rule',
  review: 'x_2236136_suiko_ai_review',
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
    const tasks = new GlideRecord(tables.legalTask);
    tasks.addQuery('story', id(row));
    tasks.setLimit(1);
    tasks.query();
    if (tasks.next()) return 'Retained legal review history depends on this story.';
  }
  if (hasRetainedReview(kind, row)) {
    return kind === 'story'
      ? 'Retained AI review history depends on this story.'
      : 'Retained reviews used this rule, so its saved history stays readable.';
  }
  return null;
}

// Keep the destructive action closed until the installed app can prove that a
// stale restore or refused child deletion leaves the entire record set intact.
const deletionPending = 'Permanent deletion is unavailable while safe removal of saved versions is being verified.';

function itemView(kind: string, row: GlideRecord) {
  return {
    id: id(row), title: row.getValue('title') || '', modified: String(row.getValue('sys_mod_count')),
    archived_at: row.getValue('archived_at') || '',
    can_restore: kind === 'story' ? canArchiveStories() : canArchiveRules(),
    can_delete: false, retention_reason: retentionReason(kind, row) || deletionPending,
  };
}

const cursorPattern = /^(story|rule)\|(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\|([a-f0-9]{32})$/;

function cursorToken(kind: string, row: GlideRecord) {
  return kind + '|' + row.getValue('sys_updated_on') + '|' + id(row);
}

const PAGE = 50;

export function getArchive(request, response) {
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
      items.push(itemView(kind, rows));
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
  for (const [field, value] of Object.entries(changes)) update.setValue(field, value);
  update.setValue('archive_change_key', changeKey);
  update.updateMultiple();
  const refreshed = target(kind, sysId);
  if (refreshed.getValue('archive_change_key') !== changeKey || archived(refreshed) !== changes.archived) {
    throw new WorkbenchError('This ' + kind + ' changed elsewhere. Reopen the Archive before acting again.', 409);
  }
  return refreshed;
}

export function postArchive(request, response) {
  respond(response, () => {
    const body = request.body.data;
    if (!body || typeof body !== 'object') throw new WorkbenchError('Supply the archive action as a JSON object.');
    const action = String(body.action || '');
    const kind = String(body.kind || '');
    kindTable(kind);
    if (action === 'delete') {
      if (!gs.hasRole('admin')) throw new WorkbenchError('Permanent deletion is an administrator action from the Archive.', 403);
      const row = target(kind, body.id);
      if (!archived(row)) throw new WorkbenchError('Only archived items can be deleted. Archive this ' + kind + ' first.', 409);
      expectedCount(kind, row, body.expected_modified);
      const reason = retentionReason(kind, row);
      if (reason) throw new WorkbenchError('This ' + kind + ' stays archived. ' + reason, 409);
      throw new WorkbenchError(deletionPending, 503);
    }
    requireArchiveRole(kind);
    const row = target(kind, body.id);
    if (action === 'archive') {
      if (archived(row)) throw new WorkbenchError('This ' + kind + ' is already archived. Reopen the Archive before acting again.', 409);
      const refreshed = guardedWrite(kind, row, body.expected_modified, {
        archived: true, archived_at: new GlideDateTime().getValue(), archived_by: String(gs.getUserID()),
        ...(kind === 'rule' ? { active: false } : {}),
      });
      return { item: itemView(kind, refreshed) };
    }
    if (action === 'restore') {
      if (!archived(row)) throw new WorkbenchError('This ' + kind + ' is not archived. Reopen the Archive before acting again.', 409);
      // A restored rule returns off until an editor turns it on again.
      const refreshed = guardedWrite(kind, row, body.expected_modified, {
        archived: false, archived_at: '', archived_by: '', ...(kind === 'rule' ? { active: false } : {}),
      });
      return { item: itemView(kind, refreshed) };
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
