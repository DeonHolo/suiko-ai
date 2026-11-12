export class ReviewValidationError extends Error {
  constructor(code, message, issues = []) {
    super(message);
    this.name = 'ReviewValidationError';
    this.code = code;
    this.issues = issues;
  }
}


const firstDraftLimitation = 'No baseline revision was supplied; revision comparison was not performed.';

export function validateReviewInput(request, validator) {
  if (!validator(request)) {
    throw new ReviewValidationError('INVALID_REQUEST', 'The request does not match the review contract.',
      (validator.errors || []).map(error => ({ path: error.instancePath || '/', message: error.message })));
  }
  const unique = values => new Set(values).size === values.length;
  const revisions = [request.baseline_revision, request.candidate_revision].filter(Boolean);
  if (!unique(revisions.map(revision => revision.revision_id))
      || !unique(request.policy_pack.rules.map(rule => rule.rule_id))
      || !unique(request.taxonomy.sections.map(section => section.id))
      || !unique(request.taxonomy.tags.map(tag => tag.id))) {
    throw new ReviewValidationError('INVALID_REQUEST', 'Revision, rule, and taxonomy identities must be unambiguous.');
  }
  for (const revision of revisions) {
    if (!unique(revision.segments.map(segment => segment.segment_id))
        || revision.segments.reduce((total, segment) => total + [...segment.text].length, 0) > 12000
        || !revision.segments.some(segment => segment.text.trim())) {
      throw new ReviewValidationError('INVALID_REQUEST', 'Each revision needs unique segments and readable text within the 12,000-character limit.');
    }
  }
}

function verifyEvidence(request, assessment) {
  const candidateId = request.candidate_revision.revision_id;
  const metadata = assessment.metadata_suggestions;
  const sources = new Map([request.baseline_revision, request.candidate_revision].filter(Boolean)
    .map(revision => [revision.revision_id, new Map(revision.segments.map(segment => [segment.segment_id, segment.text]))]));
  const groups = [
    ...assessment.changes.flatMap((change, index) => [
      { path: `/changes/${index}/before`, evidence: change.before, revisionId: request.baseline_revision?.revision_id },
      { path: `/changes/${index}/after`, evidence: change.after, revisionId: candidateId },
    ]),
    ...Object.entries(assessment.metadata_suggestions).map(([field, suggestion]) => ({
      path: `/metadata_suggestions/${field}/evidence`, evidence: suggestion.evidence, revisionId: candidateId,
      publicOnly: true,
      required: field === 'section' ? metadata.section.suggested_id !== null :
        field === 'tags' ? metadata.tags.suggested_ids.length > 0 : metadata.short_description.suggested_text !== null,
    })),
    ...assessment.policy_assessments.map((rule, index) => ({
      path: `/policy_assessments/${index}/evidence`, evidence: rule.evidence, revisionId: candidateId,
      required: rule.status === 'potential_conflict' || rule.status === 'no_potential_conflict_observed',
    })),
  ];

  for (const group of groups) {
    if (group.required && group.evidence.length === 0) {
      throw new ReviewValidationError('INVALID_EVIDENCE', 'An asserted observation or suggestion needs supporting candidate evidence.',
        [{ path: group.path, message: 'Supply evidence or use an explicitly unresolved/empty outcome.' }]);
    }
    group.evidence.forEach((reference, index) => {
      const text = sources.get(reference.revision_id)?.get(reference.segment_id);
      const field = request.candidate_revision.segments.find(segment => segment.segment_id === reference.segment_id)?.field;
      if (group.publicOnly && field && !['title', 'body', 'caption'].includes(field)) {
        throw new ReviewValidationError('INVALID_METADATA', 'Suggested public metadata needs evidence from the title, body, or caption.',
          [{ path: `${group.path}/${index}`, message: 'Choose a passage from the story text.' }]);
      }
      if (reference.revision_id !== group.revisionId || !reference.quote.trim() || text === undefined || !text.includes(reference.quote)) {
        throw new ReviewValidationError('INVALID_EVIDENCE', 'An evidence reference does not match its frozen source.',
          [{ path: `${group.path}/${index}`, message: 'Use an exact quotation from the identified revision and segment.' }]);
      }
    });
  }
}

function verifyChecklist(request, assessment) {
  const expected = new Set(request.policy_pack.rules.map(rule => rule.rule_id));
  const actual = assessment.policy_assessments.map(rule => rule.rule_id);
  if (actual.length !== expected.size || new Set(actual).size !== actual.length || actual.some(id => !expected.has(id))) {
    throw new ReviewValidationError('CHECKLIST_MISMATCH', 'The review must assess every supplied rule exactly once.',
      [{ path: '/policy_assessments', message: 'Missing, unknown, or duplicate rule identity.' }]);
  }
}

function verifyMetadata(request, assessment) {
  const allowedSections = new Set(request.taxonomy.sections.map(section => section.id));
  const allowedTags = new Set(request.taxonomy.tags.map(tag => tag.id));
  const { section, tags } = assessment.metadata_suggestions;
  if ((section.suggested_id !== null && !allowedSections.has(section.suggested_id)) ||
      tags.suggested_ids.some(id => !allowedTags.has(id))) {
    throw new ReviewValidationError('INVALID_METADATA', 'Metadata suggestions must use the supplied vocabulary.');
  }
}

function verifyChanges(request, assessment) {
  const changes = assessment.changes;
  if ((!request.baseline_revision && changes.length > 0) ||
      new Set(changes.map(change => change.change_id)).size !== changes.length) {
    throw new ReviewValidationError('INVALID_CHANGES', 'Changes need a baseline and unique change identities.');
  }
  for (const change of changes) {
    if ((change.before.length > 0) !== (change.kind !== 'added') ||
        (change.after.length > 0) !== (change.kind !== 'removed')) {
      throw new ReviewValidationError('INVALID_CHANGES', 'Change evidence must match its added, removed, or two-sided kind.');
    }
  }
}

function addLimitation(assessment, message) {
  if (assessment.limitations.includes(message)) return;
  if (assessment.limitations.length >= 12) {
    throw new ReviewValidationError('INVALID_ASSESSMENT', 'There is no room to disclose a required review limitation.');
  }
  assessment.limitations.push(message);
}

function resolveCoverage(request, assessment) {
  const hasBaseline = request.baseline_revision !== null;
  if ((hasBaseline && assessment.coverage.revision_comparison === 'not_requested') ||
      (!hasBaseline && assessment.coverage.revision_comparison !== 'not_requested')) {
    throw new ReviewValidationError('INVALID_COVERAGE', 'Comparison coverage must match whether a baseline was supplied.');
  }
  const unresolvedRules = assessment.policy_assessments.some(rule => rule.status === 'not_assessable');
  const incompleteAreas = Object.values(assessment.coverage).includes('incomplete');
  const materialLimitations = assessment.limitations.some(item => hasBaseline || item !== firstDraftLimitation);
  if (unresolvedRules || incompleteAreas || materialLimitations) {
    const metadata = assessment.metadata_suggestions;
    const hasUsableAnalysis = assessment.changes.length > 0 ||
      assessment.policy_assessments.some(rule => rule.status !== 'not_assessable') ||
      metadata.section.suggested_id !== null || metadata.tags.suggested_ids.length > 0 || metadata.short_description.suggested_text !== null;
    assessment.status = hasUsableAnalysis ? 'partial' : 'unable_to_assess';
    if (unresolvedRules) addLimitation(assessment, 'Some requested editorial checklist criteria could not be assessed.');
    if (incompleteAreas) addLimitation(assessment, 'Some requested analysis areas could not be fully assessed.');
  }
}


export function checkAssessmentEvidence(request, assessment) {
  verifyChecklist(request, assessment);
  verifyChanges(request, assessment);
  verifyMetadata(request, assessment);
  verifyEvidence(request, assessment);
  return assessment;
}

export function checkAssessment(request, assessment) {
  checkAssessmentEvidence(request, assessment);
  resolveCoverage(request, assessment);
  if (!request.baseline_revision) {
    addLimitation(assessment, firstDraftLimitation);
  }
  return assessment;
}
