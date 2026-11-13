import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Dialog from './Dialog';
import { workspaceService } from './services/ReviewService';
import { localDateTime } from './presentation';
import { href, isNormalClick } from './routes';

export default function Archive({ onChange, canManageRules, onOpenStory }) {
  const [kind, setKind] = useState('story');
  const [page, setPage] = useState({ items: [], next_cursor: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [target, setTarget] = useState(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const requestVersion = useRef(0);

  useEffect(() => {
    requestVersion.current++;
    let current = true;
    setError('');
    setLoading(true);
    workspaceService.archive({ kind, cursor: '' }).then(next => {
      if (current) setPage(next);
    }).catch(issue => {
      if (current) setError(issue.message);
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; requestVersion.current++; };
  }, [kind, refresh]);

  async function more() {
    const version = requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const next = await workspaceService.archive({ kind, cursor: page.next_cursor });
      if (version === requestVersion.current) setPage(previous => ({ items: [...previous.items, ...next.items], next_cursor: next.next_cursor }));
    } catch (issue) { if (version === requestVersion.current) setError(issue.message); }
    finally { if (version === requestVersion.current) setLoading(false); }
  }

  async function apply() {
    setBusy(true);
    setActionError('');
    const restoring = target.action === 'restore';
    try {
      await workspaceService.changeArchive(target.action, kind, target.item);
      setTarget(null);
      setRefresh(value => value + 1);
      toast.success((kind === 'story' ? 'Story' : 'Rule') + (restoring ? ' restored' : ' deleted'));
      try { await onChange(); }
      catch { toast.error('Archive updated. Reopen the workspace to refresh your lists.'); }
    } catch (issue) { setActionError(issue.message); }
    finally { setBusy(false); }
  }

  return <div className="list-page">
    <div className="page-heading"><h1>Archive</h1></div>
    <p className="intro">Restore stories and rules you want to use again.</p>
    {canManageRules && <div className="segment" aria-label="Archived items">
      <button aria-pressed={kind === 'story'} disabled={loading || busy} onClick={() => setKind('story')}>Stories</button>
      <button aria-pressed={kind === 'rule'} disabled={loading || busy} onClick={() => setKind('rule')}>Rules</button>
    </div>}
    <section className="surface records" aria-label="Archive contents" aria-busy={loading}>
      {loading && <p className="list-message" role="status">Opening the archive…</p>}
      {error && <p className="error" role="alert">{error} <button onClick={() => setRefresh(value => value + 1)}>Try again</button></p>}
      {!loading && !error && !page.items.length && <p className="list-message">No archived {kind === 'story' ? 'stories' : 'rules'}.</p>}
      {!loading && !error && !!page.items.length && <ul className="record-list">
        {page.items.map(item => <li className="record-row" key={item.id}>
          <div className="record-info">
            {kind === 'story' ? <a className="record-name" href={href('story', item.id)} onClick={event => {
              if (!isNormalClick(event)) return;
              event.preventDefault();
              onOpenStory(item.id);
            }}>{item.title}</a> : <strong className="record-name">{item.title}</strong>}
            {item.archived_at && <span className="record-meta">Archived {localDateTime(item.archived_at)}</span>}
            {item.retention_reason && <p className="hint">{item.retention_reason}</p>}
          </div>
          <div className="row-actions">
            {item.can_restore && <button aria-label={'Restore ' + item.title} onClick={() => { setActionError(''); setTarget({ action: 'restore', item }); }}>Restore</button>}
            {item.can_delete && <button className="danger-quiet" aria-label={'Delete permanently: ' + item.title} onClick={() => { setActionError(''); setTarget({ action: 'delete', item }); }}>Delete permanently</button>}
          </div>
        </li>)}
      </ul>}
      {!loading && !error && page.next_cursor && <div className="list-footer"><button onClick={more}>Show more</button></div>}
    </section>
    {target && <Dialog title={target.action === 'restore' ? 'Restore this ' + kind + '?' : 'Permanently delete this ' + kind + '?'} busy={busy} onClose={() => setTarget(null)}>
      <p><strong>{target.item.title}</strong></p>
      <p>{target.action === 'restore' ? (kind === 'rule' ? 'The rule will return to your rules list. Turn it on there when it’s ready.' : 'The story and its saved reviews will return to Stories.')
        : target.item.delete_summary || 'This removes the archived item and its saved copies. You cannot undo this.'}</p>
      {actionError && <p className="error" role="alert">{actionError}</p>}
      <div className="actions dialog-actions"><button type="button" disabled={busy} onClick={() => setTarget(null)}>Cancel</button>
        <button className={target.action === 'delete' ? 'danger' : 'primary'} disabled={busy} onClick={apply}>
          {busy ? 'Working…' : target.action === 'restore' ? 'Restore ' + kind : 'Delete permanently'}
        </button></div>
    </Dialog>}
  </div>;
}
