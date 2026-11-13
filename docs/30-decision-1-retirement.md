# Decision 1: retained for experiments, removed from editor reviews

Owner decision: 14 November 2026.

The editor runs one AI review. Remove the optional second-source-check checkbox and stop Decision 1 calls from the live review endpoint, including requests from older clients that still send `decision_check: true`. New saved requests explicitly record `decision_check_requested: false`.

The main review still retrieves source text when an applicable approved rule requires it, compares claims against saved passages, and reports Support found, Potential conflict or Needs confirmation. Editors can inspect those passages and make their own decision.

The extra model added competing answers, percentages and another control without enough demonstrated benefit. In the latest installed Halyard test, the main review supported the source's admission-pending wording while Decision 1 returned Needs confirmation (50.92%). Other trials helped, but the small samples do not establish better accuracy. See [the original results](29-owner-validation.md); those records remain historical evidence.

Keep Decision 1's backend helper, question builder, fixtures, evaluation runner and tests for explicitly requested future experiments. There is no new public experiment endpoint or automatic experiment call. Existing saved second-check results remain readable in review history, including disagreements. No source snapshots, reviews, approvals or publishing choices are deleted.

The source status **Read** becomes **Source text retrieved**, with **Retrieved** timestamps and **View saved passages**. Partial, unavailable and not-retrieved statuses use matching retrieval wording. This reports retrieval, not proof of accuracy or source trustworthiness.

## Verification expectations recorded before execution

- With matching approved source rules and links, the story offers Review this version with no second-check checkbox. Its request has no `decision_check` field.
- Even a legacy request with `decision_check: true` produces only the main review and records the second check as not requested.
- Source retrieval and main claim comparisons continue. Retrieved text uses the new wording and saved passages open.
- A saved historical second-check result and disagreement remain visible.
- Review/UI tests and the SDK build pass; installation preserves existing evidence and newer Studio work.

No Gemini prompt or model-quality behavior is being tuned by this change. Any new live review is a wiring check against these expectations, not evidence of improved model accuracy.
