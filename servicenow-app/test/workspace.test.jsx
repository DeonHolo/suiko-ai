import React from 'react';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../src/client/app.jsx';
import Archive from '../src/client/Archive.jsx';
import Rules from '../src/client/Rules.jsx';
import Stories from '../src/client/Stories.jsx';
import { ReviewResult } from '../src/client/ReviewPanel.jsx';
import { localDateTime } from '../src/client/presentation.js';
import { lastStory } from '../src/client/routes.js';
import { reviewService, workspaceService } from '../src/client/services/ReviewService.js';

const river = { id: 'r1', story_id: 'river', version: 1, title: 'River cleanup', text: 'Volunteers will meet on Sunday.',
  notes: '', source_urls: [], content_format: 'script', content_kind: 'news', saved_at: '2026-11-13 01:48:49' };
const library = { ...river, id: 'l1', story_id: 'library', title: 'Library opening', content_format: 'article' };
const state = (revision = null, extras = {}) => ({
  viewer_id: 'editor-one', stories: [{ id: 'river', title: river.title }, { id: 'library', title: library.title }],
  story: revision ? { id: revision.story_id, title: revision.title } : null,
  revisions: revision ? [revision] : [], runs: [], rules: [], starter_templates: [],
  capabilities: { source_reading: true }, provider: { configured: true }, can_manage_rules: true,
  taxonomy: { sections: [], tags: [] }, ...extras,
});
const completed = (revision = river) => ({
  id: 'review-one', revision_id: revision.id, saved_at: '2026-11-13 01:48:49', modified: '0', model: 'gemini-3.5-flash-lite', state: 'complete',
  request: { rules: [], sources: [], input: { candidate_revision: { revision_id: revision.id, segments: [] }, baseline_revision: null } },
  result: { overview: 'A local volunteer cleanup is planned.', overview_evidence: [], findings: [], claim_checks: [],
    assessment: { status: 'reviewed', policy_assessments: [], changes: [], limitations: [],
      coverage: { revision_comparison: 'not_requested', metadata_suggestions: 'complete' },
      metadata_suggestions: { section: { suggested_id: null }, tags: { suggested_ids: [] }, short_description: { suggested_text: null } } } },
});
const deferred = () => {
  let resolve; let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
beforeEach(() => {
  window.history.replaceState(null, '', '/x_2236136_suiko_ai_review.do');
  window.localStorage.clear();
  mock.method(reviewService, 'state', async id => state(id === 'river' ? river : id === 'library' ? library : null));
});
afterEach(() => { cleanup(); mock.restoreAll(); });

test('timestamps use local time, twelve-hour clock and minutes; remembered story is account-specific', () => {
  assert.match(localDateTime('2026-11-13 01:48:49'), /Nov 13.*9:48 AM/);
  assert.equal(localDateTime('2026-11-13 01:48:49').includes('49'), false);
  assert.equal(localDateTime('not a date'), '');
  lastStory('editor-one', 'river');
  assert.equal(lastStory('editor-one'), 'river');
  assert.equal(lastStory('editor-two'), null);
});

test('opening Suiko resumes the signed-in editor’s last story and keeps model details out of the main review', async () => {
  lastStory('editor-one', 'river');
  mock.method(reviewService, 'state', async id => id ? state(river, { runs: [completed()] }) : state());
  render(<App />);
  await screen.findByRole('heading', { name: river.title, level: 1 });
  assert.equal(window.location.search, '?story=river');
  assert.equal(screen.getByLabelText('Story text').value, river.text);
  assert.equal(screen.queryByRole('button', { name: 'Archive story' }), null);
  const model = screen.getByText('Model gemini-3.5-flash-lite');
  assert.equal(model.closest('details').open, false);
  fireEvent.click(screen.getByText('Technical details'));
  await waitFor(() => assert.equal(model.closest('details').open, true));
});

test('a draft survives navigation to Stories; opening another story requires confirmation', async () => {
  window.history.replaceState(null, '', '?story=river');
  render(<App />);
  await screen.findByRole('heading', { name: river.title, level: 1 });
  fireEvent.change(screen.getByLabelText('Story text'), { target: { value: 'My unsaved rewrite.' } });
  fireEvent.click(screen.getByRole('link', { name: 'Stories' }));
  fireEvent.click(await screen.findByRole('link', { name: /Library opening/ }));
  const dialog = await screen.findByRole('dialog', { name: 'Leave this draft?' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open story' }));
  assert.equal(screen.getByLabelText('Story text').value, 'My unsaved rewrite.');
  fireEvent.click(screen.getByRole('link', { name: 'Stories' }));
  fireEvent.click(await screen.findByRole('link', { name: /Library opening/ }));
  fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Leave draft' }));
  await screen.findByRole('heading', { name: library.title, level: 1 });
  assert.equal(screen.getByLabelText('Title').value, library.title);
});

test('a successful first save stays saved when its history refresh fails', async () => {
  window.history.replaceState(null, '', '?page=story');
  const save = mock.method(reviewService, 'save', async () => river);
  mock.method(reviewService, 'state', async id => { if (id) throw new Error('Connection dropped'); return state(); });
  render(<App />);
  await screen.findByRole('heading', { name: 'New story', level: 1 });
  fireEvent.change(screen.getByLabelText('Title'), { target: { value: river.title } });
  fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'script' } });
  fireEvent.change(screen.getByLabelText('Type of story'), { target: { value: 'news' } });
  fireEvent.change(screen.getByLabelText('Story text'), { target: { value: river.text } });
  fireEvent.click(screen.getByRole('button', { name: 'Save version' }));
  await screen.findByText('Your version was saved. Reopen the story to refresh its history.');
  assert.equal(save.mock.callCount(), 1);
  assert.equal(screen.getByLabelText('Story text').value, river.text);
  assert.equal(screen.getByRole('button', { name: 'Review this version' }).disabled, false);
  assert.equal(screen.getByRole('button', { name: 'Save version' }).disabled, true);
});

test('a completed review remains visible when reloading review history fails', async () => {
  window.history.replaceState(null, '', '?story=river');
  let calls = 0;
  mock.method(reviewService, 'state', async id => { if (id && calls++ > 0) throw new Error('Connection dropped'); return state(id ? river : null); });
  mock.method(reviewService, 'review', async () => completed());
  render(<App />);
  await screen.findByRole('heading', { name: river.title, level: 1 });
  fireEvent.click(screen.getByRole('button', { name: 'Review this version' }));
  await screen.findByText('A local volunteer cleanup is planned.');
  await screen.findByText('Your review was saved. Reopen the story to refresh its history.');
});

test('failed malformed replies cannot crash the review screen and checked gaps show both passages in plain language', () => {
  const bad = { ...completed(), state: 'failed', request: null, result: { checks: { issues: [{ code: 'QUOTE_MISMATCH' }] } } };
  const view = render(<ReviewResult run={bad} taxonomy={{ sections: [], tags: [] }} />);
  screen.getByRole('heading', { name: 'The review couldn’t finish' });
  const partial = completed();
  partial.result.assessment.status = 'partial';
  partial.result.checks = { issues: [{ code: 'QUOTE_MISMATCH', path: '/overview', quote: 'Monday', source: 'Sunday', message: 'An evidence reference does not match its frozen source.' }] };
  view.rerender(<ReviewResult run={partial} latest taxonomy={{ sections: [], tags: [] }} />);
  fireEvent.click(screen.getByText('What could not be checked'));
  screen.getByText(/The quoted words don’t match your saved draft/);
  assert.equal(screen.queryByText('An evidence reference does not match its frozen source.'), null);
  assert.equal(screen.getByText('Monday').tagName, 'BLOCKQUOTE');
  assert.equal(screen.getByText('Sunday').tagName, 'BLOCKQUOTE');
});

test('rule lists show approved wording; policy drafts survive leaving and returning to policy setup', async () => {
  const rule = { id: 'rule-one', rule_id: 'RULE-1', title: 'New pending name', text: 'New wording.', priority: 'standard',
    formats: ['article'], content_kinds: ['news'], conditions: '', requires_sources: false, human_checks: [], active: true,
    pending: true, draft: { id: 'draft-one' }, modified: '1',
    approved: { definition: { title: 'Headline matches the story', text: 'Keep headlines consistent.', formats: ['article'] }, approval: {} } };
  mock.method(reviewService, 'policies', async () => ({ versions: [], policy: null }));
  render(<Rules data={state(null, { rules: [rule] })} onRulesChanged={async () => {}} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Headline' } });
  fireEvent.click(screen.getByRole('button', { name: /Headline matches the story/ }));
  screen.getByLabelText(/Only when/);
  screen.getByRole('checkbox', { name: /Read the story’s source links/ });
  screen.getByLabelText(/What should an editor confirm/);
  fireEvent.click(screen.getByRole('button', { name: /Back to rules/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Add a rule' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open company policy' }));
  await waitFor(() => assert.equal(screen.queryByText('Working with your saved policy…'), null));
  fireEvent.change(screen.getByLabelText('Policy title'), { target: { value: 'Our policy draft' } });
  fireEvent.change(screen.getByLabelText('Policy text'), { target: { value: 'Credit supplied footage.' } });
  fireEvent.click(screen.getByRole('button', { name: /Back to add a rule/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Open company policy' }));
  assert.equal(screen.getByLabelText('Policy text').value, 'Credit supplied footage.');
  assert.equal(screen.getByLabelText('Policy title').value, 'Our policy draft');
});

test('an old pagination reply cannot replace a new Stories search', async () => {
  const oldPage = deferred();
  mock.method(workspaceService, 'stories', async ({ search, cursor }) => {
    if (cursor) return oldPage.promise;
    return { items: [{ id: search || 'river', title: search ? 'Library result' : 'River result' }], next_cursor: search ? null : 'next' };
  });
  render(<Stories stories={[]} canSearchAll onOpen={() => {}} onNew={() => {}} />);
  await screen.findByRole('link', { name: /River result/ });
  fireEvent.click(screen.getByRole('button', { name: 'Show more stories' }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Library' } });
  await screen.findByRole('link', { name: /Library result/ });
  await act(async () => { oldPage.resolve({ items: [{ id: 'stale', title: 'Wrong older page' }], next_cursor: null }); });
  assert.equal(screen.queryByRole('link', { name: /Wrong older page/ }), null);
});

test('Archive hides permanent delete for retained evidence and shows server errors without closing the confirmation', async () => {
  const demo = { id: 'demo', title: 'Disposable demo', modified: '4', can_restore: true, can_delete: true };
  mock.method(workspaceService, 'archive', async () => ({ items: [demo, { id: 'kept', title: 'Capstone evidence', can_restore: true, can_delete: false }], next_cursor: null }));
  const change = mock.method(workspaceService, 'changeArchive', async () => { throw new Error('This story changed. Reopen Archive before deleting it.'); });
  render(<Archive canManageRules onChange={async () => {}} />);
  await screen.findByText('Capstone evidence');
  assert.equal(screen.queryByRole('button', { name: 'Delete permanently: Capstone evidence' }), null);
  fireEvent.click(screen.getByRole('button', { name: 'Delete permanently: Disposable demo' }));
  fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete permanently' }));
  await screen.findByRole('alert');
  screen.getByRole('dialog');
  assert.deepEqual(change.mock.calls[0].arguments, ['delete', 'story', demo]);
});

test('a legal-only account can open and clear only the frozen version supplied by the legal API', async () => {
  window.history.replaceState(null, '', '?page=legal&task=legal-one');
  mock.method(reviewService, 'state', async () => { throw new Error('Editor access required'); });
  const task = { id: 'legal-one', title: 'River legal check', modified: '3', status: 'pending', reason: 'Outside footage permission',
    revision: river, actions: ['clear', 'request_changes'] };
  mock.method(workspaceService, 'legal', async () => ({ task }));
  const decision = mock.method(workspaceService, 'legalDecision', async () => ({ task: { ...task, actions: [], status: 'cleared' } }));
  render(<App />);
  await screen.findByRole('heading', { name: 'River legal check', level: 1 });
  assert.equal(screen.queryByRole('link', { name: 'Stories' }), null);
  fireEvent.click(screen.getByRole('button', { name: 'Clear this version' }));
  fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Clear this version' }));
  await screen.findByText('Cleared');
  assert.deepEqual(decision.mock.calls[0].arguments[0], { task_id: 'legal-one', revision_id: river.id, expected_modified: '3', action: 'clear', note: '' });
});
