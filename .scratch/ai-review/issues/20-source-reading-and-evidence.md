# AI-20: Read linked sources and retain inspectable evidence

**Owner:** Deon

**Status:** implemented and verified in ServiceNow. PR review next.

**Approved:** 12 November 2026.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** AI-18, which also includes AI-17. The run needs saved URLs and an approved rule indicating that source reading is relevant.

**What to build:** When a review needs sources, the editor sees which supplied pages/text PDFs were read, the actual retained material, and clear reasons for pages that could not be used.

**Steps**

1. Prepare public fixtures with expected text: a normal page, a text PDF, an unrelated page, a missing page and an incomplete/changed-page case.
2. Prove a bounded text-returning reader from the PDI. Trial Jina first; record extraction, timing, limits and failure behaviour before adopting it. Evaluate an alternative only if the proof identifies a need.
3. Read up to five supplied public links when an approved rule requires external material. Set explicit source-size/time limits, handle redirects and reject unsupported/private targets at this boundary.
4. Preserve per-attempt source text, stable passage references, URLs, retrieval outcomes/times and fingerprints. Keep a new reading attempt separate from previous evidence.
5. Add source evidence cards to the review panel, including inaccessible/partial outcomes. Distinguish editor-pasted context and an unread URL from a retrieved source.
6. Reopen a saved review after a test page changes and demonstrate that the old review retains the old material. This slice establishes source reading; claim support is assessed in AI-21.

**Done when**

- [x] The actual PDI reads a public page and a text PDF and preserves expected passages.
- [x] Missing or incomplete content produces a visible limitation while useful review sections remain available.
- [x] Old source material survives another review of changed source content.
- [x] Source cards describe retrieval outcomes. Claim support is assessed in AI-21.

[Setup and saved evidence](../../../docs/20-source-reading.md).

**Ask your AI**

> Work on AI-20. Prove source retrieval through ServiceNow before adopting a reader. Use controlled public fixtures and an injectable reader for repeatable cases. Save the exact material available to a review and show it with clear retrieval outcomes in the existing AI panel. Respect the five-link limit and preserve earlier snapshots. Do not add independent web search or require manual claim mapping.
