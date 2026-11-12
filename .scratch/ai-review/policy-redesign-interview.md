# Company-policy review: decision record

**Date:** 12 November 2026

**Stage:** scope and ticket breakdown confirmed by Deon; specification and eight individual local tickets published. Execution of all eight is authorized under the active goal.

**Owner:** Deon owns the AI review behaviour, evaluation, and review panel. Feature-specific ServiceNow integration work belongs in his plan; shared Inbox, human decisions, legal workflow, and wider audit/access work remain coordinated with the existing team tickets.

This records a proposed improvement to the working prototype. It does not claim that policy import, source retrieval, or the proposed results are implemented. Application code and the shared PDI have not been changed during this interview.

## Confirmed decisions

1. **Company policy becomes approved checks.** A designated editor can paste company policy text, ask Suiko to suggest reusable editorial rules, edit the suggestions, and approve them before use. A fictional publisher's short handbook is suitable for the demo.
2. **Public source links are actually read when needed.** Include source reading when an approved rule requires it. An inaccessible source produces an explicit inability to check. A page supporting a claim is distinct from proof that the claim or page is truthful.
3. **The editor supplies links without claim-by-claim mapping.** Use a Sources box for URLs and a separate optional Review context box for briefs, interview excerpts, or production notes. Suiko finds relevant claim/source passage matches and shows both passages.
4. **Uncertainty has its own result.** The review distinguishes Potential conflict, Needs confirmation, No issue found, and Not applicable. Missing permission or evidence is not silently treated as clearance or a proven violation.
5. **Content format and kind guide applicability.** The editor selects article/script/caption and news/opinion/sponsored. Proposed rules identify applicability; the editor can adjust it during setup. Suiko assesses the relevant approved rules.
6. **Both rule-entry paths are supported.** The editor can use their wording unchanged or ask Suiko to suggest improvements. Either path requires editor approval before activation. Preserve the original policy text beside proposed checks.
7. **Bound source reading for the first build.** Read up to five supplied public webpages or text PDFs per review. Independent web searching is deferred. Report inaccessible pages and allow the editor to supply an excerpt where necessary.
8. **Keep evidence with its review.** Preserve the source passages, URLs, and retrieval times used with the saved story and approved rules. A new review checks source links again; previous reviews retain their original evidence.
9. **Retain independently checked results.** If a source is inaccessible or part of the AI reply is unusable, retain the other parts that pass the app's checks. Explain what remains unchecked and allow a retry. This does not authorize displaying invalid material as a checked result.
10. **Start with editable rule templates.** Show a small suggested pack that the editor can approve, edit, remove, or replace with company policy. Refinement uses supported capabilities, including text comparison, source reading, and allowed metadata suggestions. The company policy determines requirements; available capabilities determine how Suiko can assess them or identify the need for human confirmation. Preserve the policy's intent when a requested check exceeds those capabilities.
11. **Five optional starter templates.** Offer headline/body agreement, quotation accuracy, support for important claims, sponsorship disclosure, and outside-media permissions. The designated editor can change or remove any template. Missing transcripts, source material or permission records require an explicit explanation.
12. **Prove the complete Editor flow.** Test approving rules, reviewing a first draft with sources, saving a revision, reviewing again, and opening saved evidence in ServiceNow. Repeatable local checks cover broken links, incorrect quotations, conflicting statuses and partly failed reviews. Record expected results before running Gemini.

**Additional direction:** research reusable third-party tools, APIs and free options before choosing implementations. The [tool comparison](../../docs/15-reusable-tools-research.md) records current capabilities, free limits, platform fit and a proposed integration proof. It does not authorize installing or adopting every shortlisted tool.

13. **Scope confirmed.** Deon confirmed the complete first-build scope, his ownership, the existing team boundaries, source/difference tool proofs and the end-to-end testing approach. The [specification](company-policy-review-spec.md) records the agreed behaviour.

**Later clarification:** LangExtract remains optional. It works with text, including pasted text; it is not restricted to PDFs. It is not a required dependency, service or benchmark for the first build. Use the simpler existing Gemini route unless measured extraction problems justify another tool.

## Planning outcome

The eight-ticket [breakdown](company-policy-review-tickets-proposed.md) was approved. All new tickets belong to Deon. The [implementation log](implementation-log.md) records execution and per-ticket PRs. No further scope clarification is currently required.

## Established workflow retained

One everyday Editor saves a version and presses Review this version. The first version gets its own overview, policy review, and metadata suggestions; later versions also compare with the previous submitted version of that story. Editors retain decisions and publication authority. Legal is an optional, version-specific review before editor sign-off. The designated editor capability manages shared rules. Older reviews retain the rules they used.

## Current implementation facts

- The existing rules editor supports manual instructions, activity, priority, and versioning. It does not yet derive rules from policy text or store structured format/kind applicability or the underlying policy passage.
- The current provider call sends supplied notes as text. It does not open source URLs.
- Reviews already preserve submitted revisions and rule snapshots. Existing local tests exercise review inputs and injected provider responses, and the ServiceNow build shares assessment checks.
- AI-10 records deferred status consistency, applicability, and misleading validation-message failures found during AI-11. Preserve those examples for the redesign's regression checks.

Google documents an available URL-reading tool, retrieval outcomes, and public-access/content-type limitations. This establishes a possible integration route, not a completed or validated ServiceNow implementation. The later source-reading ticket must verify the selected route and evidence retention against the existing provider call. [Google URL context documentation](https://aistudio.google.com/docs/url-context)

## Assignment criteria to retain

> Revision comparisons and editorial policy checks take time.

> Summarize changes, suggest metadata, and flag potential checklist conflicts. Editors and legal reviewers retain publishing authority.

> App Engine; content and revision records; AI comparison and classification; review workflows; audit history.
