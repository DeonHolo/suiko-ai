(function () {
    var root = 'x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/';
    var persist = require(root + 'generated/review-attempt.js').persistReviewAttempt;
    var validators = require(root + 'generated/validators.js');
    var getState = require(root + 'workbench.ts').getState;
    var token = gs.generateGUID();
    var story = new GlideRecord('x_2236136_suiko_ai_story');
    story.initialize();
    story.setValue('title', 'AI-16 automated persistence fixture');
    var storyId = String(story.insert());
    var revision = new GlideRecord('x_2236136_suiko_ai_revision');
    revision.initialize();
    revision.setValue('story', storyId);
    revision.setValue('version', 1);
    revision.setValue('version_key', storyId + ':1');
    revision.setValue('request_key', 'atf-revision-' + token);
    revision.setValue('title', 'AI-16 automated persistence fixture');
    revision.setValue('body', 'A fictional studio rehearses a scene.');
    var revisionId = String(revision.insert());
    var reference = { revision_id: 'fixture-1', segment_id: 'body-1', quote: 'A fictional studio rehearses a scene.' };
    var input = {
        schema_version: '0.2.0', request_id: token, content_id: storyId, language: 'en', baseline_revision: null,
        candidate_revision: { revision_id: 'fixture-1', segments: [{ segment_id: 'body-1', field: 'body', text: reference.quote }] },
        policy_pack: { pack_id: 'fixture-policy', version: '1', approval_reference: 'Fictional automated test', rules: [
            { rule_id: 'FIXTURE', title: 'Fixture check', text: 'Check this fictional passage.', priority: 'standard' }
        ] },
        taxonomy: { sections: [{ id: 'arts', label: 'Arts' }], tags: [{ id: 'studio', label: 'Studio' }] },
        current_metadata: { section_id: null, tag_ids: [], short_description: '' }
    };
    function reply() {
        return {
            overview: 'This draft describes a fictional studio rehearsal.', overview_evidence: [reference], findings: [],
            assessment: { status: 'reviewed', coverage: { revision_comparison: 'not_requested', metadata_suggestions: 'complete' },
                changes: [], limitations: [], policy_assessments: [{ rule_id: 'FIXTURE', status: 'no_potential_conflict_observed',
                    reason: 'The fictional passage was checked.', evidence: [reference], suggested_action: null }],
                metadata_suggestions: {
                    section: { suggested_id: 'arts', reason: 'The passage describes a studio rehearsal.', evidence: [reference] },
                    tags: { suggested_ids: ['studio'], reason: 'The passage describes a studio.', evidence: [reference] },
                    short_description: { suggested_text: 'A fictional studio rehearses a scene.', reason: 'Present in the draft.', evidence: [reference] }
                }
            }
        };
    }
    function attempt(name, raw) {
        var run = new GlideRecord('x_2236136_suiko_ai_review');
        run.initialize();
        run.setValue('revision', revisionId);
        run.setValue('request_key', 'atf-' + name + '-' + token);
        run.setValue('active_revision', revisionId);
        run.setValue('state', 'running');
        run.setValue('model', 'injected-fixture-not-gemini');
        run.setValue('request_json', JSON.stringify({ input: input, rules: input.policy_pack.rules, provider: { test_fixture: true } }));
        var runId = String(run.insert());
        if (!runId || runId === 'null') throw new Error('Could not acquire the revision for ' + name);
        persist(run, input, function () { return raw; }, validators);
        var saved = new GlideRecord('x_2236136_suiko_ai_review');
        if (!saved.get(runId)) throw new Error('The attempt was not saved.');
        assertEqual({ name: name + ' released the revision lock', shouldbe: '', value: saved.getValue('active_revision') || '' });
        return saved;
    }
    var partialReply = reply();
    partialReply.assessment.policy_assessments[0].evidence = [];
    var partial = attempt('partial', JSON.stringify(partialReply));
    assertEqual({ name: 'Partial attempt completes', shouldbe: 'complete', value: partial.getValue('state') });
    assertEqual({ name: 'Checked result replaces raw reply', shouldbe: 'not_assessable', value: JSON.parse(partial.getValue('response_json')).assessment.policy_assessments[0].status });
    var mismatchReply = reply();
    mismatchReply.assessment.policy_assessments = [];
    var mismatch = attempt('mismatch', JSON.stringify(mismatchReply));
    assertEqual({ name: 'Checklist mismatch fails', shouldbe: 'failed', value: mismatch.getValue('state') });
    assertEqual({ name: 'Mismatch stores its diagnostic', shouldbe: 'CHECKLIST_MISMATCH', value: JSON.parse(mismatch.getValue('error_json')).code });
    assertEqual({ name: 'Mismatch keeps unchecked reply', shouldbe: 0, value: JSON.parse(mismatch.getValue('response_json')).assessment.policy_assessments.length });
    var malformed = attempt('malformed', '{"overview":');
    assertEqual({ name: 'Malformed JSON fails', shouldbe: 'failed', value: malformed.getValue('state') });
    assertEqual({ name: 'Malformed JSON stores its diagnostic', shouldbe: 'INVALID_PROVIDER_JSON', value: JSON.parse(malformed.getValue('error_json')).code });
    var retried = attempt('retry', JSON.stringify(reply()));
    assertEqual({ name: 'The same revision can be retried', shouldbe: 'complete', value: retried.getValue('state') });
    var state;
    getState({ queryParams: { story: storyId } }, { setBody: function (value) { state = value; }, setStatus: function (value) { throw new Error('History failed: ' + value); } });
    assertEqual({ name: 'History reopens all four attempts', shouldbe: 4, value: state.runs.length });
    assertEqual({ name: 'Saved draft stays intact', shouldbe: reference.quote, value: state.revisions[0].text });
    stepResult.setOutputMessage('AI-16 passed: partial checked JSON, saved checklist/malformed failures, intact draft, released locks, retry and reopened history.');
    return true;
})();
