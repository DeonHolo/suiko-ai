# AI-05 · Define the first-draft review and revision comparison

**Status:** in-progress · first-draft and comparison behavior implemented in the PDI prototype
**Owner:** You
**Depends on** AI-04 for the local work and AI-02 for the shared handoff

The PDI workbench now uses the revised request with distinct public text and internal notes. The remaining fixture and quality work below is still part of the shared handoff.

## Outcome

The review works with one submitted draft. It adds a comparison when the same story has an earlier submission.

## Steps

- [x] Give Gemini the saved draft, optional source notes, and active rule wording. Keep the supplied notes identifiable when a finding cites them.
- [x] Return a short internal overview independently of the suggested public description, including when a successful review has zero findings.
- [x] Report which rules applied and attach each finding to an active rule and the passage that prompted it. One rule can yield more than one finding.
- [x] Use the immediately previous submitted revision of the same story for comparisons. Give rule checks the full current draft.
- [ ] Adapt the prompt and validators for before/after evidence, removals, moves, formatting, and repeated passages.
- [ ] Cover unchanged and first-draft cases without fabricated changes or misleading partial status.
- [ ] Keep suggested metadata separate from the internal overview and from the editor's choice. Ground section, tags, and public descriptions in the current draft. Leave out claims flagged for verification.
- [ ] Add fixtures with an attribution removed and restored, a grouped date change, a conditional footage rule, and two unrelated first drafts.

## Done when

Fixtures demonstrate a useful first-draft result, a grounded later comparison, and a clean draft with zero findings. The same checks reject a fabricated quote or a reference to the wrong story or rule.

## Evidence and current state

On 12 November, both river drafts completed on Gemini 3.5 in ServiceNow. The second review grouped the schedule change and flagged the outside clip. An unrelated library first draft completed through the 3.1 fallback, flagged the unsupported attendance estimate, and omitted it from the public description. Its description added words such as "guided" that the source did not explicitly supply. Keep that wording drift in AI-11's evaluation work rather than treating schema and quote validation as a full accuracy guarantee. [Live workbench project](../../../servicenow-app/README.md)

## References

- [02-research-and-wildtrack-reuse.md](../../../docs/02-research-and-wildtrack-reuse.md)
- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [Main plan](../../../PLAN.md)

