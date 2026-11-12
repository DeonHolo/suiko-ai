import React from 'react';

const labels = {
  supported: 'Support found', contradicted: 'Potential conflict',
  insufficient: 'Needs confirmation', not_applicable: 'Not applicable',
};

export default function ClaimChecks({ run }) {
  const checks = run.result.claim_checks || [];
  const decision = run.result.decision_check;
  if (!checks.length) return null;
  return <section className="card"><h3>Claim and source checks</h3>
    {decision && decision.status !== 'complete' && <p className="hint">The optional confidence check was {decision.status === 'partial' ? 'available for some claims' : 'unavailable'}. The review findings are below.</p>}
    {checks.map(check => {
      const rule = run.request.rules.find(item => item.rule_id === check.rule_id);
      const opinion = decision?.answers?.[check.id];
      const disagreement = opinion && opinion.status !== check.status;
      return <article className="change claim-card" key={check.id}>
        <p className="rule-status">{labels[check.status]}</p>
        <blockquote>{check.claim.quote}</blockquote>
        <p>{check.reason}</p>
        {check.action && <p><strong>Next step</strong> {check.action}</p>}
        <p className="hint">{rule?.title || check.rule_id} · Rule version {rule?.version}</p>
        {check.sources.map((reference, index) => {
          const source = run.request.sources.find(item => item.source_id === reference.source_id);
          return <details key={index} className="evidence" open>
            <summary>Retrieved source · {source?.title || source?.url || 'Saved passage'}</summary>
            <blockquote>{reference.quote}</blockquote>
            {source?.status === 'partial' && <p className="hint">This source was only partly read.</p>}
          </details>;
        })}
        {check.context.map((reference, index) => <details key={index} className="evidence">
          <summary>Editor-supplied review context</summary><blockquote>{reference.quote}</blockquote>
        </details>)}
        {opinion && <p className="hint">Decision 1 · {labels[opinion.status]} · {Math.round(opinion.confidence * 100)}% model confidence</p>}
        {disagreement && <p>Gemini’s two checks differ. Compare the passages before deciding.</p>}
      </article>;
    })}
  </section>;
}
