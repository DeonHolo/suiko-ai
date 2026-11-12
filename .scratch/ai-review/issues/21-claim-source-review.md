# AI-21: Match claims to sources and show rule-linked results

**Owner:** Deon

**Status:** ready-for-agent

**Approved:** 12 November 2026. Implementation has not started.

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

**Done when**

- [ ] Bare URLs produce inspectable claim/source matches without editor-written mappings.
- [ ] A story with supported and unsupported claims shows both accurately.
- [ ] A contradiction shows both passages without claiming independent truth certification.
- [ ] Rule summaries, retained findings, coverage and suggested public description agree.

**Ask your AI**

> Work on AI-21. Use the approved company rules and frozen source snapshots to assess relevant claims individually. Return exact story/source references, clear uncertainty and actionable rule-linked findings. Reuse partial-result handling and verify quoted passages before showing checked results. Write expectations for mixed supported, unsupported, unrelated and contradictory cases before calling Gemini.
