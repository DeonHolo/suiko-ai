import { GlideDateTime, GlideRecord, GlideRecordSecure } from '@servicenow/glide';
import { WorkbenchError } from './workbench-error.ts';
import { deriveWorkflowStatus, legalTaskTable, requireEditor, revisionTable, storyTable, workflowStatuses } from './story-workflow.ts';

const pageSize = 50;
const batchSize = 100;

function badCursor() {
  return new WorkbenchError('This Inbox page could not be opened. Return to the first page.');
}

function parseCursor(token: string, search: string, status: string) {
  if (!token) return null;
  let parts;
  try {
    if (token.length > 2500) throw badCursor();
    parts = JSON.parse(decodeURIComponent(token));
  } catch {
    throw badCursor();
  }
  if (!Array.isArray(parts) || parts.length !== 4 || parts[0] !== search || parts[1] !== status
    || typeof parts[2] !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(parts[2])
    || !new GlideDateTime(parts[2]).isValid()
    || typeof parts[3] !== 'string' || !/^[a-f0-9]{32}$/.test(parts[3])) throw badCursor();
  return { updated: parts[2], id: parts[3] };
}

function readCandidates(search: string, after: { updated: string; id: string } | null) {
  const rows = new GlideRecordSecure(storyTable);
  rows.addQuery('archived', false).addOrCondition('archived', 'ISEMPTY', '');
  if (search) rows.addQuery('title', 'CONTAINS', search);

  // Split the boundary into two AND conditions. For timestamps older than
  // the cursor, the other branch of the second condition accepts any ID.
  if (after) {
    rows.addQuery('sys_updated_on', '<=', after.updated);
    rows.addQuery('sys_updated_on', '<', after.updated).addOrCondition('sys_id', '<', after.id);
  }
  rows.orderByDesc('sys_updated_on');
  rows.orderByDesc('sys_id');
  rows.setLimit(batchSize);
  rows.query();
  const batch = [];
  while (rows.next()) {
    if (!rows.canRead()) continue;
    batch.push({
      id: String(rows.getUniqueValue()), title: rows.getValue('title') || '',
      published: rows.getValue('current_revision'), status: rows.getValue('workflow_status'),
      updated_at: rows.getValue('sys_updated_on'), legacy: !rows.getValue('workflow_change_key'),
    });
  }
  return batch;
}

function readRevisions(ids: string[], field: 'sys_id' | 'story') {
  const results = new Map();
  if (!ids.length) return results;
  const rows = new GlideRecordSecure(revisionTable);
  rows.addQuery(field, 'IN', ids.join(','));
  if (field === 'story') { rows.orderByDesc('version'); rows.orderByDesc('sys_id'); }
  rows.query();
  while (rows.next()) {
    const key = rows.getValue(field);
    if (!results.has(key)) results.set(key, {
      id: String(rows.getUniqueValue()), story: rows.getValue('story'), version: Number(rows.getValue('version')),
      format: rows.getValue('content_format') || '',
    });
  }
  return results;
}

function readLegalStatuses(revisions: string[]) {
  const results = new Map<string, string>();
  if (!revisions.length) return results;
  const tasks = new GlideRecord(legalTaskTable);
  tasks.addQuery('revision', 'IN', revisions.join(','));
  tasks.query();
  while (tasks.next()) results.set(tasks.getValue('revision'), tasks.getValue('status'));
  return results;
}

export function listStories(params) {
  requireEditor();
  const search = String(params?.q || '').trim();
  const status = String(params?.status || '');
  if (search.length > 160) throw new WorkbenchError('Search with a title of up to 160 characters.');
  if (status && !workflowStatuses.includes(status)) throw new WorkbenchError('Choose a valid story status.');
  let after = parseCursor(String(params?.cursor || ''), search, status);
  const items = [];
  // Scan in timestamp order and look up only this batch's revisions and legal states.
  for (;;) {
    const batch = readCandidates(search, after);
    if (!batch.length) break;
    const published = readRevisions(batch.map(story => story.published).filter(Boolean), 'sys_id');
    const legacy = readRevisions(batch.filter(story => !story.published && story.legacy).map(story => story.id), 'story');
    const revisions = batch.map(story => {
      const revision = story.published ? published.get(story.published) : legacy.get(story.id);
      return revision?.story === story.id ? revision : null;
    });
    const legalStatuses = readLegalStatuses(revisions.filter(Boolean).map(revision => revision.id));
    for (const [index, story] of batch.entries()) {
      const revision = revisions[index];
      const revisionId = revision?.id || '';
      const currentStatus = deriveWorkflowStatus(story.published, story.status, revisionId, legalStatuses.get(revisionId));
      if (status && currentStatus !== status) continue;
      if (items.length === pageSize) {
        const last = items[items.length - 1];
        return { items, next_cursor: encodeURIComponent(JSON.stringify([search, status, last.updated_at, last.id])) };
      }
      items.push({
        id: story.id, title: story.title, version: revision?.version ?? null, content_format: revision?.format || '',
        status: currentStatus, updated_at: story.updated_at,
      });
    }
    if (batch.length < batchSize) break;
    const last = batch[batch.length - 1];
    after = { updated: last.updated_at, id: last.id };
  }
  return { items, next_cursor: null };
}
