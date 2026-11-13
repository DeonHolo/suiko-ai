import React from 'react';

const labels = {
  supported: 'Support found', contradicted: 'Potential conflict',
  insufficient: 'Needs confirmation', not_applicable: 'Not applicable',
};
const percent = value => value >= 0.995 && value < 1 ? '99+%' : Math.round(value * 100) + '%';

export default function ClaimChecks({ run }) {
  const checks = run.result.claim_checks || [];
  const decision = run.result.decision_check;
  if (!checks.length) return null;
  return <section className="card" id="claim-checks"><h3>Claim and source checks</h3>
    {decision && decision.status !== 'complete' && <p className="hint">The second source check was {decision.status === 'partial' ? 'available for some claims' : 'unavailable'}.</p>}
    {!!decision?.skipped_claim_ids?.length && <p className="hint">The second check covered up to 12 claims. {decision.skipped_claim_ids.length} others have one check.</p>}
    {checks.map(check => {
      const rule = run.request.rules.find(item => item.rule_id === check.rule_id);
      const opinion = decision?.answers?.[check.id];
      const disagreement = opinion && opinion.status !== check.status;
      return <article className="change claim-card" key={check.id}>
        <p className="rule-status">{labels[check.status]}</p>
        <blockquote>{check.claim.quote}</blockquote>
        <p>{check.reason}</p>
        {check.action && <p><strong>Next step</strong> {check.action}</p>}
        {rule?.title && <p className="hint">{rule.title}</p>}
        {check.sources.map((reference, index) => {
          const source = run.request.sources.find(item => item.source_id === reference.source_id);
          return <details key={index} className="evidence" open>
            <summary>Source passage{source?.title ? ' · ' + source.title : ''}</summary>
            <blockquote>{reference.quote}</blockquote>
            {source?.status === 'partial' && <p className="hint">This source was only partly read.</p>}
          </details>;
        })}
        {check.context.map((reference, index) => <details key={index} className="evidence">
          <summary>Notes supplied by your team</summary><blockquote>{reference.quote}</blockquote>
        </details>)}
        {opinion && <details className="evidence" open={disagreement || undefined}>
          <summary>Second source check · {labels[opinion.status]} · {percent(opinion.confidence)} confidence</summary>
          {disagreement && <p>The two checks disagree. Compare the draft and source before deciding.</p>}
          <ul>{Object.entries(opinion.probabilities).sort((a, b) => b[1] - a[1]).map(([status, confidence]) =>
            <li key={status}>{labels[status]} {percent(confidence)}</li>)}</ul>
        </details>}
      </article>;
    })}
  </section>;
}
