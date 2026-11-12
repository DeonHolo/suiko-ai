# AI-21: Match claims to sources and show rule-linked results

**Owner:** Deon

**Status:** implemented and tested in ServiceNow. PR review follows AI-20.

**Approved:** 12 November 2026.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** AI-16 and AI-20. Their prerequisites also supply approved rules and saved inputs.

**What to build:** An editor sees which relevant claims the retrieved sources support, which need confirmation and which potentially conflict with an approved rule, with inspectable passages and useful next actions.

**Steps**

1. Add retained source passages to the frozen review input with distinct identities from story text, policy and supplied context.
2. Under applicable company rules, have Gemini assess relevant claims individually and match passages automatically.
3. Verify each claim/source quotation against the saved material. One supported claim must not clear other claims; an unrelated page or supplied assertion cannot masquerade as retrieved evidence.
4. Show Potential conflict, Needs confirmation, No issue found and Not applicable consistently. Include both conflict and unresolved coverage when a rule has both.
5. Preserve checked results when a page or finding fails. Offer a concrete next action and keep public metadata free of flagged/unconfirmed claims and internal-only material.
6. Test a mixed-claim article, a contradictory source, an irrelevant source and a permission note before a fresh live run. Save expectations first and retain actual results.
7. Run the approved Gemini Decision 1 trial using the existing protected Gemini key. Send frozen claim/source material and explicit support/contradiction/insufficient-information choices. Compare its advisory judgments with Flash-Lite alone on a small, pre-labelled set. Record confidence, useful findings, misses, latency and input usage. Retain the integration if it improves the editor's experience; otherwise record why it was left out. See [trial notes](../decisions-api-research.md).
8. Present the judgment, relevant passages, confidence where available and a concrete editor action. Uncertainty is review information, not a failed job or a reason to demand absolute truth. Keep the final publishing decision with the editor/legal reviewer.

**Observed follow-up from AI-18:** The headline conflict correctly quoted both the overstated title and the cautious body. The description checker withheld an accurate description taken from that body simply because it also appeared as finding evidence. Separate the problematic claim from comparison/context evidence when deciding whether public metadata reuses the concern. Retain a meaningful safeguard without withholding harmless text solely due to co-citation.

**Done when**

- [x] Bare URLs produced inspectable claim/source matches without editor-written mappings.
- [x] The live story separately showed supported seats and an unresolved price. The report records the remaining exhibition classification error.
- [x] A contradiction showed the actual draft and source passages.
- [x] Summaries reflect the retained findings. The final description omitted disputed and unsupported facts.
- [x] Decision 1 was tested, and the panel showed confidence, differences between judgments and next actions.

[ServiceNow evidence and observed model limits](../../../docs/21-claim-and-source-review.md).

**Ask your AI**

> Work on AI-21. Use the approved company rules and frozen source snapshots to assess relevant claims individually. Return exact story/source references, clear uncertainty and actionable rule-linked findings. Reuse partial-result handling and verify quoted passages before showing checked results. Write expectations for mixed supported, unsupported, unrelated and contradictory cases before calling Gemini.

Try Gemini Decision 1 as the approved optional confidence-producing checker. Keep Flash-Lite for explanation. The goal is useful, digestible information for a human editor; no absolute-truth certification gate is required.
