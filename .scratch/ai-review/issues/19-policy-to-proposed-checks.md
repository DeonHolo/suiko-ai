# AI-19: Turn company policy into editable proposed checks

**Owner:** Deon

**Status:** done. [PR #14](https://github.com/DeonHolo/suiko-ai/pull/14) merged as `f11c6de`.

**Approved:** 12 November 2026.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** AI-18, which supplies the rule approval and versioning flow.

**What to build:** An editor pastes policy text or requests refinement, inspects proposed checks beside their original passages, and approves only the checks they want to use.

**Steps**

1. Save a bounded pasted policy version, with passages that can be referenced.
2. Offer Use my wording and Suggest checks/refine options. Reuse the existing Gemini configuration for the optional suggestion operation.
3. Request proposed wording, exact policy passage references, applicability, supported check requirements and unresolved questions in a defined response structure.
4. Verify references against the saved policy. Show proposals beside their original text; identify unclear instructions, lost qualifications or unsupported capabilities for human review.
5. Let the editor edit, discard or approve individual proposals through AI-18. A model reply never activates policy by itself.
6. Test short policies with exceptions and conflicting/vague instructions. Save expected versus observed proposals before deciding whether a more complex extractor is needed.

**Done when**

- [x] The editor can move from pasted policy to an approved rule used by a story review.
- [x] Original wording and passage references remain inspectable after refinement.
- [x] Failed proposals and discarded checks do not become active rules.
- [x] Direct Gemini plus the existing application checks produced usable proposals.

The [setup and evidence](../../../docs/19-company-policy-setup.md) record the successful suggestions, one missed clause, the original and revised policy copies, and the saved story review.

**Ask your AI**

> Work on AI-19. Build the pasted-policy-to-proposed-rule journey on top of the existing Gemini integration and approved rule flow. Preserve policy meaning, conditions and exceptions; show exact supporting passages and make all generated checks await editor approval. Start with the smallest implementation and existing tests. Consider another extractor only after recording a concrete quality gap.
