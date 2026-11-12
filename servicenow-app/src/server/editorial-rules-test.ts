import { GlideRecord, gs } from '@servicenow/glide';
import { saveRule, approveRule, setRuleActive, saveRevision, getState, savePolicy, getPolicies, suggestPolicyChecks, executeGemini, proposePolicyChecks, reviewSavedVersion } from './workbench.ts';
import { approveSavedRule, listEditorialRules, setSavedRuleActive } from './editorial-rules.ts';
import { approvedRulesForReview } from './generated/editorial-rules.js';
import { readSavedSources } from './read-sources.ts';
import { addDecisionConfidence } from './decision-check.ts';

function expect(value, message) {
  if (!value) throw new Error(message);
}
function action(handler, data, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, { setStatus: value => { status = value; }, setBody: value => { body = value; } });
  return { status, body };
}
function current(result, identity) {
  expect(result.status === 200, 'Rule action failed: ' + JSON.stringify(result.body));
  const rule = result.body.rules.find(item => item.rule_id === identity);
  expect(!!rule, 'Saved rule was not returned.');
  return rule;
}

function approvalInput(rule) {
  return { id: rule.id, version_id: rule.draft.id, expected_modified: rule.modified };
}

function expectCapacityRejection(rule) {
  try {
    approveSavedRule(approvalInput(rule), () => 12);
  } catch (error) {
    expect(error.status === 400 && error.message.includes('twelve rules'), 'A full pack did not report the capacity limit.');
    const saved = listEditorialRules().find(item => item.id === rule.id);
    expect(!saved.active && !saved.approved && saved.modified === rule.modified, 'The capacity rejection changed the saved proposal.');
    return;
  }
  throw new Error('The thirteenth rule was approved.');
}

export function runRuleManagerRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  const identity = 'ATF-' + gs.generateGUID();
  const definition = {
    title: 'ATF headline wording fixture', text: 'Keep the uncertainty stated in the reporting.', priority: 'standard',
    formats: ['article'], content_kinds: ['news'], conditions: 'When the headline describes a proposed plan.',
    human_checks: ['The editor decides whether the wording is appropriate.'], origin: { kind: 'manual' },
  };
  let rule = current(action(saveRule, { rule_id: identity, ...definition }), identity);
  expect(rule.pending && !rule.active && !rule.approved, 'An unapproved proposal became active.');
  // Use a controlled pack for capacity. This test does not turn off anyone's saved rules.
  expectCapacityRejection(rule);
  const fixtureCapacity = () => 11;
  const firstProposal = rule.draft.id;
  const firstApproval = approvalInput(rule);
  const staleEdit = { id: rule.id, rule_id: identity, ...definition, expected_modified: rule.modified };
  rule = approveSavedRule(firstApproval, fixtureCapacity).rules.find(item => item.rule_id === identity);
  expect(rule.active && rule.approved.definition.text === definition.text, 'The first approval did not capture the saved wording.');
  expect(rule.approved.approval.by === String(gs.getUserID()), 'The approval did not identify the actual editor.');
  expect(action(approveRule, firstApproval).status === 409, 'A repeated approval with the old revision token was accepted.');
  expect(action(saveRule, staleEdit).status === 409, 'A stale edit was accepted after approval changed the rule.');
  const first = JSON.stringify(rule.approved);
  expect(action(approveRule, approvalInput(rule)).status === 409, 'The same version was approved twice with a fresh revision token.');
  const afterRetry = listEditorialRules().find(item => item.id === rule.id);
  expect(afterRetry.modified === rule.modified && JSON.stringify(afterRetry.approved) === first, 'Repeat approval rewrote the original record.');
  const stale = { id: rule.id, version_id: firstProposal, expected_modified: rule.modified };

  // Model the retained version from an interrupted concurrent proposal.
  const interrupted = new GlideRecord('x_2236136_suiko_ai_rule_version');
  interrupted.initialize();
  interrupted.setValue('parent_rule', rule.id);
  interrupted.setValue('version', rule.version + 1);
  interrupted.setValue('version_key', rule.id + ':' + (rule.version + 1));
  interrupted.setValue('definition_json', JSON.stringify(definition));
  expect(!!interrupted.insert(), 'Could not prepare the interrupted-proposal fixture.');

  rule = current(action(saveRule, { id: rule.id, rule_id: identity, expected_modified: rule.modified,
    ...definition, text: 'Preserve uncertainty in both the headline and public caption.' }), identity);
  expect(rule.pending && rule.active && JSON.stringify(rule.approved) === first, 'A proposed replacement changed the active approval.');
  expect(approvedRulesForReview([rule])[0].text === definition.text, 'Review input used the unapproved replacement.');
  expect(action(approveRule, stale).status === 409, 'A stale approval was not rejected.');
  expect(action(approveRule, { ...stale, expected_modified: rule.modified }).status === 409, 'An old version identity approved the replacement.');

  const secondProposal = rule.draft.id;
  rule = approveSavedRule(approvalInput(rule), fixtureCapacity).rules.find(item => item.rule_id === identity);
  expect(rule.approved.version_id === secondProposal && rule.approved.definition.text !== definition.text, 'The replacement approval did not identify its exact saved version.');
  const original = new GlideRecord('x_2236136_suiko_ai_rule_version');
  expect(original.get(firstProposal), 'The original rule version disappeared.');
  expect(JSON.parse(original.getValue('definition_json')).text === definition.text, 'The original rule wording was overwritten.');
  expect(JSON.stringify(JSON.parse(original.getValue('approval_json'))) === JSON.stringify(JSON.parse(first).approval), 'The original approval details were overwritten.');
  const second = JSON.stringify(rule.approved);
  rule = current(action(setRuleActive, { id: rule.id, active: false, expected_modified: rule.modified }), identity);
  expect(!rule.active && JSON.stringify(rule.approved) === second, 'Turning a rule off changed its approval record.');
  rule = setSavedRuleActive({ id: rule.id, active: true, expected_modified: rule.modified }, fixtureCapacity).rules.find(item => item.rule_id === identity);
  expect(rule.active && JSON.stringify(rule.approved) === second, 'Re-enabling an approved rule changed its wording or approval.');
  return 'Passed as a non-admin rules editor: capacity rejection, one approval per saved version, stale edits, pending replacement, retained interrupted version, original approval and disable/re-enable.';
}

export function runEverydayEditorRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.editor') && !gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated everyday-editor test user.');
  for (const handler of [saveRule, approveRule, setRuleActive, getPolicies, savePolicy, suggestPolicyChecks]) {
    expect(action(handler, {}).status === 403, 'The everyday editor could change rules or open company-policy setup.');
  }
  const saved = action(saveRevision, {
    request_key: 'ATF-editor-' + gs.generateGUID(), title: 'ATF everyday editor draft', text: 'A fictional crew rehearses a scene.',
    notes: '', content_format: 'script', content_kind: 'opinion', source_urls: [],
  });
  expect(saved.status === 200 && !!saved.body.id, 'The everyday editor could not save a story.');
  let state;
  getState({ queryParams: { story: saved.body.story_id } }, { setBody: value => { state = value; }, setStatus: value => { throw new Error('State failed: ' + value); } });
  expect(state.can_manage_rules === false && state.revisions[0].text === 'A fictional crew rehearses a scene.', 'The everyday editor state did not preserve its role boundary or saved draft.');
  return 'Passed as a non-admin everyday editor: story save/reopen allowed; shared-rule and company-policy setup actions denied. No Gemini calls.';
}

export function runPolicySetupRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  const text = 'A proposal remains pending unless the council records a vote.\n\nThe editor confirms the recorded vote.';
  const payload = { title: 'ATF handbook', text, request_key: 'ATF-' + gs.generateGUID() };
  const saved = action(savePolicy, payload);
  expect(saved.status === 200 && saved.body.policy.text === text, 'The saved policy lost its original text.');
  const policy = saved.body.policy;
  const repeated = action(savePolicy, payload);
  expect(repeated.status === 200 && repeated.body.policy.id === policy.id, 'Retrying a save made a second copy.');
  expect(action(savePolicy, { ...payload, text: 'Different wording.' }).status === 409, 'A conflicting save reused the old request.');
  const replacement = action(savePolicy, { ...payload, text: 'Revised wording.', request_key: 'ATF-' + gs.generateGUID() });
  expect(replacement.status === 200 && replacement.body.policy.id !== policy.id, 'An edited policy overwrote the original copy.');
  const old = action(getPolicies, {}, { version: policy.id });
  expect(old.status === 200 && old.body.policy.text === text, 'The original policy copy could not be reopened.');

  const ruleId = 'ATF-' + gs.generateGUID();
  const definition = {
    rule_id: ruleId, title: 'ATF policy headline', text: policy.passages[0].text, priority: 'standard',
    formats: ['article'], content_kinds: ['news'], origin: { kind: 'policy', policy_version_id: policy.id, passage_ids: ['policy-1'] },
  };
  expect(action(saveRule, { ...definition, origin: { ...definition.origin, passage_ids: ['policy-99'] } }).status === 400, 'A forged policy reference was accepted.');
  const draft = current(action(saveRule, definition), ruleId);
  expect(draft.pending && !draft.active && draft.text === policy.passages[0].text, 'The original wording was changed or activated without approval.');
  const approved = approveSavedRule(approvalInput(draft), () => 0).rules.find(rule => rule.rule_id === ruleId);
  expect(approved.active && approved.approved.definition.origin.policy_version_id === policy.id && approved.approved.definition.text === policy.passages[0].text, 'Approval lost the saved policy reference or verbatim wording.');

  const before = JSON.stringify(listEditorialRules());
  let calls = 0;
  let fallbackEndpoint = '';
  const fakeReply = { proposals: [{ ...definition, conditions: '', human_checks: [], checks: ['text_review'],
    evidence: [{ passage_id: 'policy-1', quote: policy.passages[0].text }] }], questions: [] };
  const message = {
    setEndpoint: url => { fallbackEndpoint = url; },
    execute: () => {
      calls++;
      return calls === 1 ? { getStatusCode: () => 503 } : {
        getStatusCode: () => 200,
        getBody: () => JSON.stringify({ modelVersion: 'gemini-3.1-flash-lite',
          candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(fakeReply) }] } }] }),
      };
    },
  };
  const suggestions = proposePolicyChecks({ policy_version_id: policy.id },
    () => executeGemini(message, 'gemini-3.5-flash-lite', 'suggest checks', 'The saved policy is available.'));
  expect(calls === 2 && fallbackEndpoint.endsWith('/gemini-3.1-flash-lite:generateContent'), 'Policy suggestions did not retry the expected model.');
  expect(suggestions.model === 'gemini-3.1-flash-lite' && suggestions.proposals.length === 1, 'The fallback did not retain a usable suggestion.');
  let failed = false;
  try {
    proposePolicyChecks({ policy_version_id: policy.id }, () => ({ raw: 'Unreadable JSON' }));
  } catch (error) {
    failed = error.code === 'INVALID_POLICY_INPUT';
  }
  expect(failed, 'A failed suggestion was accepted.');
  expect(JSON.stringify(listEditorialRules()) === before, 'The suggestion or failed reply changed the approved rules.');
  return 'Passed as rules editor: saved copies, repeat saves, exact passage references, approval, fallback from a simulated 503, and unchanged rules after a failed reply. No live Gemini calls.';
}

export function runClaimEvidenceRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.rules_editor') && !gs.hasRole('admin'), 'Use the dedicated rules-editor test user.');
  const sourceId = 'ATF-source-' + gs.generateGUID();
  const secondSourceId = 'ATF-second-source-' + gs.generateGUID();
  const headlineId = 'ATF-headline-' + gs.generateGUID();
  const scope = { formats: ['article'], content_kinds: ['news'], origin: { kind: 'manual' }, priority: 'standard' };
  for (const definition of [
    { ...scope, rule_id: sourceId, title: 'ATF supplied brief', text: 'Check the times and seats against the brief.', requires_sources: true },
    { ...scope, rule_id: secondSourceId, title: 'ATF second source requirement', text: 'Confirm the room capacity with a signed venue notice.', requires_sources: true },
    { ...scope, rule_id: headlineId, title: 'ATF headline', text: 'Do not say a proposed opening is confirmed.' },
  ]) {
    const draft = current(action(saveRule, definition), definition.rule_id);
    const approval = action(approveRule, approvalInput(draft));
    expect(current(approval, definition.rule_id).active, 'The fixture rule was not approved.');
  }
  const title = 'The opening has been confirmed';
  const time = 'The screening starts at 6 p.m.';
  const actualTime = 'The screening starts at 7 p.m.';
  const price = 'Admission costs three dollars.';
  const seating = Array.from({ length: 12 }, (_, index) => `Screen ${index + 1} has 120 seats.`);
  const requestedUrl = 'https://example.org/brief';
  const openedUrl = 'https://example.org/opened-brief';
  const missingUrl = 'https://example.org/missing';
  const saved = action(saveRevision, {
    request_key: 'ATF-draft-' + gs.generateGUID(), title, text: [...seating, time, price].join(' '),
    notes: 'The opening is still proposed.', content_format: 'article', content_kind: 'news', source_urls: [requestedUrl, missingUrl],
  });
  expect(saved.status === 200, 'The fictional story could not be saved.');
  const fixtureRead = (urls, needed) => readSavedSources(urls, needed, url => ({
    status: 200,
    body: JSON.stringify({ data: url === missingUrl ? { httpStatus: 404 } : {
      httpStatus: 200, url: requestedUrl, finalUrl: openedUrl, text: [...seating, actualTime].join(' '),
    } }),
  }));
  const ref = (segment_id, quote) => ({ revision_id: 'draft-1', segment_id, quote });
  const check = (claim, status, quote) => ({
    rule_id: sourceId, claim: ref('body-1', claim), status,
    sources: [{ source_id: 'source-1', passage_id: 'passage-1', quote }],
    context: [], reason: 'Compare the event brief.', action: 'Confirm the details with the editor.',
  });
  const seats = seating.map(claim => check(claim, 'supported', claim));
  const conflict = check(time, 'contradicted', actualTime);
  function run(checks, includeSourceFinding, reportedStatus, { decision = false, description = price, secondSourceGap = false } = {}) {
    const result = action((request, response) => reviewSavedVersion(request, response, () => ({
      model: 'injected-claim-fixture',
      generate(input) {
        expect(input.source_material[0].final_url === openedUrl, 'The model input lost the opened address.');
        expect(input.source_material[1].status === 'unavailable', 'The missing link was treated as retrieved evidence.');
        const finding = { rule_id: headlineId, summary: 'The headline overstates a proposed opening.',
          action: 'Describe it as proposed.', evidence: [ref('title', title)], concern_evidence: [] };
        const findings = includeSourceFinding ? [finding, {
          rule_id: sourceId, summary: 'The brief gives a different time.', action: 'Check the screening time.',
          evidence: [ref('body-1', time)],
        }] : [finding];
        const statuses = {
          [sourceId]: reportedStatus, [headlineId]: 'no_potential_conflict_observed',
          [secondSourceId]: secondSourceGap ? 'not_assessable' : 'not_applicable',
        };
        const evidence = {
          [headlineId]: [ref('title', title)],
          [sourceId]: reportedStatus === 'not_assessable' ? [ref('body-1', [...seating, time, price].join(' '))] : [],
          [secondSourceId]: secondSourceGap ? [ref('body-1', seating[0])] : [],
        };
        return { model: 'injected-claim-fixture', raw: JSON.stringify({
          overview: 'The draft covers a screening.', overview_evidence: [ref('body-1', seating[0])], findings, claim_checks: checks,
          assessment: {
            status: 'reviewed', coverage: { revision_comparison: 'not_requested', metadata_suggestions: 'complete' }, changes: [], limitations: [],
            policy_assessments: input.policy_pack.rules.map(rule => ({
              rule_id: rule.rule_id,
              status: statuses[rule.rule_id] || 'not_applicable',
              reason: 'Fixture rule assessment.', evidence: evidence[rule.rule_id] || [],
              suggested_action: null,
            })),
            metadata_suggestions: {
              section: { suggested_id: null, reason: 'No section selected.', evidence: [] },
              tags: { suggested_ids: [], reason: 'No tags selected.', evidence: [] },
              short_description: reportedStatus === 'not_assessable' || secondSourceGap
                ? { suggested_text: description, reason: 'From the draft.', evidence: [ref('body-1', description)] }
                : { suggested_text: title, reason: 'From the draft title.', evidence: [ref('title', title)] },
            },
          },
        }) };
      },
      finish(input, result) {
        return addDecisionConfidence(input, result, '', request => ({
          getStatusCode: () => 200,
          getBody: () => JSON.stringify({ answers: Object.fromEntries(Object.keys(request.questions).map(id => [id, {
            type: 'choice', choice: 'supported', confidence: 0.8, probabilities: { supported: 0.8, contradicted: 0.1, insufficient: 0.1 },
          }])) }),
        }));
      },
    }), fixtureRead), { request_key: 'ATF-review-' + gs.generateGUID(), revision_id: saved.body.id, decision_check: decision });
    expect(result.status === 200 && result.body.state === 'complete', 'Review did not retain usable results: ' + JSON.stringify(result.body.error));
    return result.body;
  }
  const mixed = run([...seats, conflict], false, 'potential_conflict', { decision: true });
  const sourceRule = review => review.result.assessment.policy_assessments.find(rule => rule.rule_id === sourceId);
  expect(sourceRule(mixed).status === 'potential_conflict' && sourceRule(mixed).evidence[0].quote === time, 'The conflict was displaced by the supported claims.');
  expect(mixed.result.decision_check.status === 'partial' && mixed.result.decision_check.skipped_claim_ids[0] === 'claim-13', 'The confidence coverage limit was not saved.');
  expect(mixed.result.assessment.metadata_suggestions.short_description.suggested_text === null, 'An empty concern list let the flagged headline into the description.');
  expect(mixed.result.checks.issues.some(issue => issue.code === 'CONTRADICTORY_RULE_STATUS'), 'The headline rule cleared a retained finding.');
  const omitted = run([seats[0]], true, 'no_potential_conflict_observed');
  expect(sourceRule(omitted).status === 'not_assessable' && omitted.result.findings.some(finding => finding.rule_id === sourceId), 'A supported claim hid an unmatched concern.');
  const gap = run([seats[0]], false, 'not_assessable');
  expect(sourceRule(gap).evidence[0].quote.includes(price) && gap.result.claim_checks[0].status === 'supported'
    && gap.result.assessment.metadata_suggestions.short_description.suggested_text === null, 'The unconfirmed price was lost or accepted into the public description.');
  const supportedDescription = run([seats[0]], false, 'not_assessable', { description: seating[0] });
  expect(supportedDescription.result.assessment.metadata_suggestions.short_description.suggested_text === seating[0],
    'A broad gap quote withheld the separately supported seats sentence.');
  const crossRule = run([seats[0]], false, 'no_potential_conflict_observed', { description: seating[0], secondSourceGap: true });
  expect(crossRule.result.assessment.policy_assessments.find(rule => rule.rule_id === secondSourceId).status === 'not_assessable'
    && crossRule.result.claim_checks[0].status === 'supported'
    && crossRule.result.assessment.metadata_suggestions.short_description.suggested_text === null,
    'Support under one rule cleared an unresolved requirement under another rule.');
  const badQuote = run([seats[0], { ...conflict, sources: [{ ...conflict.sources[0], quote: 'The screening starts at 8 p.m.' }] }], false, 'no_potential_conflict_observed');
  expect(sourceRule(badQuote).status === 'not_assessable' && badQuote.result.claim_checks[0].status === 'supported'
    && badQuote.result.checks.issues.some(issue => issue.code === 'SOURCE_QUOTE_MISMATCH'), 'A bad quote erased valid support or cleared the rule.');
  expect(badQuote.result.checks.overview_available && badQuote.result.assessment.status === 'partial', 'The partial review lost its useful overview.');
  const history = action(getState, {}, { story: saved.body.story_id });
  const reopened = history.body.runs.find(review => review.id === mixed.id);
  expect(reopened.request.sources[1].http_status === 404 && reopened.request.input.source_material[0].final_url === openedUrl
    && reopened.result.decision_check.skipped_claim_ids[0] === 'claim-13', 'Saved retrieval and confidence coverage did not reopen.');
  return 'Passed saved-story review with injected reader and provider: redirect, 404, late conflict, omitted claim, bad quote, contradictory status, partial overview, metadata guard and saved Decision 1 limit.';
}
