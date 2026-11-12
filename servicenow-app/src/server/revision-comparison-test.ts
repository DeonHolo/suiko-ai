import { gs } from '@servicenow/glide';
import { getState, reviewSavedVersion, saveRevision } from './workbench.ts';

function expect(value, message) {
  if (!value) throw new Error(message);
}

function action(handler, data, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, {
    setStatus: value => { status = value; }, setBody: value => { body = value; },
  });
  expect(status === 200, 'The fixture action failed: ' + JSON.stringify(body));
  return body;
}

export function runRevisionComparisonRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  function compare(before, after, makeChanges) {
    const title = 'ATF fictional caption comparison';
    const first = action(saveRevision, {
      request_key: 'ATF-first-' + gs.generateGUID(), title, text: before, notes: '',
      content_format: 'caption', content_kind: 'sponsored', source_urls: [],
    });
    const second = action(saveRevision, {
      request_key: 'ATF-second-' + gs.generateGUID(), story_id: first.story_id,
      expected_revision_id: first.id, title, text: after, notes: '',
      content_format: 'caption', content_kind: 'sponsored', source_urls: [],
    });
    const run = action((request, response) => reviewSavedVersion(request, response, () => ({
      model: 'injected-revision-fixture',
      generate(input) {
        const ref = (revision, quote) => ({ revision_id: revision.revision_id, segment_id: 'body-1', quote });
        const old = quote => ref(input.baseline_revision, quote);
        const current = quote => ref(input.candidate_revision, quote);
        return { model: 'injected-revision-fixture', raw: JSON.stringify({
          overview: 'This fictional caption was revised.',
          overview_evidence: [{ revision_id: input.candidate_revision.revision_id, segment_id: 'title', quote: title }],
          findings: [], claim_checks: [],
          assessment: {
            status: 'reviewed', coverage: { revision_comparison: 'complete', metadata_suggestions: 'complete' },
            changes: makeChanges(old, current), limitations: [],
            policy_assessments: input.policy_pack.rules.map(rule => ({
              rule_id: rule.rule_id, status: 'not_applicable', reason: 'This fixture checks caption edits.',
              evidence: [], suggested_action: null,
            })),
            metadata_suggestions: {
              section: { suggested_id: null, reason: 'No section selected.', evidence: [] },
              tags: { suggested_ids: [], reason: 'No tags selected.', evidence: [] },
              short_description: { suggested_text: null, reason: 'No description selected.', evidence: [] },
            },
          },
        }) };
      },
    }), () => []), {
      request_key: 'ATF-comparison-' + gs.generateGUID(), revision_id: second.id,
    });
    expect(run.state === 'complete', 'The revision review did not retain its checked sections.');
    const state = action(getState, {}, { story: first.story_id });
    const reopened = state.runs.find(item => item.id === run.id);
    expect(!!reopened.request.literal_edits, 'The saved literal edits did not reopen.');
    return reopened.result;
  }
  const before = 'Watch the cast interviews. Paid partnership with Lantern Coffee. Full video goes live Friday.';
  const after = 'Watch the cast interviews. Full video goes live Saturday.';
  const caption = compare(before, after, (old, current) => [
    { change_id: 'whole-removed', kind: 'removed', summary: 'The whole caption was removed.', before: [old(before)], after: [] },
    { change_id: 'whole-added', kind: 'added', summary: 'The whole caption was added.', before: [], after: [current(after)] },
    { change_id: 'disclosure', kind: 'removed', summary: 'The sponsor disclosure was removed.', before: [old('Paid partnership with Lantern Coffee.')], after: [] },
    { change_id: 'day', kind: 'modified', summary: 'The release day changed.', before: [old('Friday')], after: [current('Saturday')] },
  ]);
  expect(caption.assessment.changes.length === 2 && caption.assessment.changes[0].change_id === 'disclosure',
    'A whole-caption addition or removal was accepted, or a valid edit disappeared.');
  expect(caption.checks.issues.filter(issue => issue.code === 'CHANGE_NOT_IN_SAVED_EDITS').length === 2
    && caption.checks.overview_available, 'The rejected caption changes lost their diagnostics or overview.');
  const dates = compare('The library opens on December 5. Applications close on December 5.',
    'The library opens on December 12. Applications close on December 12.', (old, current) => [
      { change_id: 'opening', kind: 'modified', summary: 'The library opening changed.',
        before: [old('The library opens on December 5.')], after: [current('The library opens on December 12.')] },
      { change_id: 'deadline', kind: 'modified', summary: 'The application deadline changed.',
        before: [old('Applications close on December 5.')], after: [current('Applications close on December 12.')] },
    ]);
  expect(dates.assessment.changes.length === 2 && dates.assessment.changes[1].change_id === 'deadline',
    'Independent facts with the same date replacement were merged.');
  const omitted = compare('The opening is on December 5. Organizers expect 200 residents.',
    'The opening is on December 12. More than 500 residents are expected.', (old, current) => [
      { change_id: 'date', kind: 'modified', summary: 'The opening date changed.',
        before: [old('The opening is on December 5.')], after: [current('The opening is on December 12.')] },
    ]);
  expect(omitted.assessment.changes.length === 1 && omitted.assessment.coverage.revision_comparison === 'incomplete'
    && omitted.checks.issues.some(issue => issue.code === 'UNSUMMARIZED_EDIT'),
    'A date summary hid the unreported attendance and attribution edits.');
  const sharedWords = compare('The crew sings. The crew dances.', 'The crew dances.', old => [
    { change_id: 'sentence', kind: 'removed', summary: 'The singing sentence was removed.', before: [old('The crew sings.')], after: [] },
  ]);
  expect(sharedWords.assessment.changes.length === 1, 'Shared words prevented a valid sentence removal.');
  return 'Passed saved-version comparisons: retained caption text cannot be called removed or added; valid disclosure/day edits survive; independent dates retain their summaries and evidence after reload.';
}
