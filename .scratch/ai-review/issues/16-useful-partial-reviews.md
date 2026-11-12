# AI-16: Keep useful review results and explain failures honestly

**Owner:** Deon

**Status:** in-progress

**Approved:** 12 November 2026. Execution authorized under the active goal; first slice now in progress.

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

- [ ] The radio regression shows no clear status alongside missing-source findings.
- [ ] An irrelevant outside-media rule can show Not applicable without an invented quote.
- [ ] A bad finding leaves independent checked results usable and clearly labels the remaining gap.
- [ ] A wholly malformed response remains a failed attempt rather than a fabricated review.

**Ask your AI**

> Work on AI-16 from the approved company-policy review specification. Use the saved failure examples and injected provider responses to reproduce the problem first. Keep the change inside review validation, saved results and the AI panel; preserve human workflow actions. Demonstrate the difference between a partial usable review and a technical failure. Record what passed and what remains unresolved.

