import React, { useState } from 'react';
import { formats, kinds, localDateTime } from './presentation';
import { OriginalPolicy } from './PolicySetup';
import Sources, { hasSourceGaps } from './Sources';
import ClaimChecks from './ClaimChecks';

function Evidence({ references, run }) {
  if (!references?.length) return null;
  const input = run.request.input;
  return <div>{references.map((reference, index) => {
    const revision = [input.baseline_revision, input.candidate_revision].find(item => item?.revision_id === reference.revision_id);
    const source = revision?.segments.find(item => item.segment_id === reference.segment_id);
    return <details className="evidence" key={index}>
      <summary>{reference.revision_id === input.candidate_revision.revision_id ? 'Current passage' : 'Earlier passage'}</summary>
      <blockquote>{reference.quote}</blockquote>
      {source && <p className="source-context">{source.text}</p>}
    </details>;
  })}</div>;
}

function Metadata({ run, taxonomy, disabled, onSave }) {
  const suggestions = run.result.assessment.metadata_suggestions;
  const label = (items, id) => items.find(item => item.id === id)?.label || '';
  const [choice, setChoice] = useState({
    section: run.metadata?.section ?? label(taxonomy.sections, suggestions.section.suggested_id),
    tags: run.metadata?.tags.join(', ') ?? suggestions.tags.suggested_ids.map(id => label(taxonomy.tags, id)).join(', '),
    description: run.metadata?.description ?? suggestions.short_description.suggested_text ?? '',
  });
  function update(field, value) {
    setChoice(current => ({ ...current, [field]: value }));
  }
  return <section className="card">
    <h3>Publishing details</h3>
    <label>Section<input disabled={disabled} value={choice.section} maxLength={160} onChange={event => update('section', event.target.value)} /></label>
    <label>Tags <span className="hint">Up to five, separated by commas</span>
      <input disabled={disabled} value={choice.tags} onChange={event => update('tags', event.target.value)} />
    </label>
    <label>Description<textarea disabled={disabled} className="description" maxLength={240} value={choice.description}
      onChange={event => update('description', event.target.value)} /></label>
    {!suggestions.short_description.suggested_text && <p className="hint">No description is ready. You can write your own.</p>}
    <button disabled={disabled} onClick={() => onSave({
      ...choice, tags: choice.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    })}>Save my choices</button>
    {run.metadata && <p className="hint">Your choices were saved with this review.</p>}
    <details><summary>Original AI suggestions</summary>
      <p>{label(taxonomy.sections, suggestions.section.suggested_id) || 'No section suggested'}</p>
      <p>{suggestions.tags.suggested_ids.map(id => label(taxonomy.tags, id)).join(', ') || 'No tags suggested'}</p>
      <p>{suggestions.short_description.suggested_text || 'No public description suggested'}</p>
    </details>
  </section>;
}

const ruleStatuses = {
  potential_conflict: 'Potential conflict',
  no_potential_conflict_observed: 'No issue found',
  not_assessable: 'Needs confirmation',
  not_applicable: 'Not applicable',
};

export function reviewStatus(run) {
  if (run.state === 'running') return 'In progress';
  if (run.state !== 'complete') return 'Retry needed';
  const status = run.result?.assessment?.status;
  if (status === 'partial' || hasSourceGaps(run)) return 'Some checks incomplete';
  if (status === 'unable_to_assess') return 'Needs confirmation';
  return 'Reviewed';
}

const checkMessages = {
  QUOTE_MISMATCH: 'The quoted words don’t match your saved draft. Compare the two passages below, then retry or check this part yourself.',
  SOURCE_QUOTE_MISMATCH: 'The quoted words don’t match the saved source. Compare the passages below before relying on this claim check.',
  MISSING_EVIDENCE: 'Suiko didn’t give a passage to support this part of the review. Check it yourself or retry.',
  INTERNAL_METADATA_SOURCE: 'This publishing suggestion used your private notes. It was left out of the public copy.',
  UNKNOWN_FINDING_RULE: 'A concern used a rule your team hasn’t supplied. It was left out.',
  FINDING_OUTSIDE_SCOPE: 'This concern was left out because the rule doesn’t apply to this type of story.',
  RULE_SCOPE_MISMATCH: 'This rule doesn’t apply to this type of story. It wasn’t used.',
  INVALID_CONCERN_PASSAGE: 'Suiko couldn’t clearly point to the words that need attention. Read the surrounding passage before deciding.',
  UNMATCHED_SOURCE_FINDING: 'This source concern is missing a matching claim check. Compare the story and source yourself.',
  CONTRADICTORY_RULE_STATUS: 'The review said this rule was clear but also raised a concern. The concern is still shown for you to inspect.',
  MISSING_FINDING: 'The review raised a concern but didn’t explain it clearly enough. Check this rule yourself or retry.',
  UNREQUESTED_COMPARISON: 'This is the first saved version, so a comparison with an earlier draft was left out.',
  INVALID_CHANGE_SIDES: 'The change label didn’t fit the quoted edit. This summary was left out; use the exact text edits below.',
  CHANGE_NOT_IN_SAVED_EDITS: 'This summary didn’t match the saved edit. It was left out; use the exact text edits below.',
  UNSUMMARIZED_EDIT: 'Some edits are missing from the summary. Open the exact text edits to see them.',
  UNKNOWN_METADATA_VALUE: 'This suggestion used a section or tag your team doesn’t offer. Choose your own publishing details below.',
  DESCRIPTION_NEEDS_CONFIRMATION: 'The suggested description used a passage that still needs checking. It was left out of the public copy.',
  MISSING_CLAIM_CHECKS: 'The source check didn’t return usable results for individual claims. Check the source passages yourself or retry.',
  UNKNOWN_CLAIM_RULE: 'A source check used a rule that doesn’t apply here. That check was left out.',
  CONFLICTING_CLAIM_CHECKS: 'Suiko gave different answers about the same claim. Compare the claim with its source before deciding.',
  INVALID_CONTEXT_REFERENCE: 'The review pointed to a note that couldn’t be matched. Check your saved notes yourself or retry.',
  MISSING_SOURCE_EVIDENCE: 'This claim check is missing a matching source passage. The claim is still shown for you to inspect.',
};

function ReviewChecks({ result, run }) {
  const issues = result.checks?.issues || [];
  const notes = result.checks?.notes || [];
  if (!issues.length && !notes.length) return null;
  return <details className="card review-checks"><summary>What could not be checked</summary>
    {!!notes.length && <p>Some parts of the reply couldn’t be checked against the saved story. Use the available results and check the gaps yourself, or retry this version.</p>}
    {result.checks?.withheld_overview && <details><summary>Overview suggestion we couldn’t check</summary>
      <p>{result.checks.withheld_overview}</p></details>}
    {issues.map((issue, index) => {
      const revision = [run.request.input.candidate_revision, run.request.input.baseline_revision]
        .find(item => item?.revision_id === issue.revision_id);
      const passage = revision?.segments.find(item => item.segment_id === issue.segment_id);
      const ruleIndex = /^\/assessment\/policy_assessments\/(\d+)(?:\/|$)/.exec(issue.path || '')?.[1];
      const ruleId = issue.rule_id || (ruleIndex !== undefined ? result.assessment?.policy_assessments?.[Number(ruleIndex)]?.rule_id : null);
      const ruleTitle = ruleId && run.request.rules?.find(rule => rule.rule_id === ruleId)?.title;
      const path = issue.path || '';
      const section = path.startsWith('/overview') ? 'Overview'
        : path.startsWith('/findings') ? 'Finding'
        : path.startsWith('/assessment/changes') ? 'Changes'
        : path.startsWith('/claim_checks') ? 'Source check'
        : path.startsWith('/assessment/metadata_suggestions/short_description') ? 'Description'
        : path.startsWith('/assessment/metadata_suggestions/tags') ? 'Tags'
        : path.startsWith('/assessment/metadata_suggestions/section') ? 'Section'
        : path.startsWith('/assessment/metadata_suggestions') ? 'Publishing details'
        : ruleIndex !== undefined ? 'Rule check' : 'Review';
      return <article className="change" key={index}>
        <h4>{ruleTitle ? `${section}: ${ruleTitle}` : section}</h4><p>{checkMessages[issue.code] || 'Suiko couldn’t use this part of the reply. Check it yourself or retry this version. The available results are still shown.'}</p>
        {typeof issue.rejected_suggestion === 'string' && <><h4>Suggestion left out</h4><blockquote>{issue.rejected_suggestion}</blockquote></>}
        {typeof issue.quote === 'string' && <><h4>Words quoted by the review</h4><blockquote>{issue.quote}</blockquote></>}
        {(passage || typeof issue.source === 'string') && <><h4>Your saved passage</h4><blockquote>{passage?.text || issue.source}</blockquote></>}
      </article>;
    })}
  </details>;
}

export function ReviewResult({ run, taxonomy, latest, busy, onMetadata, canManageRules }) {
  if (!run) return <section className="card empty"><h2>Ready when you are</h2><p>Save your draft, then choose Review this version.</p></section>;
  if (run.state === 'running') return <section className="card"><h2>Review in progress</h2><p>Suiko is checking your saved draft.</p></section>;
  if (run.state !== 'complete') return <><section className="card failure">
    <h2>The review couldn’t finish</h2><p>Your draft is saved. Choose Review this version to try again.</p>
    <TechnicalDetails run={run} />
  </section><Sources sources={run.request?.sources} /></>;
  const result = run.result;
  const unresolved = result.assessment.policy_assessments.filter(rule => rule.status === 'not_assessable');
  const claimChecks = result.claim_checks || [];
  const sourceRules = run.request.input.source_rule_ids || [];
  const claimConcerns = claimChecks.some(check => {
    const second = result.decision_check?.answers?.[check.id];
    return check.status === 'contradicted' || check.status === 'insufficient'
      || (second && (second.status !== check.status || ['contradicted', 'insufficient'].includes(second.status)));
  });
  const hasDiagnostics = result.checks?.issues?.length || result.checks?.notes?.length;
  const sourceGaps = hasSourceGaps(run);
  const baseline = run.request.input.baseline_revision;
  const candidate = run.request.input.candidate_revision;
  const settingChanges = baseline ? [
    { field: 'content_format', label: 'Format', values: formats },
    { field: 'content_kind', label: 'Type of story', values: kinds },
  ].filter(({ field }) => baseline[field] !== candidate[field]) : [];
  const missingSections = [];
  if (result.assessment.coverage.revision_comparison === 'incomplete') missingSections.push('revision comparison');
  if (result.assessment.coverage.metadata_suggestions === 'incomplete') missingSections.push('publishing suggestions');
  return <>
    {!latest && <p className="notice">This review is for an earlier version. Publishing details can only be saved from a review of the current version.</p>}
    {run.rules_current === false && <p className="notice">Rules have changed. Review this version again to use today’s rules.</p>}
    {(result.assessment.status !== 'reviewed' || sourceGaps) && <section className="notice" role="status">
      <strong>{result.assessment.status === 'unable_to_assess' ? 'Suiko couldn’t finish these checks.' : 'Some checks need a closer look.'}</strong>
      {!!missingSections.length && <p>Suiko couldn’t finish {missingSections.join(' and ')}. You can review the available results below.</p>}
      {sourceGaps && <p>Some links couldn’t be read in full. Open <a href="#review-sources">Sources used</a> to see which ones.</p>}
      {!hasDiagnostics && !unresolved.length && !missingSections.length && !sourceGaps && !claimConcerns && <p>{result.assessment.limitations.length
        ? 'Open “Rules used” for what Suiko could check.'
        : 'Try reviewing this version again.'}</p>}
    </section>}
    <section className="card overview"><h2>Overview</h2>
      <p>{result.checks?.overview_available === false
        ? 'Suiko couldn’t check the overview against your draft. You can still use the results below.'
        : result.overview}</p>
      <Evidence references={result.overview_evidence} run={run} />
    </section>
    <section className="card"><h3>Needs attention</h3>
      {result.findings.length === 0 && unresolved.length === 0 && !claimConcerns && <p>{result.assessment.policy_assessments.length
        ? (result.assessment.status === 'reviewed' && !sourceGaps ? 'No concerns found in the completed checks.' : 'See the incomplete checks below.')
        : 'No active rules were used for this review.'}</p>}
      {claimConcerns && <p><a href="#claim-checks">Compare the claims with their sources</a> to see what needs attention.</p>}
      {result.findings.map((finding, index) => {
        const rule = run.request.rules.find(item => item.rule_id === finding.rule_id);
        const outcome = result.assessment.policy_assessments.find(item => item.rule_id === finding.rule_id);
        return <article className="finding" key={index}><h4>{finding.summary}</h4><p>{finding.action}</p>
          <p className="rule-status">{ruleStatuses[outcome?.status] || 'Needs confirmation'}</p>
          {rule?.title && <p className="hint">{rule.title}</p>}
          <Evidence references={finding.evidence} run={run} />
        </article>;
      })}
      {unresolved.filter(rule => !result.findings.some(finding => finding.rule_id === rule.rule_id)).map(rule =>
        <article className="finding" key={rule.rule_id}>
          <h4>{run.request.rules.find(item => item.rule_id === rule.rule_id)?.title || 'Editorial check'}</h4>
          <p className="rule-status">Needs confirmation</p><p>{rule.reason}</p>
          {rule.suggested_action && <p>{rule.suggested_action}</p>}
          <Evidence references={rule.evidence} run={run} />
        </article>)}
    </section>
    <ClaimChecks run={run} />
    <ReviewChecks result={result} run={run} />
    <Sources sources={run.request.sources} />
    <section className="card"><h3>What changed</h3>
      {settingChanges.map(({ field, label, values }) => <p key={field}>{`${label} changed: ${values[baseline[field]] || 'Not set'} → ${values[candidate[field]] || 'Not set'}.`}</p>)}
      {!!settingChanges.length && <p className="hint">These choices affect which rules apply to this version.</p>}
      {!run.request.input.baseline_revision && <p>This is the first submitted version of this story.</p>}
      {run.request.input.baseline_revision && !result.assessment.changes.length && <p>{result.assessment.coverage.revision_comparison === 'incomplete'
        ? 'The revision comparison could not be fully checked. Open the saved edits below or retry.'
        : run.request.literal_edits?.changes.length === 0 ? 'The saved text is unchanged.' : 'No meaningful changes were reported.'}</p>}
      {result.assessment.changes.map(change => <article className="change" key={change.change_id}>
        <h4>{change.summary}</h4><p className="hint">{{ added: 'Added', removed: 'Removed', modified: 'Edited' }[change.kind] || 'Edited'}</p>
        <Evidence references={[...change.before, ...change.after]} run={run} />
      </article>)}
      {!!run.request.literal_edits?.changes.length && <details><summary>See exact text edits</summary>
        {run.request.literal_edits.limited && <p>Some edits are excerpts. Open the saved versions for the full text.</p>}
        {run.request.literal_edits.changes.map((edit, index) => <div key={index} className="change">
          <p className="hint">{edit.field.replaceAll('_', ' ')}</p>
          {edit.before && <p className="literal-edit"><strong>Before</strong> {edit.before}</p>}
          {edit.after && <p className="literal-edit"><strong>After</strong> {edit.after}</p>}
        </div>)}
      </details>}
    </section>
    <Metadata key={run.id + ':' + run.modified} run={run} taxonomy={taxonomy} disabled={busy || !latest} onSave={onMetadata} />
    <details className="card"><summary>Rules used</summary>
      {run.request.rules.filter(rule => rule.active).map(rule => {
        const outcome = result.assessment.policy_assessments.find(item => item.rule_id === rule.rule_id);
        return <article className="change" key={rule.rule_id}><h4>{rule.title} · version {rule.version}</h4>
          {outcome && <><p className="rule-status">{sourceRules.includes(rule.rule_id) && outcome.status === 'no_potential_conflict_observed'
            ? 'Support found for listed claims' : ruleStatuses[outcome.status]}</p><p>{outcome.reason}</p>
            <Evidence references={outcome.evidence} run={run} /></>}
          <details><summary>Rule wording used</summary><p>{rule.text || run.request.input.policy_pack.rules.find(item => item.rule_id === rule.rule_id)?.text}</p></details>
          {rule.origin?.kind === 'policy' && (canManageRules
            ? <OriginalPolicy key={rule.origin.policy_version_id} origin={rule.origin} />
            : <p className="hint">Based on company policy</p>)}
        </article>;
      })}
      {result.assessment.limitations.map((item, index) => <p key={index}>{item}</p>)}
    </details>
    <TechnicalDetails run={run} />
  </>;
}

function TechnicalDetails({ run }) {
  const saved = localDateTime(run.saved_at);
  return <details className="technical-details">
    <summary>Technical details</summary>
    {run.model && <p>Model {run.model}</p>}
    {saved && <p>Reviewed {saved}</p>}
    {run.request?.provider?.fallback_model && <p>Used a backup model when the first model was busy.</p>}
    {run.error?.message && <p>{run.error.message}</p>}
    <details><summary>Saved review data</summary><pre>{JSON.stringify({ request: run.request, result: run.result, error: run.error }, null, 2)}</pre></details>
  </details>;
}
