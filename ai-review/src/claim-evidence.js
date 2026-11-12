export function collectClaimChecks(request, raw, { report, references, shaped, scopes }) {
  const checks = [];
  const incomplete = new Set();
  const expected = new Set(request.source_rule_ids || []);
  if (!expected.size) return { checks, incomplete };
  if (!Array.isArray(raw) || raw.length > 24) {
    report('MISSING_CLAIM_CHECKS', '/claim_checks', 'Gemini did not return a usable list of individual source checks.');
    return { checks, incomplete: expected };
  }
  const seen = new Map();
  for (const [index, item] of raw.entries()) {
    const path = `/claim_checks/${index}`;
    const known = expected.has(item?.rule_id) && scopes[item.rule_id]?.applies === true;
    if (!known) {
      report('UNKNOWN_CLAIM_RULE', path, 'This source check did not name an applicable rule.');
      continue;
    }
    if (!shaped('validateWorkbenchClaim', item, path, 'This source check')
        || !references([item.claim], request.candidate_revision.revision_id, `${path}/claim`, true, true)) {
      incomplete.add(item.rule_id);
      continue;
    }
    const key = JSON.stringify([item.rule_id, item.claim.segment_id, item.claim.quote]);
    const duplicate = seen.get(key);
    if (duplicate) {
      if (duplicate.status !== item.status) {
        incomplete.add(item.rule_id);
        duplicate.status = 'insufficient';
        duplicate.reason = 'Gemini gave different answers for this claim.';
        duplicate.action = 'Compare the saved passages or retry this version.';
        report('CONFLICTING_CLAIM_CHECKS', path, 'Gemini returned conflicting answers for the same claim.');
      }
      continue;
    }
    const sources = [];
    for (const [sourceIndex, reference] of item.sources.entries()) {
      const source = request.source_material.find(source => source.source_id === reference.source_id);
      const passage = source?.passages.find(passage => passage.passage_id === reference.passage_id);
      if (!reference.quote.trim() || !passage?.text.includes(reference.quote)) {
        incomplete.add(item.rule_id);
        report('SOURCE_QUOTE_MISMATCH', `${path}/sources/${sourceIndex}`, 'A quoted source passage could not be matched to the saved text.', {
          quote: reference.quote, ...(passage ? { source: passage.text } : {}), rule_id: item.rule_id,
        });
      } else {
        sources.push(reference);
      }
    }
    const context = item.context.filter((reference, contextIndex) => {
      const valid = references([reference], request.candidate_revision.revision_id, `${path}/context/${contextIndex}`, true);
      const segment = request.candidate_revision.segments.find(segment => segment.segment_id === reference.segment_id);
      if (!valid || segment?.field !== 'production_notes') {
        incomplete.add(item.rule_id);
        if (valid) report('INVALID_CONTEXT_REFERENCE', path, 'Only supplied review context can be used as a context passage.');
        return false;
      }
      return true;
    });
    const check = { ...item, id: `claim-${index + 1}`, sources, context };
    if (['supported', 'contradicted'].includes(check.status)
        && ((!sources.length && !context.length) || sources.length !== item.sources.length || context.length !== item.context.length)) {
      incomplete.add(item.rule_id);
      check.status = 'insufficient';
      check.reason = 'The saved material does not include all the evidence Gemini used for this judgment.';
      check.action = 'Open the source or paste the relevant excerpt.';
      report('MISSING_SOURCE_EVIDENCE', path, 'The source judgment needs matching evidence. The claim remains visible.');
    }
    if (!check.action.trim() && ['insufficient', 'contradicted'].includes(check.status)) {
      check.action = 'Compare the saved passages and confirm this claim before using it.';
    }
    seen.set(key, check);
    checks.push(check);
  }
  return { checks, incomplete };
}

export function claimRuleOutcome(item, checks, incomplete) {
  const applicable = checks.filter(check => check.status !== 'not_applicable');
  const contradictions = applicable.filter(check => check.status === 'contradicted');
  const unresolved = applicable.filter(check => check.status === 'insufficient');
  const hasGap = incomplete || unresolved.length > 0;
  const summary = [
    `${applicable.filter(check => check.status === 'supported').length} supported`,
    `${contradictions.length} potential conflicts`,
    `${unresolved.length} need confirmation`,
    ...(incomplete ? ['some observations could not be checked'] : []),
  ].join(' · ');
  if (!applicable.length && !hasGap && (item.status === 'not_applicable' || checks.length)) {
    return { rule_id: item.rule_id, status: 'not_applicable', reason: 'The supplied story has no claim for this check.', evidence: [], suggested_action: null };
  }
  const status = contradictions.length ? 'potential_conflict' : hasGap || !applicable.length ? 'not_assessable' : 'no_potential_conflict_observed';
  const first = contradictions[0] || unresolved[0];
  return {
    rule_id: item.rule_id, status,
    reason: applicable.length ? summary : 'No usable individual source checks were returned for this rule.',
    evidence: applicable.slice(0, 6).map(check => check.claim),
    suggested_action: first ? first.action.slice(0, 500)
      : status === 'not_assessable' ? 'Check the source material manually or retry this saved version.' : null,
  };
}

export function overlapsPassage(revision, first, second) {
  if (first.segment_id !== second.segment_id) return false;
  const text = revision.segments.find(segment => segment.segment_id === first.segment_id)?.text;
  if (!text) return false;
  const ranges = quote => {
    const positions = [];
    for (let start = text.indexOf(quote); start >= 0; start = text.indexOf(quote, start + 1)) positions.push(start);
    return positions;
  };
  return ranges(first.quote).some(start => ranges(second.quote).some(other => start < other + second.quote.length && other < start + first.quote.length));
}
