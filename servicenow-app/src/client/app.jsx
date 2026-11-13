import React, { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { reviewService, workspaceService } from './services/ReviewService';
import Archive from './Archive';
import Dialog from './Dialog';
import LegalReview from './LegalReview';
import { formats, kinds, localDateTime } from './presentation';
import { ReviewResult, reviewStatus } from './ReviewPanel';
import { href, isNormalClick, lastStory, readRoute } from './routes';
import Rules from './Rules';
import Stories from './Stories';
import { StoryWorkflow } from './Workflow';

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

function NavLink({ page, current, onNavigate, children }) {
  return <a href={href(page)} aria-current={current ? 'page' : undefined} onClick={event => {
    if (!isNormalClick(event)) return;
    event.preventDefault();
    onNavigate(page);
  }}>{children}</a>;
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [data, setData] = useState(null);
  const [form, setForm] = useState(blank);
  const [saveKey, setSaveKey] = useState(() => crypto.randomUUID());
  const [runId, setRunId] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [bootError, setBootError] = useState('');
  const [storyLoading, setStoryLoading] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveError, setArchiveError] = useState('');
  const current = data?.revisions[0];
  const storyId = current?.story_id || data?.story?.id || null;
  const run = data?.runs.find(item => item.id === runId);
  const viewer = data?.viewer_id;
  const saved = asForm(current);
  const dirty = Object.keys(blank).some(key => form[key] !== saved[key]);
  const archived = data?.story?.archived === true;
  const canArchive = data?.capabilities.archive === true;
  const page = route.page;
  const activeStory = useRef(null);
  activeStory.current = { id: storyId, dirty, page, requested: route.story, revision: current?.id };

  function navigate(nextPage, id = null, replace = false) {
    const next = { page: nextPage, story: nextPage === 'story' ? id : null, task: nextPage === 'legal' ? id : null };
    window.history[replace ? 'replaceState' : 'pushState'](null, '', href(nextPage, id));
    setRoute(next);
    setError('');
    window.scrollTo(0, 0);
  }

  function applyStory(next, fill = true, preferred = null) {
    setData(next);
    const revision = next.revisions[0];
    if (fill) {
      setForm(revision ? asForm(revision) : { ...blank, title: next.story?.title || '' });
      setSaveKey(crypto.randomUUID());
    }
    setRunId(next.runs.find(item => item.id === preferred)?.id
      || next.runs.find(item => item.revision_id === revision?.id)?.id || null);
    if (revision && !next.story?.archived) lastStory(next.viewer_id, revision.story_id);
  }

  useEffect(() => {
    let active = true;
    reviewService.state(null).then(next => {
      if (!active) return;
      setData(next);
      if (route.page === 'resume') {
        const last = lastStory(next.viewer_id);
        navigate(last ? 'story' : 'stories', last, true);
      }
    }).catch(issue => { if (active) setBootError(issue.message); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const pop = () => {
      const next = readRoute();
      if (next.page === 'story' && next.story !== storyId && dirty) {
        window.history.pushState(null, '', href('story', storyId));
        setNextAction(() => () => { setForm(saved); navigate('story', next.story); });
      } else if (next.page === 'resume' && data) {
        const last = lastStory(viewer);
        navigate(last ? 'story' : 'stories', last, true);
      } else if (next.page === 'story' && !next.story && storyId) {
        startNew();
      } else {
        setRoute(next); setError('');
      }
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [dirty, storyId, viewer, data, saved]);

  useEffect(() => {
    if (!data || page !== 'story' || route.story === storyId) {
      setStoryLoading(false);
      return;
    }
    let active = true;
    setStoryLoading(true);
    reviewService.state(route.story).then(next => {
      if (active) applyStory(next);
    }).catch(issue => {
      if (!active) return;
      if (route.story === lastStory(viewer)) lastStory(viewer, null);
      navigate('stories', null, true);
      setError(issue.message);
    }).finally(() => { if (active) setStoryLoading(false); });
    return () => { active = false; };
  }, [Boolean(data), page, route.story, storyId]);

  useEffect(() => {
    if (!dirty) return;
    const warn = event => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function updateField(name, value) {
    setForm(previous => ({ ...previous, [name]: value }));
    setSaveKey(crypto.randomUUID());
  }

  function leaveDraft(action) {
    if (dirty) setNextAction(() => action);
    else action();
  }

  function openStory(id) {
    if (id === storyId) navigate('story', id);
    else leaveDraft(() => { setForm(saved); navigate('story', id); });
  }

  function startNew(draft = blank) {
    setData(previous => ({ ...previous, story: null, workflow: null, revisions: [], runs: [] }));
    setForm(draft);
    setRunId(null);
    setSaveKey(crypto.randomUUID());
    navigate('story');
  }

  function sample(which) {
    setShowSamples(false);
    if (which === 'river2') {
      setForm({ ...blank, ...samples.river2, content_format: 'script', content_kind: 'news' });
      setSaveKey(crypto.randomUUID());
      navigate('story', storyId);
    } else leaveDraft(() => startNew({ ...blank, ...samples[which], content_format: which === 'river1' ? 'script' : 'article', content_kind: 'news' }));
  }

  async function act(label, action) {
    if (busy) return;
    setBusy(label);
    setError('');
    try { await action(); }
    catch (issue) { setError(issue.message); }
    finally { setBusy(''); }
  }

  async function save(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.text.trim() || !form.content_format || !form.content_kind) {
      setError('Fill in the title, draft, format, and type of story before saving.');
      return;
    }
    await act('Saving your draft…', async () => {
      const { source_urls_text, ...fields } = form;
      const revision = await reviewService.save({ ...fields, source_urls: source_urls_text.split(/\r?\n/).map(line => line.trim()).filter(Boolean),
        story_id: storyId, expected_revision_id: current?.id || null, request_key: saveKey });
      applyStory({ ...data, story: { ...data.story, id: revision.story_id, title: revision.title },
        workflow: revision.id === current?.id ? data.workflow : null,
        revisions: [revision, ...data.revisions.filter(item => item.id !== revision.id)], runs: data.runs });
      toast.success(revision.id === current?.id ? 'No changes to save. You’re still on Version ' + revision.version + '.' : 'Version ' + revision.version + ' saved');
      lastStory(viewer, revision.story_id);
      if (revision.story_id !== storyId) navigate('story', revision.story_id);
      try { applyStory(await reviewService.state(revision.story_id)); }
      catch { setError('Your version was saved. Choose Refresh story to reload its history.'); }
    });
  }

  function review() {
    return act('Reviewing your draft…', async () => {
      const result = await reviewService.review(current.id);
      setData(previous => ({ ...previous, runs: [result, ...previous.runs.filter(item => item.id !== result.id)] }));
      setRunId(result.id);
      try { applyStory(await reviewService.state(storyId), false, result.id); }
      catch { setError('Your review was saved. Choose Refresh story to reload its history.'); }
      if (result.state === 'complete') toast.success('Review ready');
    });
  }

  function saveMetadata(choice) {
    return act('Saving publishing details…', async () => {
      const updated = await reviewService.metadata(run, choice);
      setData(previous => ({ ...previous, runs: previous.runs.map(item => item.id === updated.id ? updated : item) }));
      toast.success('Publishing details saved');
    });
  }

  async function refreshWorkspace() {
    const target = activeStory.current.id;
    const next = await reviewService.state(target);
    if (!isActiveStory(target)) return;
    if (activeStory.current.dirty && next.revisions[0]?.id !== activeStory.current.revision) {
      setData(previous => ({ ...previous, workflow: null }));
      setError('A newer version was saved elsewhere. Your unsaved text is still here. Reload the page when you are ready to open the latest version.');
      return;
    }
    if (!activeStory.current.dirty && next.revisions[0]?.id !== activeStory.current.revision) {
      applyStory(next);
      return;
    }
    setData(next);
    setRunId(previous => next.runs.find(item => item.id === previous)?.id
      || next.runs.find(item => item.revision_id === next.revisions[0]?.id)?.id || null);
  }

  function isActiveStory(id) {
    const selected = activeStory.current;
    return selected.id === id && (selected.page !== 'story' || selected.requested === id);
  }

  async function refreshRules(rules) {
    setData(previous => ({ ...previous, rules }));
    const target = activeStory.current.id;
    try {
      const next = await reviewService.state(target);
      setData(previous => ({ ...previous, rules: next.rules, ...(isActiveStory(target) ? { runs: next.runs } : {}) }));
    } catch {
      setError('The rule was saved. Reopen the story to see whether its last review uses the current rules.');
    }
  }

  async function confirmArchive() {
    const { kind, item, after } = archiveTarget;
    setArchiveError('');
    setBusy('Moving to the archive…');
    try {
      const result = await workspaceService.changeArchive('archive', kind, item);
      setArchiveTarget(null);
      after?.();
      if (kind === 'story') {
        if (lastStory(viewer) === item.id) lastStory(viewer, null);
        startNew();
        navigate('stories', null, true);
        try { setData(await reviewService.state(null)); }
        catch { setError('Story archived. Reload Stories to see the updated list.'); }
      } else {
        try { await refreshWorkspace(); }
        catch { setError('Rule archived. Reload Rules to see the updated list.'); }
      }
      toast.success(kind === 'story' ? 'Story archived' : 'Rule archived', result.item?.can_restore ? {
        action: { label: 'Undo', onClick: async () => {
          try {
            await workspaceService.changeArchive('restore', kind, result.item);
            toast.success(kind === 'story' ? 'Story restored' : 'Rule restored');
            await refreshWorkspace();
          } catch (issue) { setError(issue.message); }
        } },
      } : {});
    } catch (issue) { setArchiveError(issue.message); }
    finally { setBusy(''); }
  }

  const body = page === 'story' && data && (storyLoading || route.story !== storyId)
    ? <p role="status">Opening your story…</p>
    : page === 'story' && data ? <div className="story-page">
      <button className="back-link" disabled={!!busy} onClick={() => navigate('stories')}><span aria-hidden="true">← </span>All stories</button>
      <div className="page-heading">
        <div><h1>{current?.title || 'New story'}</h1>
          {current && <p className="story-subtitle">{['Version ' + current.version, formats[current.content_format], localDateTime(current.saved_at)].filter(Boolean).join(' · ')}</p>}</div>
        <div className="actions heading-actions">
          {current && <button className="quiet" disabled={!!busy} onClick={() => act('Refreshing your story…', refreshWorkspace)}>Refresh story</button>}
          <button className="quiet" disabled={!!busy} onClick={() => setShowSamples(true)}>Try a sample</button>
          {canArchive && data.story?.can_archive && !archived && <button className="quiet" disabled={!!busy} onClick={() => leaveDraft(() => {
            setArchiveError(''); setArchiveTarget({ kind: 'story', item: data.story });
          })}>Archive story</button>}
        </div>
      </div>
      {archived && <p className="notice">This story is archived. <button className="text-button" onClick={() => navigate('archive')}>Open the archive</button> to restore it.</p>}
      <div className="workspace">
        <section className="card draft-panel">
          <div className="section-title"><h2>Draft</h2>{dirty && <span className="status-label">Unsaved changes</span>}</div>
          {current && (!current.content_format || !current.content_kind) && !archived && <p className="notice">Choose a format and type, then save a new version to review this story.</p>}
          <form onSubmit={save}>
            <fieldset disabled={!!busy || archived} className="draft-fields">
              <label>Title<input name="story-title" required maxLength={160} value={form.title} onChange={event => updateField('title', event.target.value)} placeholder="Give this story a title…" /></label>
              <div className="input-types">
                <label>Format<select name="story-format" required value={form.content_format} onChange={event => updateField('content_format', event.target.value)}>
                  <option value="">Choose a format</option>{Object.entries(formats).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></label>
                <label>Type of story<select name="story-kind" required value={form.content_kind} onChange={event => updateField('content_kind', event.target.value)}>
                  <option value="">Choose a type</option>{Object.entries(kinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></label>
              </div>
              <label>Story text<textarea name="story-text" required className="draft-text" maxLength={12000} value={form.text} onChange={event => updateField('text', event.target.value)} placeholder="Paste or write your draft…" /></label>
              <details className="optional-field" open={form.source_urls_text || form.notes ? true : undefined}>
                <summary>Sources and notes</summary>
                <label>Source links <span className="field-hint">Up to five public links, one per line.</span>
                  <textarea name="story-sources" className="short-input" rows={2} maxLength={8000} value={form.source_urls_text} onChange={event => updateField('source_urls_text', event.target.value)} />
                </label>
                <label>Notes for the review <span className="field-hint">Add an interview quote, a production note, or other context.</span>
                  <textarea name="story-notes" className="short-input" rows={2} maxLength={4000} value={form.notes} onChange={event => updateField('notes', event.target.value)} />
                </label>
              </details>
              {!archived && <div className="actions">
                <button className={!current || dirty ? 'primary' : ''} disabled={!!current && !dirty}>Save version</button>
                <button type="button" className={current && !dirty ? 'primary' : ''} disabled={dirty || !current?.content_format || !current?.content_kind || !data.provider.configured} onClick={review}>Review this version</button>
              </div>}
            </fieldset>
          </form>
          {dirty && current && <p className="hint">Save this draft before reviewing it.</p>}
          {!data.provider.configured && <p className="notice">AI review is unavailable. You can still save your draft.</p>}
          {!!data.revisions.length && <details className="optional-field"><summary>Saved versions</summary>
            {data.revisions.map(revision => <details className="version" key={revision.id}>
              <summary>Version {revision.version} · {localDateTime(revision.saved_at)}</summary>
              <p className="hint">Format: {formats[revision.content_format] || 'Not set'} · Type of story: {kinds[revision.content_kind] || 'Not set'}</p>
              <h3>{revision.title}</h3><div className="draft-copy">{revision.text}</div>
              {!!revision.source_urls?.length && <><h4>Source links</h4><div className="draft-copy">{revision.source_urls.join('\n')}</div></>}
              {revision.notes && <><h4>Notes</h4><div className="draft-copy">{revision.notes}</div></>}
            </details>)}
          </details>}
        </section>
        <section className="review-panel" aria-label="AI review">
          {!!data.runs.length && <div className="review-toolbar">
            <label>Review history<select value={runId || ''} disabled={!!busy} onChange={event => setRunId(event.target.value || null)}>
              {!data.runs.some(item => item.revision_id === current?.id) && <option value="" disabled>Version {current?.version} hasn’t been reviewed</option>}{data.runs.map(item => {
                const version = data.revisions.find(revision => revision.id === item.revision_id)?.version;
                return <option key={item.id} value={item.id}>{[version ? 'Version ' + version : 'Earlier version', localDateTime(item.saved_at), reviewStatus(item)].filter(Boolean).join(' · ')}</option>;
              })}
            </select></label>
          </div>}
          <ReviewResult run={run} taxonomy={data.taxonomy} busy={!!busy || archived} latest={run?.revision_id === current?.id}
            onMetadata={saveMetadata} canManageRules={data.can_manage_rules} />
        </section>
      </div>
      <StoryWorkflow key={current?.id} state={data.workflow} revision={current} disabled={!!busy || dirty || archived} onChange={refreshWorkspace} />
    </div> : null;

  return <div className="app">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="app-header">
      <div className="header-inner">
        <a className="brand" href={href(data ? 'stories' : 'legal')} onClick={event => {
          if (!isNormalClick(event)) return;
          event.preventDefault(); if (!busy) navigate(data ? 'stories' : 'legal');
        }}>Suiko <span>AI</span></a>
        <nav aria-label="Main">
          {data && <NavLink page="stories" current={page === 'stories' || page === 'story'} onNavigate={value => !busy && navigate(value)}>Stories</NavLink>}
          {data?.can_manage_rules && <NavLink page="rules" current={page === 'rules'} onNavigate={value => !busy && navigate(value)}>Rules</NavLink>}
          {(data?.capabilities.legal_review || page === 'legal') && <NavLink page="legal" current={page === 'legal'} onNavigate={value => !busy && navigate(value)}>Legal review</NavLink>}
          {canArchive && <NavLink page="archive" current={page === 'archive'} onNavigate={value => !busy && navigate(value)}>Archive</NavLink>}
        </nav>
      </div>
    </header>
    <main id="main">
      {error && <p className="error" role="alert">{error}</p>}
      {busy && <p className="busy-status" role="status">{busy}</p>}
      {!data && page !== 'legal' && <div className="list-page">
        <h1>Suiko AI</h1>{bootError ? <p className="error" role="alert">{bootError} <button onClick={() => window.location.reload()}>Try again</button></p>
          : <p role="status">Opening your workspace…</p>}
      </div>}
      {data && page === 'stories' && <Stories stories={data.stories} selected={current && !archived ? { id: storyId, title: current.title } : null}
        canSearchAll={data.capabilities.inbox === true} hasWorkflow={data.capabilities.workflow === true} busy={!!busy}
        onOpen={openStory} onNew={() => leaveDraft(() => startNew())} onSamples={() => setShowSamples(true)} />}
      {body}
      {data?.can_manage_rules && <div hidden={page !== 'rules'}>
        <Rules data={data} onRulesChanged={refreshRules} onOpenArchive={() => navigate('archive')} onArchive={(kind, item, after) => {
          setArchiveError(''); setArchiveTarget({ kind, item, after });
        }} />
      </div>}
      {canArchive && page === 'archive' && <Archive canManageRules={data.can_manage_rules} onChange={refreshWorkspace} onOpenStory={openStory} />}
      {page === 'legal' && <LegalReview key={route.task || 'tasks'} taskId={route.task} hasEditorAccess={!!data}
        onOpenTask={id => navigate('legal', id)} onBack={() => navigate('stories')} onChange={data ? refreshWorkspace : undefined} />}
      {showSamples && <Dialog title="Try a sample story" onClose={() => setShowSamples(false)}>
        <p>Load a fictional draft to try a review.</p>
        <div className="actions"><button onClick={() => sample('river1')}>River script</button>
          {current?.title.toLowerCase().includes('river cleanup') && !archived && <button onClick={() => { setShowSamples(false); leaveDraft(() => sample('river2')); }}>River script revision</button>}
          <button onClick={() => sample('library')}>Library article</button>
        </div>
      </Dialog>}
      {nextAction && <Dialog title="Leave this draft?" onClose={() => setNextAction(null)}>
        <p>Your unsaved changes will be lost.</p>
        <div className="actions dialog-actions"><button onClick={() => setNextAction(null)}>Keep editing</button>
          <button className="danger" onClick={() => { const action = nextAction; setNextAction(null); action(); }}>Leave draft</button></div>
      </Dialog>}
      {archiveTarget && <Dialog title={'Archive this ' + archiveTarget.kind + '?'} busy={!!busy} onClose={() => setArchiveTarget(null)}>
        <p><strong>{archiveTarget.item.title}</strong></p>
        <p>{archiveTarget.kind === 'rule' ? 'New reviews will stop using this rule. You can restore it from Archive.' : 'The story and its reviews will move to Archive. You can restore them later.'}</p>
        {archiveError && <p className="error" role="alert">{archiveError}</p>}
        <div className="actions dialog-actions"><button disabled={!!busy} onClick={() => setArchiveTarget(null)}>Cancel</button>
          <button className="primary" disabled={!!busy} onClick={confirmArchive}>{busy ? 'Archiving…' : 'Archive ' + archiveTarget.kind}</button></div>
      </Dialog>}
    </main>
    <Toaster position="bottom-right" closeButton />
  </div>;
}
