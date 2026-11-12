# AI-11: Evaluate AI quality against held-out cases

**Status:** in progress · fresh mixed-source story exposed review failures
**Owner:** You; a human reviewer helps label and adjudicate cases
**Depends on:** AI-06

## Outcome

The team can judge the newsroom adaptation using measured results rather than attractive examples alone.

## Steps

- [x] Start with a fictional article and an unrelated script under the same rules. Include a clean draft, a dropped source, a repeated date change, and a conditional outside-asset case. Write down the expected findings before running Gemini.
- [x] Update the sourcing rule to check each claim. Rerun both original article versions and a control where the source remains in the current notes.
- [x] Test a fresh first draft with sourced and unsourced claims under the same rule. Save expected findings first and record rejected replies.
- [ ] Use the broader proposed set of 12 synthetic revision pairs and three first drafts for an expanded quality check.
- [ ] Keep held-out cases separate from prompt tuning and record model/prompt/settings for every run.
- [ ] Measure change and policy precision/recall separately from deterministic evidence validity.
- [ ] Check metadata grounding and repeat a few ambiguous cases to expose variability.
- [ ] Report denominators, limitations, cost, and latency; reopen earlier steps for material gaps.

## Done when

An honest evaluation report records actual results against agreed targets. No score is inferred from existing WildTrack tests or handcrafted outputs.

## Evidence and current state

On 12 November 2026, all three browser reviews completed on Gemini 3.5 Flash-Lite with prompt `0.4-workbench-1`. The Morrow Quay comparison found both expected changes. The puppet script got its outside-media flag. The article revision dropped the repair log attribution, and the comparison noticed, but the sourcing review missed the unsupported count. The overview also claimed a title edit that did not happen. One of two expected policy flags appeared, with zero extra flags. All 27 quoted references matched the saved inputs.

The sourcing follow-up reran the exact original article versions and a separate notes control in the in-app browser. ServiceNow sourcing rule Version 5 cleared the sourced first draft, flagged the unsourced count on both revision runs, and cleared the control using the repair log in its current notes. The original drafts ran on the Gemini 3.1 Flash-Lite fallback. The accepted notes control ran on Gemini 3.5 Flash-Lite after a reply was rejected for an invalid quote reference. All 42 quote references in the four accepted runs matched the saved passages.

The fresh Bracken Sound Radio story had two sourced claims and two missing a source. Both browser replies were rejected. The first unverified reply found one missing-source claim and reused the unsupported recording duration in its description. The retry found both missing-source claims in one finding and left them out of its description, but still labelled the sourcing rule clear. Both replies gave the outside-media rule a clear status with no evidence. The shared validator rejected that empty evidence array, and the UI reported a quote mismatch with empty details. The failed view did not expose the actual model or frozen request. The local `radio-story-results.md` records these limits and the next regression work.

Deon's local run log, scorecards, saved inputs and results, and screenshots are under `ai-review/output/ai-11-2026-11-12/`. The sourcing follow-up records the earlier false positives and misses. The original pair and notes control now serve as regression cases. Keep the next cases separate from rule tuning.

## References

- [05-team-handoff-and-delivery-plan.md](../../../docs/05-team-handoff-and-delivery-plan.md)
- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [Main plan](../../../PLAN.md)

