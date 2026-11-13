# Review history and source checks

Checked on 13 November 2026 against the saved Harbor Film Night teaser in the team development instance. No new Gemini review was requested during this check.

## Why the versions look alike

A version saves the title, story text, format, type of story, source links and notes. Changing any one of those can create a version even if the words in the story stay the same.

| Version | What actually changed | Format | Type of story |
| --- | --- | --- | --- |
| 1 | First saved copy, with the paid partnership disclosure and Friday release | Caption | Sponsored |
| 2 | Removed the public disclosure; changed Friday to Saturday | Caption | Sponsored |
| 3 | Added the IANA source link; story text stayed the same | Caption | Sponsored |
| 4 | Changed Sponsored to News; all other saved fields stayed the same | Caption | News |

Saving exactly the current fields again returned the existing Version 4. The instance still had four versions and four reviews afterward. Pressing Review again is different: it creates another review attempt for the same saved version, without creating a new story version.

The screen now shows each saved version's format and type. A completed review's What changed section also displays format/type changes directly from that review's frozen copies. Those labels are derived from the saved fields; they are not invented Gemini observations. Text edits remain separate.

Review history selects the most recent review for the current version when one exists. It no longer offers a selectable blank entry. If only older versions have reviews, it identifies the current version as not reviewed and lets the editor open an older result deliberately.

## Reading a link

The source reader is implemented. It can retrieve up to five supplied public webpages or text PDFs when an applicable approved rule requests source material. It saves the material used with that review. It does not independently search the web.

In Harbor versions 3 and 4, the IANA link was **not read**. The saved reason was: “No applicable approved rule asked for source material.” The saved requests have no source-rule IDs. This is a skipped source check, not a failed attempt to read that page. The IANA page is also about reserved domain names, so it would not establish the film's schedule or sponsorship.

An editor can enable source reading on a relevant rule, approve it, and run a new review. Merely supplying a URL does not mean Suiko opened it. Inspect Sources used for the actual retrieval status and saved passages.

## Decision 1

Decision 1 is connected as the optional second source check. Flash-Lite remains responsible for the main review. The extra check compares eligible claims against the retrieved source passages and preserves its confidence and disagreement with the first check.

None of Harbor's four saved reviews requested the second check. A separate saved Makers’ Night review did request it and has a completed result for three claims. Its source records contain a read production brief, a read text PDF and an unavailable link. One second-check answer was Needs confirmation with about 97% confidence; that disagreement remains available to the editor. This check read the existing saved evidence; it did not call Decision 1 again.

## What Not applicable means

The rule is outside the story's chosen format, type or stated circumstances. It is different from No issue found: that means an applicable check found no concern in the material it assessed.

For example, the saved paid-relationship rule is limited to Sponsored stories. It applied to Harbor Version 3 and identified the missing disclosure. When Version 4 was labelled News, that rule was excluded even though the notes still said Lantern Coffee paid for the teaser. This is a rule-scope limitation that deserves attention; a changed dropdown does not make the sponsorship disappear.

Recommended follow-up: let the editor decide whether the paid-relationship rule should cover every story type whenever the text or notes indicate a paid relationship. That requires a visible rule edit and approval. This UI fix does not silently change an approved rule or rewrite an older review.

## Verification

- Three new screen checks failed before the fix and passed afterward: no blank review choice; an unreviewed current version is not presented as reviewed; saved format/type and changes remain visible when text is unchanged.
- All 19 screen checks and 99 existing AI checks passed. The ServiceNow SDK build completed.
- The unchanged-save check used the real ServiceNow action and preserved all four versions and reviews.
- The live source and Decision 1 statuses above were read from saved review records.
- Visual browser inspection could not be completed: computer use stopped because it could not reliably determine the browser's current address. Component checks and server readback do not replace that visual check or ordinary-account access testing.

[Owner's next steps and testing skills](27-owner-next-steps.md) · [AI feature handoff](26-ai-review-handoff.md)
