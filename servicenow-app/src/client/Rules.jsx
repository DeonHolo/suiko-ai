import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Dialog from './Dialog';
import PolicySetup, { OriginalPolicy } from './PolicySetup';
import { reviewService } from './services/ReviewService';
import { formats, kinds, localDateTime } from './presentation';

function newRule(template = null) {
  return {
    rule_id: 'RULE-' + crypto.randomUUID(), title: '', text: '', priority: 'standard',
    formats: Object.keys(formats), content_kinds: Object.keys(kinds), conditions: '',
    requires_sources: false, human_checks: [], ...template,
    origin: template ? { kind: 'starter', template_id: template.template_id } : { kind: 'manual' },
  };
}

function Choices({ legend, choices, selected, onToggle, disabled }) {
  return <fieldset disabled={disabled}>
    <legend>{legend}</legend>
    <div className="choice-row">{Object.entries(choices).map(([value, label]) =>
      <label key={value} className="check-choice">
        <input type="checkbox" checked={selected.includes(value)} onChange={() => onToggle(value)} />
        <span>{label}</span>
      </label>)}</div>
  </fieldset>;
}

function RuleForm({ rule, fromPolicy, sourceReading, canArchive, busy, error, onSave, onApprove, onActive, onArchive, onBack }) {
  const [draft, setDraft] = useState({ ...rule, human_checks_text: (rule.human_checks || []).join('\n') });
  const [validation, setValidation] = useState('');
  const [discard, setDiscard] = useState(false);
  const edit = (field, value) => setDraft(current => ({ ...current, [field]: value }));
  const toggle = (field, value) => edit(field, draft[field].includes(value) ? draft[field].filter(item => item !== value) : [...draft[field], value]);
  const dirty = ['title', 'text', 'priority', 'conditions', 'requires_sources'].some(field => draft[field] !== rule[field])
    || ['formats', 'content_kinds'].some(field => [...draft[field]].sort().join() !== [...rule[field]].sort().join())
    || draft.human_checks_text !== (rule.human_checks || []).join('\n');
  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function submit(event) {
    event.preventDefault();
    const notes = draft.human_checks_text.split('\n').map(line => line.trim()).filter(Boolean);
    if (!draft.title.trim() || !draft.text.trim()) { setValidation('Give the rule a name and say what to check.'); return; }
    if (!draft.formats.length || !draft.content_kinds.length) { setValidation('Choose at least one format and one type of story.'); return; }
    if (notes.length > 6 || notes.some(note => note.length > 240)) { setValidation('Use up to six short reminders. Keep each under 240 characters.'); return; }
    setValidation('');
    const { policy, human_checks_text, ...definition } = draft;
    onSave({ ...definition, expected_modified: rule.modified, human_checks: notes });
  }

  const approved = rule.approved;
  const pending = rule.pending;
  return <div className="rule-page">
    <button type="button" className="back-link" disabled={busy} onClick={() => dirty ? setDiscard(true) : onBack()}>
      <span aria-hidden="true">← </span>{fromPolicy ? 'Back to company policy' : 'Back to rules'}
    </button>
    <div className="page-heading">
      <h1>{rule.id ? rule.title : 'New rule'}</h1>
      {canArchive && rule.id && <button className="quiet" disabled={busy || dirty} onClick={() => onArchive(rule)}>Archive rule</button>}
    </div>
    {approved && <section className="surface approved-rule" aria-label="Approved rule">
      <div className="section-title"><h2>{rule.active ? 'Rule in use' : 'Approved rule'}</h2>
        <span className="status-label">{rule.active ? 'On' : 'Off'}</span></div>
      <p>{approved.definition.text}</p>
      <p className="hint">Approved by {approved.approval.by_name || 'an editor'} · {localDateTime(approved.approval.at)}</p>
      {pending && rule.active && <p className="hint">Suiko keeps using this wording until you approve the draft below.</p>}
    </section>}
    <form className="surface rule-form" onSubmit={submit}>
      {rule.id && <h2>{pending ? 'Draft to approve' : 'Edit rule'}</h2>}
      {rule.legacy_approval_missing && <p className="notice">Save and approve this rule to use it in reviews.</p>}
      {draft.origin?.kind === 'policy' && <OriginalPolicy origin={draft.origin} initial={rule.policy} />}
      <label>Rule name<input name="rule-title" required maxLength={160} disabled={busy} value={draft.title} onChange={event => edit('title', event.target.value)} placeholder="For example, Credit outside footage…" /></label>
      <label>What should Suiko check?<textarea name="rule-text" required maxLength={3000} disabled={busy} value={draft.text} onChange={event => edit('text', event.target.value)} placeholder="Describe what the editor should look for…" /></label>
      <div className="form-section">
        <h3>When should this rule run?</h3>
        <div className="choice-groups">
          <Choices legend="Formats" choices={formats} selected={draft.formats} disabled={busy} onToggle={value => toggle('formats', value)} />
          <Choices legend="Types of story" choices={kinds} selected={draft.content_kinds} disabled={busy} onToggle={value => toggle('content_kinds', value)} />
        </div>
        <label>Only when… <span className="field-hint">Optional. Leave blank to use this rule for all selections above.</span>
          <textarea className="short-input" name="rule-condition" rows={2} disabled={busy} maxLength={1000} value={draft.conditions} onChange={event => edit('conditions', event.target.value)} placeholder="For example, only when the story quotes someone…" />
        </label>
      </div>
      <div className="form-section">
        <h3>Sources</h3>
        <label className="check-panel">
          <input type="checkbox" name="rule-read-sources" disabled={busy} checked={!!draft.requires_sources} onChange={event => edit('requires_sources', event.target.checked)} />
          <span><strong>Read the story’s source links</strong>
            <span className="field-hint">{sourceReading ? 'Use this for checks that compare the story with a source, such as matching a quote to a transcript.' : 'Add the source excerpt to the story’s notes for this check.'}</span></span>
        </label>
        <label>What should an editor confirm? <span className="field-hint">Optional reminder for a person, such as checking that we have permission to use a photo.</span>
          <textarea className="short-input" name="rule-editor-reminders" rows={2} disabled={busy} maxLength={1500} value={draft.human_checks_text} onChange={event => edit('human_checks_text', event.target.value)} placeholder="One reminder per line…" />
        </label>
      </div>
      <label>Priority<select name="rule-priority" disabled={busy} value={draft.priority} onChange={event => edit('priority', event.target.value)}>
        <option value="standard">Standard</option><option value="high">High</option>
      </select></label>
      {(validation || error) && <p className="error" role="alert">{validation || error}</p>}
      {dirty && pending && <p className="hint">Save your edits before approving this rule.</p>}
      <div className="actions">
        <button className={pending && !dirty ? '' : 'primary'} disabled={busy || (!!rule.draft && !dirty)}>Save draft</button>
        {pending && <button className="primary" type="button" disabled={busy || dirty} onClick={() => onApprove(rule)}>Approve rule</button>}
        {approved && <button type="button" disabled={busy || dirty} onClick={() => onActive(rule, !rule.active)}>{rule.active ? 'Turn off' : 'Turn on'}</button>}
      </div>
    </form>
    {discard && <Dialog title="Leave this rule draft?" onClose={() => setDiscard(false)}>
      <p>Your unsaved changes will be lost.</p>
      <div className="actions dialog-actions"><button onClick={() => setDiscard(false)}>Keep editing</button><button className="danger" onClick={onBack}>Leave draft</button></div>
    </Dialog>}
  </div>;
}

const views = {
  active: { label: 'In use', empty: 'No rules are on. Add a rule or turn one on.', includes: rule => rule.active && rule.approved },
  drafts: { label: 'Drafts', empty: 'No rules waiting for approval.', includes: rule => rule.pending || !rule.approved },
  off: { label: 'Off', empty: 'No approved rules are off.', includes: rule => rule.approved && !rule.active },
};

export default function Rules({ data, onRulesChanged, onArchive, onOpenArchive }) {
  const [view, setView] = useState('active');
  const [mode, setMode] = useState('list');
  const [policyOpened, setPolicyOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const [fromPolicy, setFromPolicy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rule = editing ? data.rules.find(item => item.id === editing) : draft;
  const canArchive = data.capabilities.archive === true;

  function start(next, policy = false) {
    setDraft(next);
    setEditing(null);
    setFromPolicy(policy);
    setError('');
    setMode('edit');
  }

  async function update(action, notice, after) {
    setBusy(true);
    setError('');
    try {
      const result = await action();
      await onRulesChanged(result.rules);
      after?.(result.rules);
      toast.success(notice);
    } catch (issue) { setError(issue.message); }
    finally { setBusy(false); }
  }

  const visible = data.rules.filter(item => !item.archived && views[view].includes(item)
    && (view === 'active' ? item.approved?.definition.title || item.title : item.title).toLowerCase().includes(search.trim().toLowerCase()));
  return <>
    {mode === 'list' && <div className="list-page">
      <div className="page-heading"><h1>Editorial rules</h1><button className="primary" onClick={() => setMode('add')}>Add a rule</button></div>
      <p className="intro">Choose what Suiko checks before a story goes out.</p>
      <div className="segment" aria-label="Rule status">
        {Object.entries(views).map(([value, item]) => <button key={value} aria-pressed={view === value} onClick={() => setView(value)}>{item.label}</button>)}
      </div>
      <section className="surface records" aria-label={views[view].label + ' rules'}>
        <div className="list-toolbar"><label>Find a rule<input type="search" name="rule-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name…" /></label></div>
        {visible.length ? <ul className="record-list">{visible.map(item => {
          const inUse = view === 'active';
          const definition = inUse ? item.approved.definition : item;
          return <li key={item.id}><button className="record-link" onClick={() => {
            setEditing(item.id); setFromPolicy(false); setError(''); setMode('edit');
          }}>
            <span className="record-info"><span className="record-name">{definition.title}</span>
            <span className="record-meta">{definition.formats.map(value => formats[value]).join(', ')}</span>
            </span>
            {item.pending && <span className="status-label">Draft to approve</span>}
            {item.legacy_approval_missing && <span className="status-label">Needs approval</span>}
            <span className="record-arrow" aria-hidden="true">›</span>
          </button></li>;
        })}</ul> : <p className="list-message">{search ? 'No rules match your search.' : views[view].empty}</p>}
      </section>
      {canArchive && <button className="quiet" onClick={onOpenArchive}>Open archive</button>}
    </div>}
    {mode === 'add' && <div className="list-page">
      <button className="back-link" onClick={() => setMode('list')}><span aria-hidden="true">← </span>Back to rules</button>
      <div className="page-heading"><h1>Add a rule</h1></div>
      <section className="surface rule-start">
        <div><h2>Write a rule</h2><p>Describe a check your team already uses.</p><button className="primary" onClick={() => start(newRule())}>Write from scratch</button></div>
        <div><h2>Use company policy</h2><p>Paste your policy. Keep its wording or ask for suggested checks.</p><button onClick={() => { setPolicyOpened(true); setMode('policy'); }}>Open company policy</button></div>
      </section>
      <section className="surface template-list"><h2>Starter rules</h2>
        <ul className="record-list">{data.starter_templates.map(template => <li className="record-row" key={template.template_id}>
          <div className="record-info"><strong>{template.title}</strong><p>{template.text}</p></div>
          <button onClick={() => start(newRule(template))} aria-label={'Use starter: ' + template.title}>Use starter</button>
        </li>)}</ul>
      </section>
      <aside className="guide"><h2>What Suiko can help check</h2>
        <ul><li>Whether a headline matches the story.</li><li>Whether a quote or claim matches a source you provide.</li><li>Whether your notes mention a sponsor or permission that needs a closer look.</li></ul>
      </aside>
    </div>}
    {policyOpened && <div className="rule-page" hidden={mode !== 'policy'}>
      <button className="back-link" onClick={() => setMode('add')}><span aria-hidden="true">← </span>Back to add a rule</button>
      <div className="page-heading"><h1>Company policy</h1></div>
      <PolicySetup providerReady={data.provider.configured} onUse={(definition, policy) => start({ ...newRule(), ...definition, policy }, true)} />
    </div>}
    {mode === 'edit' && rule && <RuleForm key={rule.rule_id + ':' + rule.modified} rule={rule} fromPolicy={fromPolicy} busy={busy} error={error}
      sourceReading={data.capabilities.source_reading} canArchive={canArchive && rule.can_archive === true}
      onBack={() => { setMode(fromPolicy ? 'policy' : 'list'); setError(''); }}
      onSave={proposal => update(() => reviewService.rule(proposal), 'Rule draft saved', rules => {
        setEditing(rules.find(item => item.rule_id === proposal.rule_id)?.id || null);
      })}
      onApprove={item => update(() => reviewService.approveRule(item), 'Rule approved')}
      onActive={(item, active) => update(() => reviewService.setRuleActive(item, active), active ? 'Rule turned on' : 'Rule turned off')}
      onArchive={item => onArchive('rule', item, () => setMode('list'))} />}
  </>;
}
