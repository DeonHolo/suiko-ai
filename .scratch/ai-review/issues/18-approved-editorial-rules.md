# AI-18: Approve editable starter rules and editor-written rules

**Owner:** Deon

**Status:** implemented and tested on `codex/ai-18-approved-rules`; PR review next.

**Approved:** 12 November 2026. Execution authorized under the active goal.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** AI-17, because approved applicability uses the saved format/kind choices.

**What to build:** A designated editor approves, edits, disables or replaces reusable rules, and a story review uses the correct approved versions and applicability.

**Steps**

1. Offer the five approved starter templates as suggestions. Identify their origin and show what each can check or needs a human to establish.
2. Support an editor-written rule with unchanged wording. Record format/kind applicability, additional conditions and priority.
3. Add an explicit approval action recording the authorized editor, time and exact rule version. Suggestions stay inactive until approved.
4. Preserve the last approved version while a proposed edit awaits approval. Explicit disablement removes the rule from future active checks.
5. Use approved scope during review and explain Not applicable or Needs confirmation. Preserve the exact rule version with the result.
6. Keep legacy rules/history readable and label unrecorded approval honestly. Verify the designated editor can manage rules while an everyday Editor can review but cannot approve shared rules.

**Done when**

- [x] An approved manual headline rule works on a relevant story; typed scope exclusions are tested locally and shown for the Sponsored-only starter on the News story.
- [x] An unapproved template or edit cannot silently become active.
- [x] Earlier reviews still show their original rule wording after an approved replacement.
- [x] Checks requiring a capability not implemented yet explain the need for confirmation; source-reading capability remains explicitly false and permission confirmation is described in setup.

**Evidence:** [Setup guide and test report](../../../docs/18-approved-rule-setup.md). 73 local checks; successful SDK install/smoke; native non-admin permission/lifecycle checks; two live browser reviews; original rule wording preserved after replacement. The description check's overly broad exclusion is recorded for AI-21.

**Ask your AI**

> Work on AI-18. Reuse the existing rule editor and snapshots. Make starter templates, manual wording, explicit approval, applicability and version replacement work through the existing ServiceNow screens and review action. Preserve historical records and prove the designated-editor permission boundary. Keep company rules separate from human story sign-off.
