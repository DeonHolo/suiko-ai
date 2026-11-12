import { checkAssessmentEvidence, ReviewValidationError, validateReviewInput } from './assessment-checks.js';
import { parseProviderJson } from './provider-json.js';
import { ruleApplicability } from './editorial-rules.js';
import { collectClaimChecks, claimRuleOutcome, overlapsPassage } from './claim-evidence.js';

const firstDraftNote = 'No baseline revision was supplied; revision comparison was not performed.';
const clone = value => JSON.parse(JSON.stringify(value));
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function freeze(value) {
  if (isObject(value) || Array.isArray(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export async function reviewWorkbench(request, provider, validators) {
  validateReviewInput(request, validators.validateRequest);
  const snapshot = freeze(clone(request));
  return checkWorkbenchResult(snapshot, parseProviderJson(await provider.generate(snapshot)), validators);
}

export function checkWorkbenchResult(request, raw, validators, { requireOverviewEvidence = false } = {}) {
  validateReviewInput(request, validators.validateRequest);
  if (!validators.validateWorkbenchShell(raw)) {
    throw new ReviewValidationError('INVALID_WORKBENCH_FORMAT', 'Gemini returned an incomplete review format. Your saved version is available for a retry.');
  }
  const original = raw.assessment;
  const expected = request.policy_pack.rules.map(rule => rule.rule_id);
  if (!Array.isArray(original.policy_assessments)
      || original.policy_assessments.length !== expected.length
      || new Set(original.policy_assessments.map(rule => rule?.rule_id)).size !== expected.length
      || original.policy_assessments.some(rule => !expected.includes(rule?.rule_id))) {
    throw new ReviewValidationError('CHECKLIST_MISMATCH', 'Gemini did not identify every supplied rule exactly once. The review needs a retry.');
  }

  const issues = [];
  const notes = [];
  const uncertainRules = new Set();
  const suspectSegments = new Set();
  function report(code, path, message, details = {}) {
    issues.push({ code, path, message, ...details });
  }
  function references(evidence, revisionId, path, required = false, publicOnly = false) {
    if (required && !evidence.length) {
      report('MISSING_EVIDENCE', path, 'Gemini supplied no supporting passage for this observation.');
      return false;
    }
    let valid = true;
    evidence.forEach((reference, index) => {
      const revision = [request.candidate_revision, request.baseline_revision]
        .find(item => item?.revision_id === reference.revision_id);
      const source = revision?.segments.find(item => item.segment_id === reference.segment_id);
      if (reference.revision_id !== revisionId || !reference.quote.trim() || !source?.text.includes(reference.quote)) {
        report('QUOTE_MISMATCH', `${path}/${index}`, 'Gemini\'s quote does not match the identified saved passage.', {
          quote: reference.quote.slice(0, 1000),
          ...(source ? { source: source.text.slice(0, 1600) } : {}),
          revision_id: reference.revision_id, segment_id: reference.segment_id,
        });
        valid = false;
      } else if (publicOnly && !['title', 'body', 'caption'].includes(source.field)) {
        report('INTERNAL_METADATA_SOURCE', `${path}/${index}`, 'A public metadata suggestion used internal context instead of story text.');
        valid = false;
      }
    });
    return valid;
  }
  function shaped(name, value, path, label) {
    if (validators[name](value)) return true;
    const missing = isObject(value) && Array.isArray(value.evidence) && value.evidence.length === 0;
    report(missing ? 'MISSING_EVIDENCE' : 'INVALID_OBSERVATION', path,
      missing ? `${label} has no supporting passage.` : `${label} has missing or invalid fields and was not used.`);
    return false;
  }
  function list(value, max, path) {
    if (Array.isArray(value) && value.length <= max) return value;
    report('INVALID_SECTION', path, 'This section was not returned as a usable list.');
    return [];
  }

  const currentId = request.candidate_revision.revision_id;
  const scopes = Object.fromEntries(request.policy_pack.rules.filter(rule => rule.applicability)
    .map(rule => [rule.rule_id, ruleApplicability(rule.applicability, request.candidate_revision)]));
  const sourceRuleIds = request.source_rule_ids || [];
  const { checks: claimChecks, incomplete: incompleteClaims } = collectClaimChecks(request, raw.claim_checks, { report, references, shaped, scopes });
  const findings = [];
  const rawFindings = list(raw.findings, 24, '/findings');
  if (!Array.isArray(raw.findings) || raw.findings.length > 24) expected.forEach(id => uncertainRules.add(id));
  rawFindings.forEach((finding, index) => {
    const path = `/findings/${index}`;
    const knownRule = expected.includes(finding?.rule_id);
    if (!knownRule) {
      report('UNKNOWN_FINDING_RULE', path, 'A finding named a rule that was not supplied. It was excluded.');
      expected.forEach(id => uncertainRules.add(id));
      for (const reference of Array.isArray(finding?.evidence) ? finding.evidence : []) {
        if (reference?.revision_id === currentId) suspectSegments.add(reference.segment_id);
      }
      return;
    }
    if (scopes[finding.rule_id]?.applies === false) {
      report('FINDING_OUTSIDE_SCOPE', path, 'This finding was excluded because the saved rule does not apply to this format and content kind.', { rule_id: finding.rule_id });
      return;
    }
    if (sourceRuleIds.includes(finding.rule_id)) return;
    if (shaped('validateWorkbenchFinding', finding, path, 'This finding')
        && references(finding.evidence, currentId, `${path}/evidence`, true)) {
      const checked = clone(finding);
      if (checked.concern_evidence && (!references(checked.concern_evidence, currentId, `${path}/concern_evidence`, false, true)
          || checked.concern_evidence.some(reference => !checked.evidence.some(item => item.segment_id === reference.segment_id && item.quote.includes(reference.quote))))) {
        report('INVALID_CONCERN_PASSAGE', path, 'The passage marked as the concern could not be separated from its supporting context.');
        delete checked.concern_evidence;
      }
      findings.push(checked);
    } else {
      uncertainRules.add(finding.rule_id);
      for (const reference of Array.isArray(finding.evidence) ? finding.evidence : []) {
        if (reference?.revision_id === currentId) suspectSegments.add(reference.segment_id);
      }
    }
  });

  const policies = original.policy_assessments.map((item, index) => {
    const path = `/assessment/policy_assessments/${index}`;
    if (scopes[item.rule_id]?.applies === false) {
      if (item.status !== 'not_applicable') report('RULE_SCOPE_MISMATCH', path, 'The saved format and content kind place this rule outside the review scope.', { rule_id: item.rule_id });
      return { rule_id: item.rule_id, status: 'not_applicable', reason: scopes[item.rule_id].reason, evidence: [], suggested_action: null };
    }
    if (sourceRuleIds.includes(item.rule_id)) {
      return claimRuleOutcome(item, claimChecks.filter(check => check.rule_id === item.rule_id), incompleteClaims.has(item.rule_id));
    }
    const related = findings.filter(finding => finding.rule_id === item.rule_id);
    const shapedRule = shaped('validateWorkbenchPolicy', item, path, 'This rule assessment');
    let rule = shapedRule ? clone(item) : {
      rule_id: item.rule_id, status: 'not_assessable', evidence: [],
      reason: 'The reply did not provide a usable assessment for this rule.',
      suggested_action: 'Review this rule manually or retry this saved version.',
    };
    if (!shapedRule) uncertainRules.add(item.rule_id);
    if (shapedRule && !references(rule.evidence, currentId, `${path}/evidence`,
      ['potential_conflict', 'no_potential_conflict_observed'].includes(rule.status))) {
      rule.evidence = [];
      uncertainRules.add(item.rule_id);
    }
    if (related.length && ['no_potential_conflict_observed', 'not_applicable'].includes(rule.status)) {
      report('CONTRADICTORY_RULE_STATUS', `${path}/status`, 'Gemini marked this rule clear or inapplicable while listing concerns. The retained findings need review.', { rule_id: item.rule_id });
      rule.status = 'potential_conflict';
      rule.reason = 'The original rule summary contradicted the findings. Review the retained concerns below.';
      rule.evidence = related.flatMap(finding => finding.evidence).slice(0, 6);
      rule.suggested_action = related[0].action.slice(0, 500);
    }
    if (rule.status === 'potential_conflict' && !related.length) {
      report('MISSING_FINDING', path, 'Gemini raised a concern without a usable finding. This rule needs confirmation.', { rule_id: item.rule_id });
      uncertainRules.add(item.rule_id);
    }
    if (uncertainRules.has(item.rule_id)) {
      if (related.length) {
        rule.status = rule.status === 'not_assessable' ? 'not_assessable' : 'potential_conflict';
        rule.evidence = related.flatMap(finding => finding.evidence).slice(0, 6);
        rule.reason = 'Retained findings are shown, but part of this rule assessment could not be checked.';
      } else {
        rule.status = 'not_assessable';
        rule.reason = 'This rule could not be fully checked because supporting evidence or a usable finding was missing.';
        rule.suggested_action = 'Review this rule manually or retry this saved version.';
      }
    }
    return rule;
  });

  const coverage = {
    revision_comparison: request.baseline_revision ? 'complete' : 'not_requested',
    metadata_suggestions: 'complete',
  };
  if (validators.validateWorkbenchCoverage(original.coverage)
      && (request.baseline_revision ? original.coverage.revision_comparison !== 'not_requested'
        : original.coverage.revision_comparison === 'not_requested')) {
    Object.assign(coverage, original.coverage);
  } else {
    report('INVALID_COVERAGE', '/assessment/coverage', 'The comparison coverage did not match the saved input. Its completion could not be confirmed.');
    if (request.baseline_revision) coverage.revision_comparison = 'incomplete';
  }
  const changes = [];
  const changeIds = new Set();
  const rawChanges = list(original.changes, 6, '/assessment/changes');
  if (!Array.isArray(original.changes) || original.changes.length > 6) {
    if (request.baseline_revision) coverage.revision_comparison = 'incomplete';
  }
  rawChanges.forEach((change, index) => {
    const path = `/assessment/changes/${index}`;
    if (!request.baseline_revision || !shaped('validateWorkbenchChange', change, path, 'This change')) {
      if (!request.baseline_revision) report('UNREQUESTED_COMPARISON', path, 'This is a first submission; an invented comparison was excluded.');
      else coverage.revision_comparison = 'incomplete';
      return;
    }
    if (changeIds.has(change.change_id)
        || (change.before.length > 0) !== (change.kind !== 'added')
        || (change.after.length > 0) !== (change.kind !== 'removed')) {
      report('INVALID_CHANGE_SIDES', path, 'This change has a duplicate identity or quotes that do not fit its added, removed or edited label.');
      coverage.revision_comparison = 'incomplete';
      return;
    }
    changeIds.add(change.change_id);
    if (references(change.before, request.baseline_revision.revision_id, `${path}/before`)
        && references(change.after, currentId, `${path}/after`)) changes.push(clone(change));
    else coverage.revision_comparison = 'incomplete';
  });

  const empty = {
    section: { suggested_id: null, reason: 'No checked section suggestion is available.', evidence: [] },
    tags: { suggested_ids: [], reason: 'No checked tag suggestions are available.', evidence: [] },
    short_description: { suggested_text: null, reason: 'No checked description is available.', evidence: [] },
  };
  const metadata = clone(empty);
  const names = { section: 'validateWorkbenchSection', tags: 'validateWorkbenchTags', short_description: 'validateWorkbenchDescription' };
  for (const [field, validator] of Object.entries(names)) {
    const suggestion = original.metadata_suggestions?.[field];
    const path = `/assessment/metadata_suggestions/${field}`;
    if (!shaped(validator, suggestion, path, 'This metadata suggestion')) {
      coverage.metadata_suggestions = 'incomplete';
      continue;
    }
    const populated = field === 'tags' ? suggestion.suggested_ids.length > 0
      : field === 'section' ? suggestion.suggested_id !== null : suggestion.suggested_text !== null;
    const ids = field === 'tags' ? suggestion.suggested_ids : field === 'section' && populated ? [suggestion.suggested_id] : [];
    const vocabulary = field === 'tags' ? request.taxonomy.tags : request.taxonomy.sections;
    if (ids.some(id => !vocabulary.some(option => option.id === id))) {
      report('UNKNOWN_METADATA_VALUE', path, 'This suggestion used a section or tag outside the supplied vocabulary.');
      coverage.metadata_suggestions = 'incomplete';
      continue;
    }
    if (!references(suggestion.evidence, currentId, `${path}/evidence`, populated, true)) {
      coverage.metadata_suggestions = 'incomplete';
      continue;
    }
    const concernEvidence = request.schema_version === '0.5.0'
      ? claimChecks.filter(check => ['contradicted', 'insufficient'].includes(check.status)).map(check => check.claim)
        .concat(findings.flatMap(finding => finding.concern_evidence ?? finding.evidence))
        .concat(policies.filter(rule => ['potential_conflict', 'not_assessable'].includes(rule.status)
          && !sourceRuleIds.includes(rule.rule_id) && !findings.some(finding => finding.rule_id === rule.rule_id)).flatMap(rule => rule.evidence))
      : policies.filter(rule => ['potential_conflict', 'not_assessable'].includes(rule.status))
        .flatMap(rule => rule.evidence).concat(findings.flatMap(finding => finding.evidence));
    const overlapsConcern = field === 'short_description' && populated && suggestion.evidence.some(reference =>
      suspectSegments.has(reference.segment_id) || concernEvidence.some(concern => concern.segment_id === reference.segment_id
        && (request.schema_version === '0.5.0' ? overlapsPassage(request.candidate_revision, concern, reference)
          : concern.quote.includes(reference.quote) || reference.quote.includes(concern.quote))));
    if (overlapsConcern) {
      report('DESCRIPTION_NEEDS_CONFIRMATION', path, 'The suggested public description relies on a passage that needs editorial confirmation. It was withheld.', {
        rejected_suggestion: suggestion.suggested_text,
      });
      coverage.metadata_suggestions = 'incomplete';
      continue;
    }
    metadata[field] = clone(suggestion);
  }
  if (!isObject(original.metadata_suggestions)
      || Object.keys(original.metadata_suggestions).some(key => !Object.prototype.hasOwnProperty.call(empty, key))) {
    report('INVALID_METADATA_SECTION', '/assessment/metadata_suggestions', 'The metadata section had unexpected fields; only independently checked suggestions were kept.');
    coverage.metadata_suggestions = 'incomplete';
  }

  let limitations = [];
  if (!['reviewed', 'partial', 'unable_to_assess'].includes(original.status)) {
    report('INVALID_ASSESSMENT_STATUS', '/assessment/status', 'Gemini returned an unsupported review status. Only independently checked results were kept.');
  }
  if (Array.isArray(original.limitations) && original.limitations.length <= 12
      && original.limitations.every(note => typeof note === 'string' && note.trim() && [...note].length <= 500)) {
    limitations = [...original.limitations];
  } else report('INVALID_LIMITATIONS', '/assessment/limitations', 'The review limitations were incomplete or unusable.');
  const notice = text => {
    if (!limitations.includes(text)) (limitations.length < 12 ? limitations : notes).push(text);
  };
  if (!request.baseline_revision) notice(firstDraftNote);
  if (issues.length) notice('Some observations could not be checked. The retained sections and remaining gaps are shown separately.');
  const unresolved = policies.some(rule => rule.status === 'not_assessable');
  const unresolvedClaims = incompleteClaims.size > 0 || claimChecks.some(check => check.status === 'insufficient');
  if (unresolved) notice('Some requested editorial checklist criteria could not be assessed.');
  if (unresolvedClaims) notice('Some claims need source confirmation.');
  const overviewValid = validators.validateWorkbenchOverview(raw.overview);
  if (!overviewValid) report('INVALID_OVERVIEW', '/overview', 'Gemini did not supply a usable internal overview.');
  let overviewEvidence = [];
  let independentOverview = false;
  if (requireOverviewEvidence && raw.overview_evidence === undefined) {
    report('MISSING_EVIDENCE', '/overview_evidence', 'Gemini supplied no supporting passage for the overview.');
  }
  if (raw.overview_evidence !== undefined) {
    if (shaped('validateWorkbenchOverviewEvidence', raw.overview_evidence, '/overview_evidence', 'The overview evidence')
        && references(raw.overview_evidence, currentId, '/overview_evidence', true, true)) {
      overviewEvidence = clone(raw.overview_evidence);
      // An internal overview may describe a retained concern. Unlike public
      // metadata, it need not avoid every flagged passage. Exclude material
      // affected by a rejected observation rather than valid concerns.
      independentOverview = !overviewEvidence.some(reference => suspectSegments.has(reference.segment_id));
    }
  }
  const overviewAvailable = overviewValid && (issues.length === 0 || independentOverview);
  if (!overviewAvailable) notes.push('The AI overview was withheld because part of the reply could not be checked.');
  const incomplete = issues.length > 0 || unresolved || unresolvedClaims || Object.values(coverage).includes('incomplete')
    || limitations.some(note => request.baseline_revision || note !== firstDraftNote)
    || original.status !== 'reviewed';
  const usable = findings.length > 0 || claimChecks.length > 0 || changes.length > 0 || policies.some(rule => rule.status !== 'not_assessable')
    || metadata.section.suggested_id !== null || metadata.tags.suggested_ids.length > 0
    || metadata.short_description.suggested_text !== null || overviewAvailable;
  const assessment = {
    status: incomplete ? (usable ? 'partial' : 'unable_to_assess') : 'reviewed',
    coverage, changes, metadata_suggestions: metadata, policy_assessments: policies, limitations,
  };
  checkAssessmentEvidence(request, assessment);
  const result = {
    overview: overviewAvailable ? raw.overview : 'The AI overview is unavailable for this attempt.',
    overview_evidence: overviewAvailable ? overviewEvidence : [], assessment, findings,
    ...(request.schema_version === '0.5.0' ? { claim_checks: claimChecks } : {}),
  };
  if (!validators.validateReview(result)) {
    throw new ReviewValidationError('INVALID_CHECKED_RESULT', 'The usable parts of this review could not be prepared safely. Your saved draft is available for a retry.');
  }
  return { ...result, checks: {
    overview_available: overviewAvailable, issues, notes,
    ...(!overviewAvailable && overviewValid ? { withheld_overview: raw.overview } : {}),
  } };
}
