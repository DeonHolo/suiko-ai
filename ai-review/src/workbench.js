const byId = id => document.getElementById(id);
const editor = byId('draft');
const status = byId('status');
const reviewButton = byId('review');
const firstExample = byId('first-example');
const revisedExample = byId('revised-example');
const newStory = byId('new-story');
const profile = byId('profile');
let state;
let busy = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function disclosure(label, className) {
  const details = element('details', null, className);
  details.append(element('summary', label));
  return details;
}

function say(text, error = false) {
  status.textContent = text;
  status.classList.toggle('error', error);
}

async function getJson(path, options) {
  const response = await fetch(path, options);
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || 'The local review page could not finish the request.');
  return value;
}

function storyOf(item) {
  return item.story_id ?? state.session_id;
}

function activeDrafts() {
  return state.drafts.filter(draft => storyOf(draft) === state.active_story_id);
}

function versionLabel(revisionId, run) {
  if (revisionId === run.request.candidate_revision.revision_id) return `Version ${run.version}`;
  if (revisionId === run.request.baseline_revision?.revision_id) return `Version ${run.baseline}`;
  return 'Version named by Gemini';
}

function addEvidence(parent, references, run, label = 'Show evidence') {
  if (!references.length) return;
  const details = disclosure(label, 'evidence');
  for (const ref of references) {
    const quote = element('blockquote');
    quote.append(element('strong', versionLabel(ref.revision_id, run)), element('p', ref.quote));
    details.append(quote);
  }
  parent.append(details);
}

const ruleStatuses = {
  potential_conflict: 'Check needed',
  no_potential_conflict_observed: 'No issue found',
  not_assessable: 'Needs manual check',
  not_applicable: 'Does not apply',
};

function renderOverview(body, run) {
  const assessment = run.result.model_response;
  const overview = element('section', null, 'overview');
  overview.append(element('h3', 'AI overview'));
  const description = assessment.metadata_suggestions.short_description.suggested_text;
  if (description) overview.append(element('p', description));
  const checks = assessment.policy_assessments;
  const flagged = checks.filter(rule => ['potential_conflict', 'not_assessable'].includes(rule.status));
  if (flagged.length) {
    const list = element('ul');
    for (const rule of flagged) list.append(element('li', rule.suggested_action || rule.reason));
    overview.append(element('p', 'What to check next'), list);
  } else {
    overview.append(element('p', checks.every(rule => rule.status === 'not_applicable')
      ? 'The selected checklist rules did not apply to this draft.'
      : 'Gemini found no issues in the checklist rules that applied.'));
  }
  if (assessment.changes.length) {
    const count = assessment.changes.length;
    overview.append(element('p', `Gemini reported ${count} ${count === 1 ? 'change' : 'changes'}. See the before and after text below.`));
  }
  body.append(overview);
}

function renderAssessment(body, run) {
  const assessment = run.result.model_response;
  renderOverview(body, run);
  body.append(element('h3', 'Changes'));
  if (run.baseline === null) {
    body.append(element('p', 'First draft. This review used Version 1 only.', 'hint'));
  } else if (!assessment.changes.length) {
    body.append(element('p', 'No changes reported.', 'hint'));
  }
  for (const change of assessment.changes) {
    const item = element('div', null, 'item');
    item.append(element('p', change.summary));
    addEvidence(item, [...change.before, ...change.after], run, 'Show before and after');
    body.append(item);
  }

  body.append(element('h3', 'Checklist'));
  for (const rule of assessment.policy_assessments) {
    const item = element('div', null, 'item');
    const heading = element('h4', run.request.policy_pack.rules.find(item => item.rule_id === rule.rule_id)?.title ?? rule.rule_id);
    heading.append(element('span', ruleStatuses[rule.status],
      ['potential_conflict', 'not_assessable'].includes(rule.status) ? 'pill alert' : 'pill'));
    item.append(heading, element('p', rule.reason));
    if (rule.suggested_action) item.append(element('p', rule.suggested_action, 'action'));
    addEvidence(item, rule.evidence, run);
    body.append(item);
  }

  const metadata = assessment.metadata_suggestions;
  const label = (choices, id) => choices.find(item => item.id === id)?.label ?? id;
  const tags = metadata.tags.suggested_ids.map(id => label(run.request.taxonomy.tags, id));
  const section = label(run.request.taxonomy.sections, metadata.section.suggested_id);
  const details = element('div', null, 'item');
  body.append(element('h3', 'Tags and description'), details);
  details.append(element('p', [section, ...tags].filter(Boolean).join(' · ') || 'No labels suggested.'));
  if (metadata.short_description.suggested_text) {
    details.append(element('p', metadata.short_description.suggested_text));
    addEvidence(details, metadata.short_description.evidence, run, 'Show description evidence');
  }
  if (run.result.validation.assessment_status !== 'reviewed' && run.result.validation.limitations?.length) {
    const notes = disclosure('Review notes', 'raw');
    for (const note of run.result.validation.limitations) notes.append(element('p', note));
    body.append(notes);
  }
}

function explainFailure(body, run) {
  const failure = element('section', null, 'failure');
  failure.append(element('h3', 'Why this review stopped'));
  const { validation, model_response: reply } = run.result;
  if (validation.code === 'INVALID_EVIDENCE') {
    const path = validation.issues?.[0]?.path;
    const quote = path?.split('/').slice(1).reduce((value, key) => value?.[key], reply);
    const revision = [run.request.candidate_revision, run.request.baseline_revision]
      .find(item => item && item.revision_id === quote?.revision_id);
    const source = revision?.segments.find(item => item.segment_id === quote?.segment_id);
    const quotedText = typeof quote?.quote === 'string' ? quote.quote : null;
    const shortened = quotedText && source && !source.text.includes(quotedText) && /\.\.\.|…/.test(quotedText);
    failure.append(element('p', shortened
      ? 'Gemini joined two parts of your text with “...”. A quote has to match the saved text word for word.'
      : 'Gemini did not give a usable quote from the saved draft.'));
    if (quotedText !== null) {
      const evidence = element('div', null, 'evidence');
      evidence.append(element('strong', 'Gemini’s quote'), element('blockquote', quotedText));
      if (source) evidence.append(element('strong', 'Your saved text'), element('blockquote', source.text));
      failure.append(evidence);
    }
  } else if (validation.code === 'INVALID_CHANGES') {
    const changes = Array.isArray(reply?.changes) ? reply.changes : [];
    const mismatched = changes.find(change => change.kind === 'removed' && change.after?.length);
    failure.append(element('p', mismatched
      ? 'Gemini marked a change as Removed and quoted both drafts. Showing both drafts needs the Edited label.'
      : 'Gemini’s change label and the quotes it supplied did not fit together.'));
    if (mismatched) addEvidence(failure, [...mismatched.before, ...mismatched.after], run, 'Show Gemini’s two quotes');
  } else {
    failure.append(element('p', validation.code ? 'Gemini’s reply did not pass the review checks.' : validation.message));
  }
  failure.append(element('p', `Version ${run.version} is saved.`));
  if (storyOf(run) === state.active_story_id && activeDrafts().at(-1)?.version === run.version) {
    failure.append(element('p', 'Click Review again with the same text to retry this version.'));
  }
  body.append(failure);

  if (reply && typeof reply === 'object') {
    const preview = disclosure('See Gemini’s unverified reply', 'raw');
    const list = element('ul');
    for (const change of Array.isArray(reply.changes) ? reply.changes : []) {
      if (typeof change?.summary === 'string') list.append(element('li', change.summary));
    }
    if (list.childNodes.length) preview.append(element('p', 'Changes Gemini reported'), list);
    const description = reply.metadata_suggestions?.short_description?.suggested_text;
    if (typeof description === 'string') preview.append(element('p', 'Description Gemini suggested'), element('p', description));
    if (preview.childNodes.length > 1) body.append(preview);
  }
}

function report(run, open) {
  const comparison = run.baseline === null ? 'first draft' : `compared with Version ${run.baseline}`;
  const details = disclosure(`Version ${run.version} review · ${comparison}`, 'report');
  details.open = open;
  const badge = run.state === 'complete' ? (run.result.validation.assessment_status === 'reviewed' ? 'Saved' : 'Saved · limited')
    : run.state === 'failed' ? 'Review did not pass' : 'Reviewing';
  details.firstChild.append(element('span', badge, run.state === 'failed' ? 'pill alert' : 'pill'));
  const body = element('div', null, 'report-body');
  const selected = state.profiles.find(item => item.policy_pack.pack_id === run.request.policy_pack.pack_id);
  body.append(element('p', `Checklist used: ${selected?.label ?? run.request.policy_pack.pack_id}`, 'hint'));
  if (storyOf(run) !== state.active_story_id) details.firstChild.append(element('span', 'Earlier story', 'pill'));
  if (run.state === 'running') {
    body.append(element('p', 'The draft is saved. Gemini is reviewing it.', 'hint'));
  } else {
    if (run.state === 'complete') renderAssessment(body, run);
    else explainFailure(body, run);
    const draft = state.drafts.find(item => storyOf(item) === storyOf(run) && item.version === run.version);
    if (draft) {
      const source = disclosure('Show saved draft text', 'raw');
      source.append(element('pre', draft.text));
      body.append(source);
    }
    const raw = disclosure('See saved review data', 'raw');
    raw.append(element('pre', JSON.stringify(run.result, null, 2)));
    body.append(raw);
  }
  details.append(body);
  return details;
}

function render() {
  const drafts = activeDrafts().map(draft => {
    const details = disclosure(`Version ${draft.version}`, 'version');
    details.append(element('pre', draft.text));
    return details;
  });
  byId('versions').replaceChildren(...(drafts.length ? drafts : [element('p', 'Your drafts will appear here.', 'hint')]));
  const runs = [...state.runs].reverse().map((run, index) => report(run, index === 0));
  byId('history').replaceChildren(...(runs.length ? runs : [element('p', 'Your first reply will appear here.', 'hint')]));
  renderRules();
  updateControls();
}

function updateControls() {
  const latest = activeDrafts().at(-1);
  editor.disabled = busy;
  firstExample.disabled = busy;
  revisedExample.disabled = busy || !latest?.text.startsWith(state.examples[0].split('\n')[0]);
  newStory.disabled = busy || !latest;
  profile.disabled = busy;
  reviewButton.disabled = busy || !editor.value.trim();
  reviewButton.textContent = busy ? 'Reviewing…' : 'Review';
  const same = latest?.text === editor.value;
  byId('next-step').textContent = !latest ? 'Saves Version 1 and reviews it on its own.'
    : same ? `Reviews saved Version ${latest.version} again.`
    : `Saves Version ${latest.version + 1} and compares it with Version ${latest.version}.`;
}

async function startNewStory(replacement) {
  if (!state || busy) return;
  busy = true;
  updateControls();
  try {
    state = await getJson('/api/new-story', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expected_story_id: state.active_story_id }),
    });
    editor.value = replacement;
    if (replacement === state.examples[0]) profile.value = 'video';
    say(replacement ? 'New story ready. Review saves it as Version 1.' : 'New story ready. Paste a draft and choose its checklist.');
  } catch (error) {
    say(error.message, true);
  } finally {
    busy = false;
    render();
    editor.focus();
  }
}

function renderRules() {
  const selected = state.profiles.find(item => item.id === profile.value);
  byId('rules').replaceChildren(...(selected?.policy_pack.rules ?? []).map(rule => element('li', rule.title)));
}

function loadExample(index) {
  if (index === 0 && activeDrafts().length) return startNewStory(state.examples[0]);
  editor.value = state.examples[index];
  profile.value = 'video';
  renderRules();
  updateControls();
  say(index === 0 ? 'First script loaded. Click Review when you’re ready.' : 'Revised script loaded. Click Review to save and compare it.');
  editor.focus();
}

byId('review-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!state || busy || !editor.value.trim()) return;
  const latest = activeDrafts().at(-1);
  busy = true;
  updateControls();
  say('Gemini is reviewing your text. This may take a minute.');
  try {
    state = await getJson('/api/review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: editor.value, profile_id: profile.value,
        expected_story_id: state.active_story_id, expected_revision_id: latest?.revision_id ?? null,
      }),
    });
    const run = state.runs.at(-1);
    say(run.state === 'complete'
      ? `Version ${run.version} and its review are saved below.`
      : `Version ${run.version} is saved. See the review message below.`, run.state === 'failed');
  } catch (error) {
    say(error.message, true);
    try { state = await getJson('/api/state'); } catch { /* Keep the draft in the text box. */ }
  } finally {
    busy = false;
    render();
  }
});

async function openWorkbench() {
  try {
    state = await getJson('/api/state');
    byId('model').textContent = state.model === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Flash-Lite' : 'Gemini 3.5 Flash-Lite';
    profile.replaceChildren(...state.profiles.map(item => {
      const option = element('option', item.label);
      option.value = item.id;
      return option;
    }));
    profile.value = state.runs.findLast(run => storyOf(run) === state.active_story_id)?.profile_id ?? 'video';
    editor.value = activeDrafts().at(-1)?.text ?? (state.drafts.length ? '' : state.examples[0]);
    render();
    say(activeDrafts().length ? 'Ready for your next edit.' : state.drafts.length
      ? 'Paste a draft for your new story.' : 'First river script loaded. You can edit it before reviewing.');
  } catch {
    say('The local review page could not open. Try reloading it.', true);
  }
}

firstExample.addEventListener('click', () => loadExample(0));
revisedExample.addEventListener('click', () => loadExample(1));
newStory.addEventListener('click', () => startNewStory(editor.value === activeDrafts().at(-1)?.text ? '' : editor.value));
profile.addEventListener('change', renderRules);
editor.addEventListener('input', updateControls);
openWorkbench();
