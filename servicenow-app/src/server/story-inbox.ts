import { GlideDateTime, GlideRecordSecure } from '@servicenow/glide';
import { WorkbenchError } from './workbench-error.ts';
import { latestRevision, legalTaskForRevision, requireEditor, storyTable, workflowStatuses, workflowStatus } from './story-workflow.ts';

const pageSize = 50;

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

export function listStories(params) {
  requireEditor();
  const search = String(params?.q || '').trim();
  const status = String(params?.status || '');
  if (search.length > 160) throw new WorkbenchError('Search with a title of up to 160 characters.');
  if (status && !workflowStatuses.includes(status)) throw new WorkbenchError('Choose a valid story status.');
  const after = parseCursor(String(params?.cursor || ''), search, status);
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
  rows.query();

  const items = [];
  while (rows.next()) {
    if (!rows.canRead()) continue;
    const storyId = String(rows.getUniqueValue());
    const revision = latestRevision(storyId);
    const revisionId = revision ? String(revision.getUniqueValue()) : '';
    const task = revisionId ? legalTaskForRevision(revisionId) : null;
    const currentStatus = workflowStatus(rows, revisionId, task?.getValue('status'));
    if (status && currentStatus !== status) continue;
    if (items.length === pageSize) {
      const last = items[items.length - 1];
      return { items, next_cursor: encodeURIComponent(JSON.stringify([search, status, last.updated_at, last.id])) };
    }
    items.push({
      id: storyId, title: rows.getValue('title') || '',
      version: revision ? Number(revision.getValue('version')) : null,
      content_format: revision?.getValue('content_format') || '',
      status: currentStatus, updated_at: rows.getValue('sys_updated_on'),
    });
  }
  return { items, next_cursor: null };
}
