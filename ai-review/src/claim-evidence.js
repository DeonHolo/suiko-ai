// A passage can name the right subject and still leave the claim unanswered.
function evidenceForVerdict(sources, status, requireStance) {
  const related = sources.filter(ref => ref.subject_scope === 'same_subject');
  if (!related.length) return { code: 'SOURCE_SUBJECT_UNCONFIRMED', reason: 'The cited passages could not be tied to the subject of this claim.',
    action: 'Find a passage about the same project or event and compare it with the draft.' };
  if (!requireStance && !related.some(ref => ref.stance !== undefined)) return { decisive: related };
  const stance = status === 'contradicted' ? 'contradicts' : 'supports';
  const decisive = related.filter(ref => ref.stance === stance);
  if (status === 'supported' && related.some(ref => ref.stance === 'contradicts')) {
    return { code: 'SOURCE_STANCE_UNCONFIRMED', reason: 'A cited passage about this subject conflicts with the draft.',
      action: 'Compare the accounts and confirm which fact belongs in the draft.' };
  }
  if (decisive.length) return { decisive };
  return { code: 'SOURCE_STANCE_UNCONFIRMED', reason: 'The cited passages about this subject do not establish the proposed judgment.',
    action: 'Compare the draft fact with a passage that directly addresses it.' };
}

export function collectClaimChecks(request, raw, { report, references, shaped, scopes, requireSourceScope, requireSourceStance }) {
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
    let sourceGap;
    if (['supported', 'contradicted'].includes(check.status)
        && ((!sources.length && !context.length) || sources.length !== item.sources.length || context.length !== item.context.length)) {
      incomplete.add(item.rule_id);
      check.status = 'insufficient';
      check.reason = 'The saved material does not include all the evidence Gemini used for this judgment.';
      check.action = 'Open the source or paste the relevant excerpt.';
      report('MISSING_SOURCE_EVIDENCE', path, 'The source judgment needs matching evidence. The claim remains visible.');
    } else if (['supported', 'contradicted'].includes(check.status) && sources.length
        && (requireSourceScope || sources.some(ref => ref.subject_scope !== undefined))) {
      const comparison = evidenceForVerdict(sources, check.status, requireSourceStance);
      if (comparison.decisive) {
        check.sources = comparison.decisive;
        if (check.sources.length !== sources.length) check.other_cited_sources = sources.filter(ref => !check.sources.includes(ref));
      } else {
        sourceGap = comparison.code;
        check.status = 'insufficient';
        check.reason = comparison.reason;
        check.action = comparison.action;
      }
    }
    if (!check.action.trim() && ['insufficient', 'contradicted'].includes(check.status)) {
      check.action = 'Compare the saved passages and confirm this claim before using it.';
    }
    const key = JSON.stringify([item.rule_id, item.claim.segment_id, item.claim.quote]);
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push({ check, rawStatus: item.status, path, sourceGap });
  }
  for (const entries of seen.values()) {
    const { check, path, sourceGap } = entries.length === 1 ? entries[0] : reconcileDuplicateClaims(entries);
    if (sourceGap) {
      incomplete.add(check.rule_id);
      report(sourceGap, path, check.reason, { rule_id: check.rule_id });
    }
    checks.push(check);
  }
  return { checks, incomplete };
}

function uniqueCitations(references) {
  const byPassage = new Map();
  for (const ref of references) {
    if (!ref) continue;
    const key = JSON.stringify([ref.source_id, ref.passage_id, ref.quote, ref.subject_scope, ref.stance]);
    if (!byPassage.has(key)) byPassage.set(key, ref);
  }
  return [...byPassage.values()];
}

function reconcileDuplicateClaims(entries) {
  const first = entries[0];
  const grounded = entries.find(entry => entry.check.status === entry.rawStatus) || first;
  const check = { ...grounded.check, id: first.check.id };
  const citations = uniqueCitations(entries.flatMap(entry => [...entry.check.sources, ...(entry.check.other_cited_sources || [])]));
  const sameSubject = citations.filter(ref => ref.subject_scope === 'same_subject');
  const opposing = sameSubject.find(ref => ref.stance === 'contradicts');
  let sourceGap = grounded.sourceGap;
  if (entries.some(entry => entry.rawStatus !== first.rawStatus)) {
    check.status = 'insufficient';
    check.reason = 'Gemini gave different answers for this claim.';
    check.action = 'Compare the saved passages or retry this version.';
    sourceGap = 'CONFLICTING_CLAIM_CHECKS';
  } else if (first.rawStatus === 'supported' && opposing) {
    check.status = 'insufficient';
    check.reason = 'A cited passage about this subject conflicts with the draft.';
    check.action = 'Compare the accounts and confirm which fact belongs in the draft.';
    sourceGap = 'SOURCE_STANCE_UNCONFIRMED';
  }
  if (sourceGap === 'CONFLICTING_CLAIM_CHECKS' || (sourceGap === 'SOURCE_STANCE_UNCONFIRMED' && opposing)) {
    // Show both sides even when the provider put each citation in a separate copy of the claim.
    const firstByVerdict = new Map();
    for (const entry of entries) {
      if (entry.check.sources.length && !firstByVerdict.has(entry.rawStatus)) firstByVerdict.set(entry.rawStatus, entry.check.sources[0]);
    }
    check.sources = uniqueCitations([opposing, sameSubject.find(ref => ref.stance === 'supports'), ...firstByVerdict.values(), ...citations]).slice(0, 3);
  }
  const primaryCount = check.sources.length;
  const extra = uniqueCitations([...check.sources, ...citations]).slice(primaryCount, primaryCount + 3);
  if (extra.length) check.other_cited_sources = extra;
  else delete check.other_cited_sources;
  return { check, path: grounded.path, sourceGap };
}

export function claimRuleOutcome(item, checks, incomplete, gapEvidence = []) {
  const applicable = checks.filter(check => check.status !== 'not_applicable');
  const contradictions = applicable.filter(check => check.status === 'contradicted');
  const unresolved = applicable.filter(check => check.status === 'insufficient');
  const supported = applicable.filter(check => check.status === 'supported');
  const hasGap = incomplete || unresolved.length > 0;
  const summary = [
    `${supported.length} supported`,
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
    reason: applicable.length ? `Returned claims: ${summary}. Review any claims missing from the list.` : 'No usable individual source checks were returned for this rule.',
    evidence: [...contradictions.map(check => check.claim), ...unresolved.map(check => check.claim),
      ...gapEvidence, ...supported.map(check => check.claim)].slice(0, 6),
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
