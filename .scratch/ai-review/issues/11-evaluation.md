# AI-11: Evaluate AI quality against held-out cases

**Status:** draft
**Owner:** You; a human reviewer helps label and adjudicate cases
**Blocked by:** AI-06

This is a future work step. We are still planning; do not execute its setup, coding, deployment, or live-call actions merely because this file exists.

## Outcome

The team can judge the newsroom adaptation using measured results rather than attractive examples alone.

## Steps

- [ ] Start with a fictional article and an unrelated script under the same rules. Include a clean draft, a dropped source, a repeated date change, and a conditional outside-asset case. Write down the expected findings before running Gemini.
- [ ] Use the broader proposed set of 12 synthetic revision pairs and three first drafts for an expanded quality check.
- [ ] Keep held-out cases separate from prompt tuning and record model/prompt/settings for every run.
- [ ] Measure change and policy precision/recall separately from deterministic evidence validity.
- [ ] Check metadata grounding and repeat a few ambiguous cases to expose variability.
- [ ] Report denominators, limitations, cost, and latency; reopen earlier steps for material gaps.

## Done when

An honest evaluation report records actual results against agreed targets. No score is inferred from existing WildTrack tests or handcrafted outputs.

## Evidence and current state

Proposed targets exist; no newsroom dataset run or measured score has been produced.

Add dated evidence here when the step is actually performed.

## References

- [05-team-handoff-and-delivery-plan.md](../../../docs/05-team-handoff-and-delivery-plan.md)
- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [Main plan](../../../PLAN.md)

