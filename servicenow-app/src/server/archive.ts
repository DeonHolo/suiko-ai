import { GlideRecord, GlideDateTime, gs } from '@servicenow/glide';
import { ReviewValidationError } from './generated/assessment-checks.js';
import { WorkbenchError } from './workbench-error.ts';

// FE-02 (#2): archive storage, archive/restore actions and guarded deletion.
// See docs/25-workspace-service-contract.md "FE-02: Archive" and TEAM-TASKS.md.

const tables = {
  story: 'x_2236136_suiko_ai_story',
  rule: 'x_2236136_suiko_ai_rule',
  revision: 'x_2236136_suiko_ai_revision',
  rule_version: 'x_2236136_suiko_ai_rule_version',
  review: 'x_2236136_suiko_ai_review',
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
      ? error.message : 'The archive could not finish this action. Nothing was removed.',
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

function countReviews(kind: string, row: GlideRecord) {
  const reviews = new GlideRecord(tables.review);
  if (kind === 'story') reviews.addQuery('revision.story', id(row));
  else reviews.addQuery('request_json', 'CONTAINS', id(row));
  reviews.query();
  return Number(reviews.getRowCount());
}

function retentionReason(kind: string, row: GlideRecord) {
  if (protectedEvidence[kind].includes(id(row))) {
    return 'Protected capstone evidence from the acceptance report stays in this instance.';
  }
  if (countReviews(kind, row) > 0) {
    return kind === 'story'
      ? 'Retained AI review history depends on this story.'
      : 'Retained reviews used this rule, so its saved history stays readable.';
  }
  return null;
}

function childTable(kind: string) {
  return kind === 'story' ? tables.revision : tables.rule_version;
}

function childField(kind: string) {
  return kind === 'story' ? 'story' : 'parent_rule';
}

function countChildren(kind: string, row: GlideRecord) {
  const children = new GlideRecord(childTable(kind));
  children.addQuery(childField(kind), id(row));
  children.query();
  return Number(children.getRowCount());
}

function deletionSummary(kind: string, row: GlideRecord) {
  const saved = countChildren(kind, row);
  return kind === 'story'
    ? 'Removes this story, ' + saved + ' saved ' + (saved === 1 ? 'version' : 'versions') + ' and no AI reviews.'
    : 'Removes this rule and its ' + saved + ' saved ' + (saved === 1 ? 'version' : 'versions') + '.';
}

function itemView(kind: string, row: GlideRecord) {
  const reason = retentionReason(kind, row);
  return {
    id: id(row), title: row.getValue('title') || '', modified: String(row.getValue('sys_mod_count')),
    archived_at: row.getValue('archived_at') || '',
    can_restore: kind === 'story' ? canArchiveStories() : canArchiveRules(),
    can_delete: gs.hasRole('admin') && !reason,
    ...(reason ? { retention_reason: reason } : { delete_summary: deletionSummary(kind, row) }),
  };
}

const cursorPattern = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\|([a-f0-9]{32})$/;

function cursorToken(row: GlideRecord) {
  return row.getValue('sys_updated_on') + '|' + id(row);
}

const PAGE = 50;

export function getArchive(request, response) {
  respond(response, () => {
    const kind = String(request.queryParams.kind || '');
    kindTable(kind);
    requireArchiveRole(kind);
    const cursor = String(request.queryParams.cursor || '');
    let after = '';
    if (cursor) {
      const match = cursorPattern.exec(cursor);
      if (!match) throw new WorkbenchError('This archive page could not be opened. Return to the first page.');
      after = 'sys_updated_on<' + match[1] + '^ORsys_updated_on=' + match[1] + '^sys_id<' + match[2] + '^';
    }
    const rows = new GlideRecord(kindTable(kind));
    // Keyset page order stays stable: strictly older rows, or the same timestamp
    // with a smaller sys_id. The OR binds to the sys_updated_on conditions.
    rows.addEncodedQuery('archived=true^' + after + 'archived=true');
    // The repeated archived condition is intentional: it also applies after the
    // cursor's OR group so every row on every page is archived.    rows.orderByDesc('sys_updated_on');
    rows.orderByDesc('sys_id');
    rows.setLimit(PAGE + 1);
    rows.query();
    const items = [];
    let more = false;
    while (rows.next()) {
      if (items.length >= PAGE) { more = true; break; }
      items.push(itemView(kind, rows));
    }
    return { kind, items, next_cursor: more ? cursorToken(rows) : null };
  });
}

function guardedWrite(kind: string, row: GlideRecord, expectedModified: unknown, changes: Record<string, unknown>) {
  const sysId = id(row);
  const count = Number(row.getValue('sys_mod_count'));
  if (!Number.isInteger(Number(expectedModified)) || Number(expectedModified) !== count) {
    throw new WorkbenchError('This ' + kind + ' changed elsewhere. Reopen the Archive before acting again.', 409);
  }
  const update = new GlideRecord(kindTable(kind));
  update.addQuery('sys_id', sysId);
  update.addQuery('sys_mod_count', String(count));
  for (const [field, value] of Object.entries(changes)) update.setValue(field, value);
  update.updateMultiple();
  const refreshed = target(kind, sysId);
  if (Number(refreshed.getValue('sys_mod_count')) !== count + 1 || archived(refreshed) !== changes.archived) {
    throw new WorkbenchError('This ' + kind + ' changed elsewhere. Reopen the Archive before acting again.', 409);
  }
  return refreshed;
}

function removeWithChildren(kind: string, row: GlideRecord) {
  const children = new GlideRecord(childTable(kind));
  children.addQuery(childField(kind), id(row));
  children.query();
  while (children.next()) children.deleteRecord();
  row.deleteRecord();
}

export function postArchive(request, response) {
  respond(response, () => {
    const body = request.body.data;
    if (!body || typeof body !== 'object') throw new WorkbenchError('Supply the archive action as a JSON object.');
    const action = String(body.action || '');
    const kind = String(body.kind || '');
    kindTable(kind);
    const row = target(kind, body.id);
    if (action === 'delete') {
      if (!gs.hasRole('admin')) throw new WorkbenchError('Permanent deletion is an administrator action from the Archive.', 403);
      if (!archived(row)) throw new WorkbenchError('Only archived items can be deleted. Archive this ' + kind + ' first.', 409);
      const reason = retentionReason(kind, row);
      if (reason) throw new WorkbenchError('This ' + kind + ' stays archived. ' + reason, 409);
      guardedWrite(kind, row, body.expected_modified, { archived: true });
      removeWithChildren(kind, target(kind, body.id));
      return { deleted: true, id: String(body.id), kind };
    }
    requireArchiveRole(kind);
    if (action === 'archive') {
      if (archived(row)) throw new WorkbenchError('This ' + kind + ' is already archived. Reopen the Archive before acting again.', 409);
      const refreshed = guardedWrite(kind, row, body.expected_modified, {
        archived: true, archived_at: new GlideDateTime().getValue(), archived_by: String(gs.getUserID()),
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
  if (story.get(revision.getValue('story'))) assertStoryNotArchived(story);
}
