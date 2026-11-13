# AI-22: Ground revision summaries in actual text changes

**Owner:** Deon

**Status:** done. [PR #17](https://github.com/DeonHolo/suiko-ai/pull/17) merged after CodeRabbit fixes and installed comparison tests.

**Approved:** 12 November 2026.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** AI-16, which establishes the checked-section and coverage behaviour used by this comparison.

**What to build:** An editor sees a reliable comparison with the previous submitted version, including grouped repeated fact changes and removed attribution, while first-version reviews remain useful.

**Steps**

1. Confirm old/new submitted copies and their comparison scope are preserved before the run.
2. Prove a standard difference library such as jsdiff in the SDK/runtime, using pure text operations. Reuse the existing implementation if it already meets the same tests more simply.
3. Supply literal changes as context for Gemini's editorial explanation. Preserve the full candidate text for policy review.
4. Group repeated updates to the same fact and identify changed/removed attribution. Quote before/after passages accurately.
5. Reject invented edits or references without hiding unrelated valid review sections. Keep first drafts as reviews with no comparison requested.
6. Recheck the library date/source example and the partly shortened caption case, plus an unchanged copy. Save the input, expected edit list and actual comparison.

**Done when**

- [x] A repeated schedule change appears once with relevant before/after evidence.
- [x] Removed attribution is identified without inventing another edit.
- [x] A shortened caption accurately distinguishes deleted and retained wording.
- [x] Identical text and first drafts do not produce invented changes.

[Live inputs, results and limits](../../../docs/22-revision-comparisons.md).

**Ask your AI**

> Work on AI-22. Ground the comparison in actual saved-text differences, then use Gemini to explain the editorial meaning. Evaluate a standard difference library for the existing SDK rather than writing another matcher unnecessarily. Keep repeated-fact grouping, removed attribution and partly shortened captions covered by expected examples. Preserve first-draft review and independent policy/metadata results.
