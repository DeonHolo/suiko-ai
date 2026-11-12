import React, { useEffect, useState } from 'react';
import { reviewService } from './services/ReviewService';
import './app.css';

const blank = { title: '', text: '', notes: '', content_format: '', content_kind: '', source_urls_text: '' };
const asForm = revision => revision ? {
  ...blank, title: revision.title, text: revision.text, notes: revision.notes || '',
  content_format: revision.content_format || '', content_kind: revision.content_kind || '',
  source_urls_text: (revision.source_urls || []).join('\n'),
} : { ...blank };
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
      const ruleIndex = /^\/assessment\/policy_assessments\/(\d+)(?:\/|$)/.exec(issue.path || '')?.[1];
      const ruleId = issue.rule_id || (ruleIndex !== undefined ? result.assessment?.policy_assessments?.[Number(ruleIndex)]?.rule_id : null);
      const ruleTitle = ruleId && (run.request.rules?.find(rule => rule.rule_id === ruleId)?.title || ruleId);
      const path = issue.path || '';
      const section = path.startsWith('/overview') ? 'Overview'
        : path.startsWith('/findings') ? 'Finding'
        : path.startsWith('/assessment/changes') ? 'Changes'
        : path.startsWith('/assessment/metadata_suggestions/short_description') ? 'Metadata: description'
        : path.startsWith('/assessment/metadata_suggestions/tags') ? 'Metadata: tags'
        : path.startsWith('/assessment/metadata_suggestions/section') ? 'Metadata: section'
        : path.startsWith('/assessment/metadata_suggestions') ? 'Metadata'
        : ruleIndex !== undefined ? 'Rule assessment' : 'Review coverage';
      return <article className="change" key={index}>
        <h4>{ruleTitle ? `${section}: ${ruleTitle}` : section}</h4><p>{issue.message}</p>
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
    {!!run.request.sources?.length && <section className="card"><h3>Sources</h3>
      {run.request.sources.map((source, index) => <article className="change" key={index}>
        <p>{source.url}</p><p className="hint">{source.status === 'not_read' ? 'Not read — saved as a reference only.' : source.status}</p>
      </article>)}
    </section>}
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
          <details><summary>Rule wording used</summary><p>{rule.text || run.request.input.policy_pack.rules.find(item => item.rule_id === rule.rule_id)?.text}</p></details>
        </article>;
      })}
      {result.assessment.limitations.map((item, index) => <p key={index}>{item}</p>)}
      <details><summary>Saved input and result</summary><pre>{JSON.stringify({ request: run.request, result }, null, 2)}</pre></details>
    </details>
  </>;
}

function newRuleDraft(template = null) {
  return {
    rule_id: 'RULE-' + crypto.randomUUID(), title: template?.title || '', text: template?.text || '',
    priority: template?.priority || 'standard', formats: template?.formats || ['article', 'script', 'caption'],
    content_kinds: template?.content_kinds || ['news', 'opinion', 'sponsored'],
    conditions: template?.conditions || '', human_checks: template?.human_checks || [],
    origin: template ? { kind: 'starter', template_id: template.template_id } : { kind: 'manual' },
  };
}

function RuleEditor({ rule, busy, open, onOpenChange, onSave, onApprove, onActive, onCancel }) {
  const [draft, setDraft] = useState({ ...rule, human_checks_text: (rule.human_checks || []).join('\n') });
  useEffect(() => setDraft({ ...rule, human_checks_text: (rule.human_checks || []).join('\n') }), [rule.modified]);
  const update = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  const toggle = (key, value) => update(key, draft[key].includes(value)
    ? draft[key].filter(item => item !== value) : [...draft[key], value]);
  const dirty = ['title', 'text', 'priority', 'conditions'].some(key => draft[key] !== rule[key])
    || ['formats', 'content_kinds'].some(key => JSON.stringify([...draft[key]].sort()) !== JSON.stringify([...rule[key]].sort()))
    || draft.human_checks_text !== (rule.human_checks || []).join('\n');
  const valid = draft.title.trim() && draft.text.trim() && draft.formats.length && draft.content_kinds.length;
  const status = rule.legacy_approval_missing ? 'Approval not recorded'
    : rule.pending ? 'Proposal awaiting approval' : rule.active ? 'Active' : rule.approved ? 'Off' : 'New proposal';
  return <details className="card rule-editor" open={!rule.id || open} onToggle={event => rule.id && onOpenChange?.(rule.id, event.currentTarget.open)}>
    <summary><strong>{rule.title || 'Your new rule'}</strong> · {status}{rule.pending && rule.active ? ` · Version ${rule.approved.version} stays active` : ''}</summary>
    {rule.legacy_approval_missing && <p className="notice">These prototype instructions have no recorded approval. Save a proposal and approve it if you want to use it.</p>}
    {rule.approved && <details className="approved-wording"><summary>Approved version {rule.approved.version}{rule.active ? ' — used in reviews' : ' — currently off'}</summary>
      <p>{rule.approved.definition.text}</p><p className="hint">Approved by {rule.approved.approval.by_name || 'the designated editor'} · {rule.approved.approval.at} UTC</p>
    </details>}
    <form className="rule" onSubmit={event => {
      event.preventDefault();
      onSave({ ...draft, expected_modified: rule.modified, human_checks: draft.human_checks_text.split('\n').filter(line => line.trim()) });
    }}>
      <p className="hint">{draft.origin?.kind === 'starter' ? 'Based on an editable starter rule' : draft.origin?.kind === 'policy' ? 'Based on company policy' : 'Written by an editor'}</p>
      <label>Rule title<input disabled={busy} required maxLength={160} value={draft.title} onChange={event => update('title', event.target.value)} /></label>
      <label>When and what to check<textarea disabled={busy} required maxLength={3000} value={draft.text} onChange={event => update('text', event.target.value)} /></label>
      <fieldset disabled={busy}><legend>Formats</legend><div className="rule-options">
        {['article', 'script', 'caption'].map(value => <label key={value}><input type="checkbox" checked={draft.formats.includes(value)} onChange={() => toggle('formats', value)} />{value[0].toUpperCase() + value.slice(1)}</label>)}
      </div></fieldset>
      <fieldset disabled={busy}><legend>Content kinds</legend><div className="rule-options">
        {['news', 'opinion', 'sponsored'].map(value => <label key={value}><input type="checkbox" checked={draft.content_kinds.includes(value)} onChange={() => toggle('content_kinds', value)} />{value[0].toUpperCase() + value.slice(1)}</label>)}
      </div></fieldset>
      <label>Additional conditions <span className="hint">Optional</span><textarea disabled={busy} maxLength={1000} value={draft.conditions} onChange={event => update('conditions', event.target.value)} /></label>
      <label>What the editor may need to confirm <span className="hint">Optional · Up to six notes, one per line</span><textarea disabled={busy} maxLength={1500} value={draft.human_checks_text} onChange={event => update('human_checks_text', event.target.value)} /></label>
      <label>Priority<select disabled={busy} value={draft.priority} onChange={event => update('priority', event.target.value)}>
        <option value="standard">Standard</option><option value="high">High</option>
      </select></label>
      <div className="actions">
        <button disabled={busy || !valid || (!!rule.draft && !dirty)}>Save proposal</button>
        {rule.pending && <button className="primary" type="button" disabled={busy || dirty} onClick={() => onApprove(rule)}>Approve rule version {rule.draft.version}</button>}
        {rule.approved && <button type="button" disabled={busy || dirty} onClick={() => onActive(rule, !rule.active)}>{rule.active ? 'Turn rule off' : 'Use approved rule'}</button>}
        {onCancel && <button type="button" disabled={busy} onClick={onCancel}>Cancel new rule</button>}
      </div>
      {dirty && rule.id && <p className="hint">Save your edited proposal before approving or changing the rule's status.</p>}
      {rule.pending && rule.approved && <p className="hint">The proposed wording is not used yet. Earlier reviews keep their own rule versions.</p>}
    </form>
  </details>;
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
  const [openRuleId, setOpenRuleId] = useState(null);
  const current = data?.revisions[0];
  const run = data?.runs.find(item => item.id === runId);
  const currentForm = asForm(current);
  const dirty = !current || Object.keys(blank).some(field => form[field] !== currentForm[field]);

  async function load(id, fill = true, preferredRun = null) {
    const next = await reviewService.state(id);
    setData(next); setStoryId(id);
    const revision = next.revisions[0];
    if (fill) setForm(asForm(revision));
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
    setForm({ ...blank, ...samples[which], content_format: which.startsWith('river') ? 'script' : 'article', content_kind: 'news' });
    setMessage('Sample loaded. Save the version when you are ready.');
  }
  function save() {
    return act(async () => {
      const { source_urls_text, ...fields } = form;
      const revision = await reviewService.save({ ...fields, source_urls: source_urls_text.split(/\r?\n/).filter(line => line.trim()), story_id: storyId,
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
      const result = await reviewService.rule(rule);
      setData(current => ({ ...current, rules: result.rules }));
      setOpenRuleId(result.rules.find(item => item.rule_id === rule.rule_id)?.id || null);
      if (!rule.id) setNewRule(null);
      setMessage('Proposal saved. It will be used after you approve it.');
    });
  }
  function approveRule(rule) {
    return act(async () => {
      const result = await reviewService.approveRule(rule);
      setData(current => ({ ...current, rules: result.rules }));
      setMessage('Rule version ' + rule.draft.version + ' approved. New reviews will use it.');
    });
  }
  function startRule(template = null) {
    setOpenRuleId(null);
    setNewRule(newRuleDraft(template));
  }
  function setRuleActive(rule, active) {
    return act(async () => {
      const result = await reviewService.setRuleActive(rule, active);
      setData(current => ({ ...current, rules: result.rules }));
      setMessage(active ? 'The approved rule is enabled for new reviews.' : 'The rule is off for new reviews. Earlier reviews keep their results.');
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
      {data.can_manage_rules && <div hidden={tab !== 'rules'}>
        <p className="hint">Only approved rules are used. A saved proposal stays separate until you approve it.</p>
        <div className="actions"><button disabled={busy || !!newRule} onClick={() => startRule()}>Write my own rule</button>
          <button disabled={busy} onClick={() => act(() => load(storyId, false, runId))}>Reload rules</button></div>
        <details className="card"><summary>Optional starter rules</summary>
          <p>Choose a starting point, then edit it to fit your publication.</p>
          {data.starter_templates?.map(template => <article className="change" key={template.template_id}>
            <h3>{template.title}</h3><p>{template.text}</p>
            <button disabled={busy || !!newRule} onClick={() => startRule(template)}>Use this starter: {template.title}</button>
          </article>)}
        </details>
        {newRule && <RuleEditor key={newRule.rule_id} rule={newRule} busy={busy} onSave={saveRule} onCancel={() => setNewRule(null)} />}
        {data.rules.map(rule => <RuleEditor key={rule.id} rule={rule} busy={busy} open={openRuleId === rule.id}
          onOpenChange={(id, expanded) => setOpenRuleId(current => expanded ? id : current === id ? null : current)}
          onSave={saveRule} onApprove={approveRule} onActive={setRuleActive} />)}
        <details className="card"><summary>What Suiko can help check</summary>
          {Object.values(data.supported_checks || {}).map((description, index) => <p key={index}>{description}</p>)}
        </details>
      </div>}
      <div hidden={tab !== 'review'}>
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
            <div className="input-types">
              <label>Format<select required disabled={busy} value={form.content_format} onChange={event => setForm({ ...form, content_format: event.target.value })}>
                <option value="">Choose a format</option><option value="article">Article</option><option value="script">Script</option><option value="caption">Caption</option>
              </select></label>
              <label>Content kind<select required disabled={busy} value={form.content_kind} onChange={event => setForm({ ...form, content_kind: event.target.value })}>
                <option value="">Choose a kind</option><option value="news">News</option><option value="opinion">Opinion</option><option value="sponsored">Sponsored</option>
              </select></label>
            </div>
            {current && (!current.content_format || !current.content_kind) && <p className="notice">This older version has no format or kind saved. Choose both and save a new version to use the updated review setup. Its earlier reviews are still available.</p>}
            <label>Title<input disabled={busy} maxLength={160} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
            <label>Story text<textarea className="draft-text" disabled={busy} maxLength={12000} value={form.text} onChange={event => setForm({ ...form, text: event.target.value })} /></label>
            <label>Sources <span className="hint">Optional · Up to five links, one per line</span>
              <textarea disabled={busy} maxLength={8000} value={form.source_urls_text} onChange={event => setForm({ ...form, source_urls_text: event.target.value })} /></label>
            <p className="hint">{data.capabilities?.source_reading ? 'Public sources are read when an approved rule needs them.'
              : 'Links are saved as references. This version of Suiko has not opened them.'}</p>
            <label>Review context <span className="hint">Optional · Briefs, interview excerpts or production notes</span>
              <textarea disabled={busy} maxLength={4000} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></label>
            <p className="hint">{[...form.title + form.text + form.notes + form.source_urls_text].length} of 12,000 characters, including context and links</p>
            <div className="actions"><button disabled={busy || !dirty || !form.title.trim() || !form.text.trim() || !form.content_format || !form.content_kind} onClick={save}>Save version</button>
              <button className="primary" disabled={busy || dirty || !current || !current.content_format || !current.content_kind || !data.provider.configured} onClick={review}>Review this version</button></div>
            {dirty && current && <p className="hint">Save your changes before running the next review.</p>}
            {!data.rules.some(rule => rule.active) && <p className="notice">No approved rules are active. You can still get an overview, changes and metadata.</p>}
            {!data.provider.configured && <p className="notice">Gemini needs its server configuration. You can still save versions.</p>}
            <p className="hint">Model · {data.provider.model}</p>
            {!!data.revisions.length && <details><summary>Saved versions</summary>{data.revisions.map(revision => <details className="version" key={revision.id}>
              <summary>Version {revision.version} · {revision.saved_at} UTC</summary><h4>{revision.title}</h4><pre>{revision.text}</pre>
              <p className="hint">{revision.content_format && revision.content_kind ? revision.content_format + ' · ' + revision.content_kind : 'Format and kind were not recorded for this older version.'}</p>
              <h4>Sources</h4><pre>{revision.source_urls?.join('\n') || 'No separate source links saved.'}</pre>
              <h4>{revision.content_format ? 'Review context' : 'Legacy sources and production notes'}</h4><pre>{revision.notes || 'No context supplied.'}</pre>
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
      </div>
    </main>
  </div>;
}
