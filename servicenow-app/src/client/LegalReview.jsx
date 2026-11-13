import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Dialog from './Dialog';
import { workspaceService } from './services/ReviewService';
import { localDateTime } from './presentation';
import { href, isNormalClick } from './routes';

const statusLabels = { pending: 'Waiting for you', cleared: 'Cleared', changes_requested: 'Changes requested' };

export default function LegalReview({ taskId, onOpenTask, onBack, hasEditorAccess, onChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [actionError, setActionError] = useState('');
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    workspaceService.legal(taskId).then(next => { if (current) setData(next); })
      .catch(issue => { if (current) setError(issue.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [taskId, refresh]);

  const task = data?.task;
  async function decide(event) {
    event.preventDefault();
    setBusy(true);
    setActionError('');
    try {
      const updated = await workspaceService.legalDecision({ task_id: task.id, revision_id: task.revision.id, expected_modified: task.modified, action, note: note.trim() });
      setData(current => ({ ...current, task: updated.task }));
      setAction('');
      toast.success(action === 'clear' ? 'Version cleared' : 'Changes requested');
      try { await onChange?.(); }
      catch { toast.error('Decision saved. Choose Refresh story to reload its status.'); }
    } catch (issue) { setActionError(issue.message); }
    finally { setBusy(false); }
  }

  return <div className="list-page">
    {taskId && <button className="back-link" onClick={() => onOpenTask(null)}><span aria-hidden="true">← </span>Back to legal review</button>}
    <div className="page-heading"><h1>{task && !loading && !error ? task.title : 'Legal review'}</h1></div>
    {loading && <p role="status">Opening legal review…</p>}
    {error && <p className="error" role="alert">{error} <button onClick={() => setRefresh(value => value + 1)}>Try again</button></p>}
    {!loading && !error && !task && <section className="surface records" aria-label="Assigned legal reviews">
      {data?.tasks?.length ? <ul className="record-list">{data.tasks.map(item => <li key={item.id}>
        <a className="record-link" href={href('legal', item.id)} onClick={event => {
          if (!isNormalClick(event)) return;
          event.preventDefault(); onOpenTask(item.id);
        }}>
          <span className="record-info"><span className="record-name">{item.title}</span><span className="record-meta">Version {item.version} · {localDateTime(item.requested_at)}</span></span>
          <span className="status-label">{statusLabels[item.status]}</span><span className="record-arrow" aria-hidden="true">›</span>
        </a>
      </li>)}</ul> : <p className="list-message">You have no assigned legal reviews.</p>}
    </section>}
    {!loading && !error && task && <>
      <section className="surface legal-request">
        <div className="section-title"><h2>Version {task.revision.version}</h2><span className="status-label">{statusLabels[task.status]}</span></div>
        <h3>What to check</h3><p>{task.reason}</p>
        {task.requested_by && <p className="hint">Requested by {task.requested_by} · {localDateTime(task.requested_at)}</p>}
      </section>
      <section className="surface legal-request"><h2>Draft sent to legal</h2><h3>{task.revision.title}</h3><div className="draft-copy">{task.revision.text}</div>
        {task.revision.notes && <><h3>Story notes</h3><div className="draft-copy">{task.revision.notes}</div></>}
      </section>
      {task.decision && <section className="surface legal-request"><h2>{statusLabels[task.status]}</h2>
        <p>{task.decision.note}</p><p className="hint">{task.decision.actor} · {localDateTime(task.decision.decided_at)}</p></section>}
      {task.actions?.length > 0 && <div className="actions">
        {task.actions.includes('request_changes') && <button onClick={() => { setAction('request_changes'); setNote(''); setActionError(''); }}>Request changes</button>}
        {task.actions.includes('clear') && <button className="primary" onClick={() => { setAction('clear'); setNote(''); setActionError(''); }}>Clear this version</button>}
      </div>}
    </>}
    {hasEditorAccess && <button className="quiet" onClick={onBack}>Go to Stories</button>}
    {action && <Dialog title={action === 'clear' ? 'Clear version ' + task.revision.version + '?' : 'Request changes to version ' + task.revision.version + '?'} busy={busy} onClose={() => setAction('')}>
      <form onSubmit={decide}><label>{action === 'clear' ? 'Note (optional)' : 'What needs to change?'}
        <textarea required={action !== 'clear'} disabled={busy} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} />
      </label>
      {actionError && <p className="error" role="alert">{actionError}</p>}
      <div className="actions dialog-actions"><button type="button" disabled={busy} onClick={() => setAction('')}>Cancel</button>
        <button className="primary" disabled={busy || (action === 'request_changes' && !note.trim())}>{busy ? 'Saving…' : action === 'clear' ? 'Clear this version' : 'Request changes'}</button></div></form>
    </Dialog>}
  </div>;
}
