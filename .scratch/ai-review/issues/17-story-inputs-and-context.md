# AI-17: Save format, kind, source links and review context with each version

**Owner:** Deon

**Status:** ready-for-agent

**Approved:** 12 November 2026. Implementation has not started.

**Specification:** [Company-policy AI review](../company-policy-review-spec.md).

**Blocked by:** None; the saved-story and revision flow already exists.

**What to build:** An editor chooses format/kind, supplies links and context separately, saves a version, and reopens exactly those inputs for that version's review.

**Steps**

1. Add article/script/caption and news/opinion/sponsored choices to the existing Story screen and saved revision data.
2. Add separate Sources and optional Review context inputs. Accept up to five distinct public URLs; do not require manual claim-to-link mapping.
3. Validate choices and limits on save. Keep old notes readable and ask for explicit classification on legacy stories rather than silently inventing it.
4. Include the saved values in review input and the revision display. Later edits must not change an earlier saved copy.
5. Make source status honest during staged delivery: links are unread until a later source-reading slice actually retrieves them.
6. Confirm existing first-draft review, metadata choices and saved stories still work.

**Done when**

- [ ] A saved article and a saved script retain their own format, kind, links and context.
- [ ] Reopening an older version shows its original inputs after a newer version is saved.
- [ ] The UI never implies that merely saving a URL means its page has been read.

**Ask your AI**

> Work on AI-17. Extend the existing saved-revision journey end to end with format, kind, Sources and Review context. Preserve legacy stories and notes, enforce limits on the server, and prove that reopening a revision restores its exact inputs. Source retrieval and policy proposal generation belong to later tickets; keep their current status visible and honest.

