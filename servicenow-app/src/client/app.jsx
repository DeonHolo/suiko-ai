import React, { useEffect, useState } from 'react';
import { reviewService } from './services/ReviewService';
import './app.css';

const blank = { title: '', text: '', notes: '' };
const samples = {
  river1: {
    title: 'River cleanup video package',
    text: 'Anchor line\nThe river cleanup is scheduled for Saturday at 8 a.m.\n\nOn-screen text\nRiver cleanup | Saturday, 8 a.m.\n\nVoiceover\nVolunteers will collect litter along the river.',
    notes: "Schedule confirmed in the organizer's production email. Use staff footage from last year's cleanup.",
  },
  river2: {
    title: 'River cleanup video package',
    text: 'Anchor line\nThe river cleanup is scheduled for Sunday at 9 a.m.\n\nOn-screen text\nRiver cleanup | Sunday, 9 a.m.\n\nVoiceover\nVolunteers will collect litter along the river.',
    notes: "The organizer's updated production email confirms Sunday at 9 a.m. Use Northbank Aerial's drone clip from social media.",
  },
  library: {
    title: 'Community library opening',
    text: 'The community library will open on December 12. The organizers say more than 500 residents are expected to attend.\n\nThe opening program includes a reading session and a tour of the new study spaces.',
    notes: "The opening details and attendance estimate were supplied by the library's event coordinator.",
  },
};

function Evidence({ references, run }) {
  if (!references?.length) return null;
  const input = run.request.input;
  return <div>{references.map((reference, index) => {
    const revision = [input.baseline_revision, input.candidate_revision].find(item => item?.revision_id === reference.revision_id);
    const source = revision?.segments.find(item => item.segment_id === reference.segment_id);
    return <details className="evidence" key={index}>
      <summary>{reference.revision_id === input.candidate_revision.revision_id ? 'Current passage' : 'Earlier passage'}</summary>
      <blockquote>{reference.quote}</blockquote>
      {source && <p className="source-context">{source.text}</p>}
    </details>;
  })}</div>;
}

function Metadata({ run, taxonomy, disabled, onSave }) {
  const suggestions = run.result.assessment.metadata_suggestions;
  const label = (items, id) => items.find(item => item.id === id)?.label || '';
  const [choice, setChoice] = useState({
    section: run.metadata?.section ?? label(taxonomy.sections, suggestions.section.suggested_id),
    tags: run.metadata?.tags.join(', ') ?? suggestions.tags.suggested_ids.map(id => label(taxonomy.tags, id)).join(', '),
    description: run.metadata?.description ?? suggestions.short_description.suggested_text ?? '',
  });
  function update(field, value) {
    setChoice(current => ({ ...current, [field]: value }));
  }
  return <section className="card">
    <h3>Suggested metadata</h3>
    <label>Section<input disabled={disabled} value={choice.section} maxLength={160} onChange={event => update('section', event.target.value)} /></label>
    <label>Tags <span className="hint">Up to five, separated by commas</span>
      <input disabled={disabled} value={choice.tags} onChange={event => update('tags', event.target.value)} />
    </label>
    <label>Description<textarea disabled={disabled} className="description" maxLength={240} value={choice.description}
      onChange={event => update('description', event.target.value)} /></label>
    {!suggestions.short_description.suggested_text && <p className="hint">{suggestions.short_description.reason} You can write your own description.</p>}
    <button disabled={disabled} onClick={() => onSave({
      ...choice, tags: choice.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    })}>Save my choices</button>
    {run.metadata && <p className="hint">Your choices were saved with this review.</p>}
    <details><summary>Original AI suggestions</summary>
      <p>{label(taxonomy.sections, suggestions.section.suggested_id) || 'No section suggested'}</p>
      <p>{suggestions.tags.suggested_ids.map(id => label(taxonomy.tags, id)).join(', ') || 'No tags suggested'}</p>
      <p>{suggestions.short_description.suggested_text || 'No public description suggested'}</p>
    </details>
  </section>;
}

const ruleStatuses = {
  potential_conflict: 'Potential conflict',
  no_potential_conflict_observed: 'No issue found',
  not_assessable: 'Needs confirmation',
  not_applicable: 'Not applicable',
};

function ReviewChecks({ result, run }) {
  const issues = result.checks?.issues || [];
  const notes = result.checks?.notes || [];
  if (!issues.length && !notes.length) return null;
  return <details className="card review-checks"><summary>What could not be checked</summary>
    {notes.map((note, index) => <p key={'note-' + index}>{note}</p>)}
    {result.checks?.withheld_overview && <details><summary>Gemini's unverified overview — not used</summary>
      <p>{result.checks.withheld_overview}</p></details>}
    {issues.map((issue, index) => {
      const revision = [run.request.input.candidate_revision, run.request.input.baseline_revision]
        .find(item => item?.revision_id === issue.revision_id);
      const passage = revision?.segments.find(item => item.segment_id === issue.segment_id);
      return <article className="change" key={index}><p>{issue.message}</p>
        {typeof issue.rejected_suggestion === 'string' && <><h4>Gemini's suggestion — not used</h4><blockquote>{issue.rejected_suggestion}</blockquote></>}
        {typeof issue.quote === 'string' && <><h4>Gemini's quote</h4><blockquote>{issue.quote}</blockquote></>}
        {(passage || typeof issue.source === 'string') && <><h4>Your saved passage</h4><blockquote>{passage?.text || issue.source}</blockquote></>}
      </article>;
    })}
  </details>;
}

function ReviewResult({ run, taxonomy, latest, busy, onMetadata }) {
  if (!run) return <section className="card empty"><h2>Your review will appear here</h2><p>Save a version, then click Review this version.</p></section>;
  if (run.state === 'running') return <section className="card"><h2>Review in progress</h2><p>Gemini is reading the saved draft and rules.</p></section>;
  if (run.state !== 'complete') return <section className="card failure">
    <h2>This review needs a retry</h2><p>{run.error?.message || 'The review could not finish. Your draft is saved.'}</p>
    <p className="hint">{run.model} · {run.saved_at} UTC</p>
    {run.error?.details && <details><summary>What could not be verified</summary><pre>{JSON.stringify(run.error.details, null, 2)}</pre></details>}
    <details><summary>Saved input and rules</summary><pre>{JSON.stringify(run.request, null, 2)}</pre></details>
    {run.result && <details><summary>Unverified Gemini reply</summary><pre>{JSON.stringify(run.result, null, 2)}</pre></details>}
  </section>;
  const result = run.result;
  const unresolved = result.assessment.policy_assessments.filter(rule => rule.status === 'not_assessable');
  return <>
    {!latest && <p className="notice">This review belongs to an earlier draft. Open the latest version to save metadata.</p>}
    {result.assessment.status !== 'reviewed' && <section className="notice" role="status">
      <strong>{result.assessment.status === 'partial' ? 'Some parts still need checking.' : 'This review could not assess the requested checks.'}</strong>
      <p>Usable results are shown below. Open “What could not be checked” for the gaps, or retry this saved version.</p>
    </section>}
    <section className="card overview"><h2>AI overview</h2>
      <p>{result.checks?.overview_available === false
        ? 'The overview was withheld because part of Gemini\'s reply could not be checked. The independently checked sections remain below.'
        : result.overview}</p>
      <Evidence references={result.overview_evidence} run={run} />
      {run.request.provider?.fallback_model && <p className="hint">Gemini 3.5 was busy. This review used Gemini 3.1 Flash-Lite.</p>}
      <p className="hint">{run.model} · {run.saved_at} UTC</p></section>
    <section className="card"><h3>Needs attention</h3>
      {result.findings.length === 0 && unresolved.length === 0 && <p>{result.assessment.policy_assessments.length
        ? 'The completed rule checks raised no concerns. See the review details for their scope.'
        : 'No editorial rules were selected for this review.'}</p>}
      {result.findings.map((finding, index) => {
        const rule = run.request.rules.find(item => item.rule_id === finding.rule_id);
        const outcome = result.assessment.policy_assessments.find(item => item.rule_id === finding.rule_id);
        return <article className="finding" key={index}><h4>{finding.summary}</h4><p>{finding.action}</p>
          <p className="rule-status">{ruleStatuses[outcome?.status] || 'Needs confirmation'}</p>
          <p className="hint">{rule?.title || finding.rule_id} · Rule version {rule?.version}</p>
          <Evidence references={finding.evidence} run={run} />
        </article>;
      })}
      {unresolved.filter(rule => !result.findings.some(finding => finding.rule_id === rule.rule_id)).map(rule =>
        <article className="finding" key={rule.rule_id}>
          <h4>{run.request.rules.find(item => item.rule_id === rule.rule_id)?.title || rule.rule_id}</h4>
          <p className="rule-status">Needs confirmation</p><p>{rule.reason}</p>
          {rule.suggested_action && <p>{rule.suggested_action}</p>}
          <Evidence references={rule.evidence} run={run} />
        </article>)}
    </section>
    <ReviewChecks result={result} run={run} />
    <section className="card"><h3>What changed</h3>
      {!run.request.input.baseline_revision && <p>This is the first submitted version of this story.</p>}
      {run.request.input.baseline_revision && !result.assessment.changes.length && <p>{result.assessment.coverage.revision_comparison === 'incomplete'
        ? 'The revision comparison could not be fully checked. Retry to check it again.' : 'No meaningful changes were reported.'}</p>}
      {result.assessment.changes.map(change => <article className="change" key={change.change_id}>
        <h4>{change.summary}</h4><p className="hint">{change.kind}</p>
        <Evidence references={[...change.before, ...change.after]} run={run} />
      </article>)}
    </section>
    <Metadata key={run.id + ':' + run.modified} run={run} taxonomy={taxonomy} disabled={busy || !latest} onSave={onMetadata} />
    <details className="card"><summary>Rules and review details</summary>
      {run.request.rules.filter(rule => rule.active).map(rule => {
        const outcome = result.assessment.policy_assessments.find(item => item.rule_id === rule.rule_id);
        return <article className="change" key={rule.rule_id}><h4>{rule.title} · version {rule.version}</h4>
          {outcome && <><p className="rule-status">{ruleStatuses[outcome.status]}</p><p>{outcome.reason}</p>
            <Evidence references={outcome.evidence} run={run} /></>}
          <details><summary>Rule wording used</summary><p>{rule.text}</p></details>
        </article>;
      })}
      {result.assessment.limitations.map((item, index) => <p key={index}>{item}</p>)}
      <details><summary>Saved input and result</summary><pre>{JSON.stringify({ request: run.request, result }, null, 2)}</pre></details>
    </details>
  </>;
}

function RuleEditor({ rule, busy, onSave }) {
  const [draft, setDraft] = useState(rule);
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  return <form className="card rule" onSubmit={event => { event.preventDefault(); onSave(draft); }}>
    <label>Rule title<input disabled={busy} required maxLength={160} value={draft.title} onChange={event => update('title', event.target.value)} /></label>
    <label>When and what to check<textarea disabled={busy} required maxLength={3000} value={draft.text} onChange={event => update('text', event.target.value)} /></label>
    <div className="actions">
      <label className="inline"><input disabled={busy} type="checkbox" checked={draft.active} onChange={event => update('active', event.target.checked)} />Active</label>
      <label className="inline">Priority<select disabled={busy} value={draft.priority} onChange={event => update('priority', event.target.value)}>
        <option value="standard">Standard</option><option value="high">High</option></select></label>
      <button disabled={busy}>Save rule</button><span className="hint">Version {draft.version || 1}</span>
    </div>
  </form>;
}

export default function App() {
  const [data, setData] = useState(null);
  const [storyId, setStoryId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saveKey, setSaveKey] = useState(() => crypto.randomUUID());
  const [runId, setRunId] = useState(null);
  const [tab, setTab] = useState('review');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newRule, setNewRule] = useState(null);
  const current = data?.revisions[0];
  const run = data?.runs.find(item => item.id === runId);
  const dirty = !current || ['title', 'text', 'notes'].some(field => form[field] !== current[field]);

  async function load(id, fill = true, preferredRun = null) {
    const next = await reviewService.state(id);
    setData(next); setStoryId(id);
    const revision = next.revisions[0];
    if (fill) setForm(revision ? { title: revision.title, text: revision.text, notes: revision.notes } : blank);
    setRunId(preferredRun || next.runs.find(item => item.revision_id === revision?.id)?.id || null);
  }
  useEffect(() => { load(null).catch(issue => setError(issue.message)); }, []);

  async function act(action) {
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (issue) { setError(issue.message); } finally { setBusy(false); }
  }
  function startNew() {
    setStoryId(null); setForm(blank); setRunId(null); setSaveKey(crypto.randomUUID());
    setData(current => ({ ...current, revisions: [], runs: [] }));
    setMessage('New story ready. Paste a draft or load a sample.'); setError('');
  }
  function sample(which) {
    if (which === 'river2' && (!current || !form.title.toLowerCase().includes('river cleanup'))) {
      setError('Save the first river draft before loading its second version.'); return;
    }
    if (which !== 'river2') startNew();
    setForm(samples[which]); setMessage('Sample loaded. Save the version when you are ready.');
  }
  function save() {
    return act(async () => {
      const revision = await reviewService.save({ ...form, story_id: storyId,
        expected_revision_id: current?.id || null, request_key: saveKey });
      await load(revision.story_id);
      setSaveKey(crypto.randomUUID()); setMessage('Version ' + revision.version + ' saved. You can review it now.');
    });
  }
  function review() {
    return act(async () => {
      const result = await reviewService.review(current.id);
      await load(storyId, false, result.id);
      setMessage(result.state === 'complete' ? 'Review saved. Read the findings and choose your metadata.' : 'The draft is saved. The review needs your attention.');
    });
  }
  function saveMetadata(choice) {
    return act(async () => {
      const updated = await reviewService.metadata(run, choice);
      setData(current => ({ ...current, runs: current.runs.map(item => item.id === updated.id ? updated : item) }));
      setMessage('Your metadata choices were saved.');
    });
  }
  function saveRule(rule) {
    return act(async () => {
      await reviewService.rule(rule); await load(storyId, false, runId);
      setNewRule(null); setMessage('Rule saved. Run a new review to use the updated rules.');
    });
  }

  if (!data) return <main><h1>Suiko AI</h1><p role="status">{error || 'Opening the review workbench…'}</p></main>;
  return <div className="app">
    <header><a className="brand" href="./x_2236136_suiko_ai_review.do">Suiko <span>AI</span></a>
      <nav aria-label="Workbench"><button className={tab === 'review' ? 'active' : ''} onClick={() => setTab('review')}>Review</button>
        {data.can_manage_rules && <button className={tab === 'rules' ? 'active' : ''} onClick={() => setTab('rules')}>Editorial rules</button>}</nav>
      <span className="instance">Team development instance</span>
    </header>
    <main><h1>{tab === 'review' ? 'Review a story' : 'Editorial rules'}</h1>
      <p className="intro">{tab === 'review' ? 'Read the draft, check the findings, and choose what to keep.' : 'Shared instructions for future reviews. Earlier reviews keep the rules they used.'}</p>
      <div aria-live="polite">{message && <p className="notice">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {busy && <p className="notice" role="status">Working… Your saved version stays available.</p>}
      </div>
      {tab === 'rules' ? <div>
        {data.rules.map(rule => <RuleEditor key={rule.id + ':' + rule.version} rule={rule} busy={busy} onSave={saveRule} />)}
        {newRule && <RuleEditor rule={newRule} busy={busy} onSave={saveRule} />}
        {!newRule && <button disabled={busy} onClick={() => setNewRule({
          rule_id: 'RULE-' + crypto.randomUUID(), title: '', text: '', priority: 'standard', active: true, version: 0,
        })}>Add rule</button>}
      </div> : <>
        <section className="story-bar" aria-label="Story selection">
          <label>Saved stories<select value={storyId || ''} disabled={busy} onChange={event => act(() => load(event.target.value || null))}>
            <option value="">New story</option>{data.stories.map(story => <option key={story.id} value={story.id}>{story.title}</option>)}
          </select></label>
          <button disabled={busy} onClick={startNew}>New story</button>
          <details className="samples"><summary>Load a sample</summary><div className="actions">
            <button disabled={busy} onClick={() => sample('river1')}>River draft 1</button>
            <button disabled={busy} onClick={() => sample('river2')}>River draft 2</button>
            <button disabled={busy} onClick={() => sample('library')}>Library story</button>
          </div></details>
        </section>
        <div className="workspace">
          <section className="card draft-panel">
            <div className="section-title"><h2>Your draft</h2><span className="hint">{current ? 'Version ' + current.version : 'First version'}{dirty ? ' · Unsaved changes' : ''}</span></div>
            <label>Title<input disabled={busy} maxLength={160} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
            <label>Article, script, or caption<textarea className="draft-text" disabled={busy} maxLength={12000} value={form.text} onChange={event => setForm({ ...form, text: event.target.value })} /></label>
            <label>Source links and production notes <span className="hint">Optional</span>
              <textarea disabled={busy} maxLength={4000} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label>
            <p className="hint">{form.title.length + form.text.length + form.notes.length} of 12,000 characters</p>
            <div className="actions"><button disabled={busy || !dirty || !form.title.trim() || !form.text.trim()} onClick={save}>Save version</button>
              <button className="primary" disabled={busy || dirty || !current || !data.provider.configured} onClick={review}>Review this version</button></div>
            {dirty && current && <p className="hint">Save your changes before running the next review.</p>}
            {!data.provider.configured && <p className="notice">Gemini needs its server configuration. You can still save versions.</p>}
            <p className="hint">Model · {data.provider.model}</p>
            {!!data.revisions.length && <details><summary>Saved versions</summary>{data.revisions.map(revision => <details className="version" key={revision.id}>
              <summary>Version {revision.version} · {revision.saved_at} UTC</summary><h4>{revision.title}</h4><pre>{revision.text}</pre>
              <h4>Sources and production notes</h4><pre>{revision.notes || 'No notes supplied.'}</pre>
            </details>)}</details>}
          </section>
          <section className="review-panel" aria-label="AI review">
            {!!data.runs.length && <label>Review history<select value={runId || ''} disabled={busy} onChange={event => setRunId(event.target.value || null)}>
              <option value="">Choose a saved review</option>{data.runs.map(item => <option key={item.id} value={item.id}>
                Version {data.revisions.find(revision => revision.id === item.revision_id)?.version} · {item.state} · {item.saved_at} UTC
              </option>)}</select></label>}
            <ReviewResult run={run} taxonomy={data.taxonomy} busy={busy} latest={run?.revision_id === current?.id} onMetadata={saveMetadata} />
          </section>
        </div>
      </>}
    </main>
  </div>;
}
