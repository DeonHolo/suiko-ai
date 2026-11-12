# AI-16: Keep useful review results and explain failures honestly

**Owner:** Deon

**Status:** implemented and tested — CodeRabbit corrections ready for the authorized review/merge loop.

**Approved:** 12 November 2026. Implemented and tested under the active goal.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** None; the current review flow already exists.

**What to build:** An editor opens a review with useful checked sections even when another section fails, with accurate rule summaries and understandable errors.

**Steps**

1. Reproduce the saved radio-story status/evidence failures using fixed provider responses. Keep expected outcomes separate from observed results.
2. Make a rule's summary agree with its retained findings and unresolved checks. A concern cannot coexist with a falsely clear rule.
3. Distinguish missing evidence, unmatched quotations, contradictory results and inapplicable rules. Preserve the difference between inability to assess and a potential conflict.
4. Validate and retain independent sections of a well-formed reply. Exclude unusable observations, downgrade affected coverage and check that any retained overview remains accurate.
5. Show the actual rejected quote and stored passage for a quote mismatch. Explain missing evidence directly instead of displaying empty quote/source fields.
6. Save and reopen the checked sections, gaps and attempt outcome. Keep malformed overall responses as technical failures with the draft and retry available.

**Done when**

- [x] The radio regression shows no clear status alongside missing-source findings.
- [x] An irrelevant outside-media rule can show Not applicable without an invented quote.
- [x] A bad finding leaves independent checked results usable and clearly labels the remaining gap.
- [x] A wholly malformed response remains a failed attempt rather than a fabricated review.

**Ask your AI**

> Work on AI-16 from the approved company-policy review specification. Use the saved failure examples and injected provider responses to reproduce the problem first. Keep the change inside review validation, saved results and the AI panel; preserve human workflow actions. Demonstrate the difference between a partial usable review and a technical failure. Record what passed and what remains unresolved.

## Evidence

50 local tests passed, including historical radio replies, independent overview evidence, unknown-rule rejection and saved-attempt handling. SDK type checking/frozen-key build and PDI page/API smoke checks passed. Three live browser attempts preserved partial results/history. The installed automated ServiceNow persistence/retry test passed with actual generated validators. [Named evidence for each completion item](../../../docs/16-review-reliability-evidence.md).

The live model's sourcing accuracy varied: one 3.1 attempt found both unsupported claims; another 3.1 attempt and the direct 3.5 attempt inferred an unsupported station source. This ticket fixes result handling, not the later claim/source analysis. Track that quality gap in AI-21/AI-23. A mistyped opaque revision identity also motivated shorter model-facing source labels in the saved-input follow-up.

Initial code commit: `1469343`. [PR #11](https://github.com/DeonHolo/suiko-ai/pull/11) targets main. Deon now authorizes the agent to assess CodeRabbit's review, fix applicable findings, verify checks and merge. This replaces the earlier wait-for-owner instruction.
