# AI-23: Prove the complete AI review flow and record its limits

**Owner:** Deon

**Status:** ServiceNow evaluation in progress. The final source-change and history check needs the in-app browser connection.

**Approved:** 12 November 2026.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** AI-19, AI-21 and AI-22; these transitively include the other slices.

**What to build:** Deon can demonstrate the agreed feature in ServiceNow and show saved evidence of what Gemini got right, wrong and could not check.

**Steps**

1. Prepare a fictional publisher policy, a fresh article, an unrelated script and a revision. Record expected policy applicability, findings, metadata and meaningful changes before the first live review.
2. Approve both an editor-written rule and a rule proposed from policy, then run the first story from the actual panel.
   Also test a stale approval with an authorized designated editor: open proposal A, save changed wording or applicability as B in another session, then submit A's approval. It must identify A and cannot approve B.
3. Inspect claim/source evidence, save a human metadata choice, revise the story and review the new version.
4. Reopen the earlier review after changing a rule and a public source fixture. Verify old evidence and the new attempt remain distinct.
5. Exercise broken-link, bad-quote, contradictory-status and partial-result examples with fixed responses through the review entry point. Verify the ordinary Editor/designated editor boundary for this feature.
6. Record inputs, versions, actual model, expected versus actual observations, remaining gaps and the next justified improvement. Keep the earlier AI-11 outcomes as historical evidence.

**Done when**

- [ ] The complete AI feature works from the PDI UI with inspectable saved evidence.
- [x] A fresh example has been assessed without editing the expected result after seeing Gemini's answer.
- [ ] Repeatable checks cover the known failure cases without requiring repeated live error calls.
- [ ] The handoff states which assignment capabilities this proves and which teammate workflow work still remains.

**Ask your AI**

> Work on AI-23 after its blockers are complete. Evaluate the whole agreed AI feature through the ServiceNow UI, using a fresh article, unrelated script and revision with expectations written first. Inspect actual saved inputs, policy versions and retrieved material. Report useful results, misses, false concerns and technical gaps honestly, and recommend the next change from evidence. Keep human/legal workflow ownership with the existing team tickets.
