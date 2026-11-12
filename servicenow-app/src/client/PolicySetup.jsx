import React, { useState } from 'react';
import { reviewService } from './services/ReviewService';

const blank = { title: '', text: '' };

export function OriginalPolicy({ origin, initial }) {
  const [policy, setPolicy] = useState(initial?.id === origin.policy_version_id ? initial : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (policy || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await reviewService.policies(origin.policy_version_id);
      setPolicy(result.policy);
    } catch (issue) {
      setError(issue.message);
    } finally {
      setLoading(false);
    }
  }

  return <details className="policy-original" onToggle={event => { if (event.currentTarget.open && !error) load(); }}>
    <summary>Original policy wording</summary>
    {loading && <p role="status">Opening the saved policy…</p>}
    {error && <p role="alert">{error} <button type="button" onClick={load}>Try again</button></p>}
    {policy && <>
      <p className="hint">{policy.title} · Saved {policy.saved_at} UTC</p>
      {policy.passages.filter(passage => origin.passage_ids.includes(passage.id)).map(passage =>
        <blockquote key={passage.id}>{passage.text}</blockquote>)}
    </>}
  </details>;
}

function ProposalEvidence({ evidence, policy }) {
  return evidence.map(reference => <details key={reference.passage_id + reference.quote} className="policy-original" open>
    <summary>Original policy passage {reference.passage_id.replace('policy-', '')}</summary>
    <blockquote>{reference.quote}</blockquote>
    {policy.passages.find(passage => passage.id === reference.passage_id)?.text !== reference.quote
      && <details><summary>Read the full paragraph</summary><blockquote>{policy.passages.find(passage => passage.id === reference.passage_id)?.text}</blockquote></details>}
  </details>);
}

export default function PolicySetup({ disabled, providerReady, onUse }) {
  const [versions, setVersions] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [draft, setDraft] = useState(blank);
  const [saveKey, setSaveKey] = useState(() => crypto.randomUUID());
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const dirty = draft.title !== (policy?.title || '') || draft.text !== (policy?.text || '');
  const unavailable = disabled || busy;

  async function act(task) {
    setBusy(true);
    setError('');
    setMessage('');
    try { await task(); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }
  function openCopy(value) {
    return act(async () => {
      const next = await reviewService.policies(value);
      setVersions(next.versions);
      setPolicy(next.policy);
      setDraft(next.policy ? { title: next.policy.title, text: next.policy.text } : blank);
      setResult(null);
      setSaveKey(crypto.randomUUID());
    });
  }
  function update(field, value) {
    setDraft(current => ({ ...current, [field]: value }));
    setSaveKey(crypto.randomUUID());
  }
  function save() {
    return act(async () => {
      const next = await reviewService.savePolicy({ ...draft, request_key: saveKey });
      setVersions(next.versions);
      setPolicy(next.policy);
      setDraft({ title: next.policy.title, text: next.policy.text });
      setResult(null);
      setMessage('Policy copy saved. Choose a passage or ask Suiko to suggest checks.');
    });
  }
  function suggest(passageId = null) {
    return act(async () => {
      const next = await reviewService.suggestPolicy(policy, passageId);
      setResult({ ...next, proposals: next.proposals.map((proposal, index) => ({ ...proposal, index })) });
      if (!next.proposals.length && !next.questions.length) setMessage('There are no usable suggestions for this copy. You can use the original wording.');
    });
  }
  function useWording(passage) {
    onUse({
      title: policy.title,
      text: passage.text,
      origin: { kind: 'policy', policy_version_id: policy.id, passage_ids: [passage.id] },
    }, policy);
  }

  return <details className="card policy-setup" onToggle={event => {
    if (event.currentTarget.open && versions === null && !busy && !error) openCopy('');
  }}>
    <summary>Company policy</summary>
    <p>Paste your publication’s rules. Use the original wording or ask Suiko for suggested checks.</p>
    <div aria-live="polite">
      {busy && <p role="status">Working with your saved policy…</p>}
      {message && <p className="notice">{message}</p>}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
    {versions === null && error && <button disabled={unavailable} onClick={() => openCopy('')}>Reload policy copies</button>}
    {!!versions?.length && <label>Saved policy copies<select disabled={unavailable || dirty} value={policy?.id || ''}
      onChange={event => openCopy(event.target.value)}>
      <option value="">New policy</option>
      {versions.map(copy => <option key={copy.id} value={copy.id}>{copy.title} · {copy.saved_at} UTC</option>)}
    </select></label>}
    <form onSubmit={event => { event.preventDefault(); save(); }}>
      <label>Policy title<input required maxLength={160} disabled={unavailable} value={draft.title} onChange={event => update('title', event.target.value)} /></label>
      <label>Policy text<textarea required maxLength={12000} disabled={unavailable} value={draft.text} onChange={event => update('text', event.target.value)} /></label>
      <div className="actions">
        <button disabled={unavailable || !dirty || !draft.title.trim() || !draft.text.trim()}>Save policy copy</button>
        {dirty && <button type="button" disabled={unavailable} onClick={() => {
          setDraft(policy ? { title: policy.title, text: policy.text } : blank);
          setSaveKey(crypto.randomUUID());
        }}>Discard unsaved changes</button>}
        {policy && !dirty && <button type="button" disabled={unavailable || !providerReady} onClick={() => suggest()}>Suggest checks</button>}
      </div>
    </form>
    {policy && dirty && <p className="hint">Save this edit as a new copy before using it.</p>}
    {policy && !dirty && <>
      <p className="hint">Saved {policy.saved_at} UTC{policy.saved_by ? ' by ' + policy.saved_by : ''}.</p>
      {!providerReady && <p className="hint">You can use the original wording now. Suggestions need Gemini setup.</p>}
      <details className="policy-original"><summary>Use or refine a passage</summary>
        {policy.passages.map((passage, index) => <section className="change" key={passage.id}>
          <h4>Passage {index + 1}</h4><blockquote>{passage.text}</blockquote>
          <div className="actions">
            <button disabled={unavailable || [...passage.text].length > 3000} onClick={() => useWording(passage)}>Use this wording</button>
            <button disabled={unavailable || !providerReady} onClick={() => suggest(passage.id)}>Suggest a check for this passage</button>
          </div>
          {[...passage.text].length > 3000 && <p className="hint">Save a shorter policy passage to use it word for word in a rule.</p>}
        </section>)}
      </details>
      {result && <div className="policy-suggestions">
        {!!result.proposals.length && <h3>Suggested checks</h3>}
        {result.skipped > 0 && <p className="notice">{result.skipped} suggestions or questions could not be matched to the saved policy. You can use the original wording or ask again.</p>}
        {result.proposals.map(proposal => <article key={proposal.index} className="change">
          <h4>{proposal.definition.title}</h4><p>{proposal.definition.text}</p>
          <p className="hint">{proposal.definition.formats.join(', ')} · {proposal.definition.content_kinds.join(', ')}</p>
          {proposal.definition.conditions && <p>{proposal.definition.conditions}</p>}
          <p className="hint">{proposal.checks.join(' · ')}</p>
          {proposal.definition.human_checks.map((check, index) => <p key={index}>{check}</p>)}
          <ProposalEvidence evidence={proposal.evidence} policy={policy} />
          <div className="actions">
            <button disabled={unavailable} onClick={() => onUse(proposal.definition, policy)}>Edit as proposal</button>
            <button disabled={unavailable} onClick={() => setResult(current => ({ ...current, proposals: current.proposals.filter(item => item.index !== proposal.index) }))}>Discard suggestion</button>
          </div>
        </article>)}
        {!!result.questions.length && <h3>Questions for the editor</h3>}
        {result.questions.map((question, index) => <article className="change" key={index}>
          <p>{question.text}</p><ProposalEvidence evidence={question.evidence} policy={policy} />
        </article>)}
      </div>}
    </>}
  </details>;
}
