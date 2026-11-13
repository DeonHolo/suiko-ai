import React, { useState } from 'react';
import { toast } from 'sonner';
import Dialog from './Dialog';
import { workspaceService } from './services/ReviewService';
import { localDateTime, workflowLabels } from './presentation';

const labels = { request_changes: 'Request changes', send_to_legal: 'Send to legal', sign_off: 'Sign off', clear: 'Clear for sign-off' };

function Decisions({ history }) {
  if (!history?.length) return null;
  return <section className="surface decisions"><h2>Team decisions</h2>
    <ol>{history.map(decision => <li key={decision.id}>
      <strong>{decision.label || labels[decision.action]}</strong>
      <span className="record-meta">{[decision.actor, decision.version && 'Version ' + decision.version, localDateTime(decision.decided_at)].filter(Boolean).join(' · ')}</span>
      {decision.note && <p>{decision.note}</p>}
    </li>)}</ol>
  </section>;
}

export function StoryWorkflow({ state, revision, disabled, onChange }) {
  const [action, setAction] = useState(null);
  const [note, setNote] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!state || !revision) return null;
  const send = action === 'send_to_legal';
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await workspaceService.workflowAction({ revision_id: revision.id, action, note: note.trim(), ...(send ? { reviewer_id: reviewer } : {}) });
      setAction(null);
      toast.success(action === 'sign_off' ? 'Version signed off' : send ? 'Sent to legal' : 'Changes requested');
      try { await onChange(); }
      catch { toast.error('Decision saved. Reopen the story to refresh its status.'); }
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }
  return <>
    <section className="surface workflow" aria-label="Story status">
      <div><h2>Story status</h2><p>{workflowLabels[state.status] || 'Needs review'}</p></div>
      <div className="actions">{(state.actions || []).filter(value => ['request_changes', 'send_to_legal', 'sign_off'].includes(value)).map(value =>
        <button key={value} disabled={disabled || busy} onClick={() => { setNote(''); setReviewer(''); setError(''); setAction(value); }}>{labels[value]}</button>)}</div>
    </section>
    <Decisions history={state.history} />
    {action && <Dialog title={labels[action] + ' for version ' + revision.version} onClose={() => setAction(null)} busy={busy}>
      <form onSubmit={submit}>
        {send && <label>Legal reviewer<select required disabled={busy} value={reviewer} onChange={event => setReviewer(event.target.value)}>
          <option value="">Choose a reviewer</option>{(state.reviewers || []).map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select></label>}
        <label>{send ? 'What should legal check?' : action === 'request_changes' ? 'What needs to change?' : 'Note (optional)'}
          <textarea rows={3} required={action !== 'sign_off'} disabled={busy} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions dialog-actions"><button type="button" disabled={busy} onClick={() => setAction(null)}>Cancel</button>
          <button className="primary" disabled={busy || (action !== 'sign_off' && !note.trim()) || (send && !reviewer)}>{busy ? 'Saving…' : labels[action]}</button></div>
      </form>
    </Dialog>}
  </>;
}
