# Company-policy AI review specification

**Status:** ready-for-agent — scope and eight-ticket breakdown approved.

**Implementation status:** starting with AI-16 under the authorized execution goal. This document describes the agreed next build, not a claim that all features are deployed.

**Approved:** 12 November 2026. **Owner:** Deon.

## Problem Statement

An editor needs help checking different articles, scripts and captions against the publication's standards. Each story is different, but many standards apply repeatedly. The editor should be able to change those standards without changing application code or preparing a document template for every story.

The current prototype has saved revisions, Gemini reviews, editable rules and metadata choices. Its source URLs are supplied text rather than pages actually read. Tests also exposed contradictory rule statuses and unhelpful error messages. An editor cannot confidently act on a review that says a check is clear while listing concerns, or loses useful results because another section failed.

The next build must explain what was checked, which company rule applies, which passages support the result, and what still needs human confirmation. Reading a source establishes what that source says; it does not establish that the source is truthful.

## Solution

Suiko AI is an internal editorial workspace for a small media team. One everyday Editor saves a story version and presses **Review this version**. A designated editor capability manages company rules. Legal joins only when an editor assigns a version for legal review.

### Set up the publication's rules

Offer five optional starter rule templates: headline/body agreement, quotation accuracy, support for important claims, sponsorship disclosure, and outside-media permissions. Templates are suggestions until the designated editor approves them. The editor can edit, remove or replace them.

The editor can also paste company policy text. They can use their wording unchanged or ask Suiko to suggest reusable checks. Show the original policy alongside proposed checks, their applicability, and anything requiring clarification. The editor chooses and approves the wording that becomes active.

Refinement must fit supported capabilities. It can ask Suiko to compare text, inspect supplied context, compare claims with retrieved source passages, or suggest allowed metadata. A requirement exceeding those capabilities remains visible as a need for human confirmation; refinement must preserve its meaning and exceptions.

### Review a story

1. Choose **format**: article, script or caption; choose **kind**: news, opinion or sponsored.
2. Paste the title and story text. Optionally paste up to five public source links into **Sources**, and briefs, interview excerpts or production notes into **Review context**.
3. Save the version, then press **Review this version**. Suiko uses the exact saved copy and approved rules. When a rule needs sources, it reads the supplied links and retains the material used.
4. Read an internal overview, applicable rule results, suggested metadata, and meaningful changes from the previous submitted version when one exists.
5. Open a concern to see the story passage, rule wording, relevant context/source passage, explanation and next action. The editor retains the decision.

Results distinguish **Potential conflict**, **Needs confirmation**, **No issue found**, and **Not applicable**. A failed page or unusable AI section must not hide independently checked results or make incomplete work appear clear.

### Example

A company's approved rule says that headlines must preserve uncertainty in the reporting. The headline presents an event as confirmed while the body describes it as under discussion. Suiko quotes both passages and points to that rule. It can identify this potential conflict without an external source.

If another approved rule requires supporting material for important claims, Suiko can match relevant claims to supplied public pages. It shows the claim and the source passage it actually read. An unrelated, inaccessible or insufficient page produces an explanation of the gap. The editor does not need to map each sentence to a URL manually.

## User Stories

1. As a designated editor, I want suggested starter rules, so that I can begin with useful examples.
2. As a designated editor, I want to edit, remove or replace a template, so that the publication chooses its own standards.
3. As a designated editor, I want to paste company policy text, so that the review reflects our actual requirements.
4. As a designated editor, I want to use my wording unchanged, so that Suiko preserves an instruction I already trust.
5. As a designated editor, I want optional proposed refinements, so that I can make a broad policy easier to assess.
6. As a designated editor, I want the original policy passage beside a proposal, so that I can check its interpretation.
7. As a designated editor, I want exceptions and conditions preserved, so that a proposed check does not distort policy.
8. As a designated editor, I want unsupported checks identified, so that I understand what still needs a person.
9. As a designated editor, I want to approve individual proposed checks, so that unused suggestions never become active automatically.
10. As a designated editor, I want to adjust applicability and priority, so that a rule is assessed in the right circumstances.
11. As a designated editor, I want edits to approved wording to require a new approval, so that active rules remain accountable.
12. As a designated editor, I want to disable a rule, so that future reviews stop using it while past reviews remain understandable.
13. As an Editor, I want simple format and kind choices, so that Suiko can apply relevant rules.
14. As an Editor, I want to paste different stories without following a fixed document layout, so that ordinary editorial work fits the app.
15. As an Editor, I want separate Sources and Review context fields, so that I understand how each input will be used.
16. As an Editor, I want to supply bare source URLs, so that I do not have to prepare claim-to-source mappings.
17. As an Editor, I want the review to run against a saved version, so that later edits do not change what was reviewed.
18. As an Editor, I want a useful first-version overview, so that a review helps before any revision comparison exists.
19. As an Editor, I want meaningful changes from the previous submitted version, so that I can understand an update quickly.
20. As an Editor, I want repeated edits to the same fact grouped together, so that the comparison is easy to read.
21. As an Editor, I want removed or changed attribution called out, so that source-related edits are visible.
22. As an Editor, I want relevant claims checked individually when a rule requires it, so that one supported claim does not conceal another unsupported claim.
23. As an Editor, I want both claim and source passages, so that I can inspect a proposed match.
24. As an Editor, I want inaccessible, unrelated or insufficient sources explained, so that I know what remains unconfirmed.
25. As an Editor, I want context notes labelled as supplied context, so that I can distinguish an attestation from independently retrieved material.
26. As an Editor, I want each finding tied to an approved rule, so that Suiko's concerns reflect company policy.
27. As an Editor, I want uncertain checks separated from potential conflicts, so that missing information is explained accurately.
28. As an Editor, I want inapplicable rules distinguished from completed checks, so that the review describes its coverage honestly.
29. As an Editor, I want useful checked sections to survive an unrelated failure, so that I can continue working.
30. As an Editor, I want plain-language errors showing the affected passage or missing information, so that I can understand and retry a failed check.
31. As an Editor, I want suggested section, tags and description, so that I can prepare metadata efficiently.
32. As an Editor, I want to accept or edit metadata explicitly, so that suggestions do not overwrite my choices.
33. As an Editor, I want internal notes and unconfirmed claims kept out of suggested public descriptions, so that metadata does not introduce a publication risk.
34. As an Editor, I want to reopen the exact policy and source evidence used for a review, so that later page or rule changes do not rewrite history.
35. As an Editor, I want a new review to check supplied links again, so that I can examine changed source material.
36. As an Editor, I want an outdated review clearly identified, so that I can choose whether to request a current review.
37. As a legal reviewer, I want human clearance tied to the specific submitted revision, so that AI analysis never substitutes for my decision.
38. As a teammate, I want this work to extend the existing app and interfaces, so that Inbox and decision work can proceed alongside it.
39. As Deon, I want expected results and saved evidence for test cases, so that I can explain what improved and what still fails.

## Implementation Decisions

### Ownership and application boundary

Deon owns this feature's prompt and response behaviour, policy setup and refinement, AI panel, source-reading integration, evidence checks and evaluation. Feature-specific schema, API and access changes are part of these slices.

Keep the existing ServiceNow scoped app, story identities, saved revisions, provider configuration and review entry point. Extend the current Story and Editorial rules screens. Teammates retain the existing Review Inbox, human decisions, legal routing, wider audit/access and whole-team demo tickets. Coordinate shared record and interface changes with those owners.

The editor's sign-off and optional legal clearance remain bound to the submitted revision. AI findings and rule approval do not create either decision. Publication continues through the team's usual publishing tools.

### Company policy and rule approval

Retain each policy text version and its identifiable passages. Each proposed rule records its origin: policy passage, editor-authored instruction or starter template. Keep the proposed instruction, applicability, priority and any missing information together.

Rule approval records the authorized person, time, exact instruction and applicability approved. Proposed, approved and disabled states must be distinguishable. Editing approved meaning or applicability creates a proposed replacement; the last approved version remains in use until its replacement is approved or it is explicitly disabled.

The manual path preserves the editor's wording. Refinement is optional and produces proposals only. A proposal must not invent new requirements, remove exceptions, or convert an unsupported obligation into an easier but different rule. Unclear or conflicting policy wording is surfaced for the editor to resolve.

The app maintains a description of supported checks and output capabilities. This describes what Suiko can assess; it is not company policy. Metadata suggestions use existing allowed taxonomy values, and saving a suggestion remains an explicit editor action.

Applicability records content formats, content kinds and any additional plain-language conditions. Evaluate conditions using the submitted material; use Needs confirmation when a relevant condition cannot be established. Store all active rule outcomes, including an explanation for Not applicable, so coverage is visible.

Retain the existing maximum of twelve active rules per review and the existing story/instruction input limits. Bound pasted policy text to the current short-text review capacity for the first build, with an explicit size message. Do not silently omit policy paragraphs or excess rules. An editor who disables every rule can still request overview, metadata and revision comparison; the UI states that no policy checks ran.

### Story inputs and source reading

Save content format, content kind, source URLs and optional Review context with the submitted revision. Keep legacy notes readable. Existing stories need explicit format/kind confirmation before the redesigned rule-applicability path uses those values; do not backfill a misleading classification.

Read at most five distinct supplied public URLs when an applicable rule needs them. Read the supplied pages or text PDFs themselves; independent search and following linked pages are outside this build. When no rule needs external material, explain that the supplied links were not read for this attempt.

Use an injectable source reader behind the review coordinator. A reader must return bounded, inspectable text plus retrieval metadata, or an explicit failure. Prove the selected provider from ServiceNow before adopting it. Treat public URL syntax, redirects, unsupported content, response size, timeouts and request limits at this boundary. Allow public HTTP(S) source material; reject local/private-network targets and credential-bearing URLs, including redirect targets. These are retrieval controls rather than editorial findings.

Keep only text within configured limits. If a page cannot be fully included, record that limitation and assess only the available scope; conclusions depending on omitted material remain unconfirmed. Set and record these source-size/time limits during the reader proof before enabling the multi-source path. Do not silently truncate a page and claim a complete check.

An excerpt pasted into Review context is labelled editor-supplied material. It does not acquire a successful retrieval status or prove that a linked page was opened. A supplied statement about permission is assessed according to what the approved rule requires; it is not automatically independent proof of permission.

### Frozen evidence and claim support

Each attempt preserves the submitted revision, previous submitted revision when present, exact approved rule versions, policy references, applicable configuration and source snapshots. A source snapshot contains the material actually supplied to the model, stable passage identities, requested/resolved URLs where available, reader identity, retrieval outcome and time, and a content fingerprint. Retain any known cache information; a retrieval time is not the source's publication/update time.

The app verifies each quoted passage against its frozen material. References must identify whether they concern the story, supplied context, company policy or retrieved source. Never invent PDF page locations. Text extraction supports passage references even when reliable PDF page mapping is unavailable.

Under a sourcing rule, examine relevant claims individually. A supported claim cannot clear another claim by association. Match claims to actually retrieved passages automatically. Distinguish support, contradiction, insufficient material and inability to read; map each observation to the company's approved instruction rather than declaring universal truth or falsehood.

A concern cites the rule and the triggering story/context passage, with relevant supporting policy/source passages where available. Absence cannot be quoted: identify the material that creates the question, explain the scope examined, and state what is missing. A rule can include both a potential conflict and unresolved checks; its summary must show both.

### Results, errors and metadata

Keep processing state, review coverage, rule outcomes, currentness and human decisions separate. For an applicable rule, use Potential conflict when a checked finding supports that result; otherwise use Needs confirmation if a material check remains unresolved. Use No issue found only when the requested applicable checks completed without a retained concern. Not applicable requires an explained condition. Derive summaries from validated observations so findings cannot coexist with a falsely clear status.

Every successful substantive review includes an internal overview. A first submission has no revision comparison; it still receives its own review. Later comparisons use the previous submitted version of the same story. Mechanical differences inform Gemini's explanation. Group repeated edits to the same fact and call out dropped attribution. Modified passages show before/after evidence; deletion-only quotations contain the deleted text, with the retained wording represented accurately.

Validate sections independently after parsing a well-formed response and establishing its identities. Retain independently valid analysis if another section or observation fails, and mark the affected scope incomplete. An invalid finding must never be transformed into a clean check. If the overview becomes inaccurate after removing rejected material, withhold it with an explanation instead of showing it as checked. A malformed overall reply or unusable response identity remains a technical failure.

Errors describe the actual problem. Distinguish missing evidence, an unmatched quotation, a contradictory status, an inaccessible source and a provider failure. Where a quotation mismatches, show the proposed quote and the relevant stored passage with an explanation; do not display empty quote/source fields as if a mismatch was demonstrated. Unchecked raw provider text, if retained for diagnosis, stays outside checked review sections and is visibly labelled.

Suggest allowed section/tags and a description grounded in the candidate story. Do not use internal context as public copy or add facts found only in an external source. Exclude materially unconfirmed or flagged assertions from suggested public descriptions. A rule may support a relevant metadata suggestion, but it cannot create an allowed taxonomy value or silently save that suggestion.

### Attempts, history and compatibility

Preserve each attempt and its usable results or errors. Repeated clicks while an attempt runs must not create duplicate model calls or source fetches. An explicit retry is traceable and keeps earlier attempts. A new attempt requests source reading again when applicable; it does not replace earlier source snapshots.

Retain review currentness against the saved story and rule configuration. Changed source content belongs to the new attempt; earlier evidence remains visible as historical material. Policy edits do not rewrite old human decisions. The existing version-specific sign-off rule still governs changed stories.

Extend the request/response contract with a new supported version for the additional inputs and evidence types. Keep existing reviews readable under their recorded version. Preserve stable story/revision identities and existing records. Prototype rules whose approval was never recorded must be labelled accurately and explicitly approved for the redesigned path; do not invent historical approval records.

### Reuse decisions

Keep Gemini and the existing shared application checks. Trial Jina Reader as the first text-returning reader candidate; retain Firecrawl as an alternative if the proof exposes an access or extraction problem. Consider jsdiff for mechanical revision differences after checking SDK compatibility. Use only the reader that passes the agreed proof initially.

Keep the existing local tests. Promptfoo is optional tooling if the evaluation matrix becomes cumbersome. LangExtract is optional research, not a dependency, mandatory benchmark or separate service in this build. Consider it only after a measured policy-extraction gap. PDF.js, Readability and Label Studio remain reference options for later needs.

## Testing Decisions

The approved primary test is the complete Editor flow in ServiceNow: approve rules, save a first story with sources, review, inspect evidence, revise, review again and reopen the older evidence. Write expected outcomes before running Gemini.

For repeatable automated checks, extend the existing review entry point with injected provider responses and an injected source reader. Test the request-to-checked-result behaviour through that coordinator, including frozen inputs and evidence references. Reuse the shared assessment checks exercised by the existing local suite and copied into the ServiceNow build. Exercise setup through its public save/propose/approve actions and the corresponding screens; avoid tests coupled to private helpers or exact generated prose.

| Case | Expected behaviour |
| --- | --- |
| Editor uses a rule unchanged | Saved and approved wording matches the editor's input; later review records that version. |
| Policy has an exception | A proposed check retains the exception or asks for clarification; it does not silently broaden the requirement. |
| Unsupported policy requirement | The obligation remains visible and identifies the required human confirmation. |
| News and opinion use different rules | Applicability follows approved scope and the selected content kind. |
| Headline overstates the body | The finding quotes both relevant passages and the approved rule. |
| Mixed supported and unsupported claims | Each relevant claim receives its own supported explanation or unresolved concern. The rule summary cannot be clear while concerns remain. |
| Bare links include an unrelated page | Relevant source passages are matched automatically; the unrelated page does not establish support. |
| Source contradicts the draft | The review shows both passages and the potential conflict under the applicable rule. |
| Source is missing, blocked or over a limit | State the reason and affected scope; retain other checked results. |
| Supplied note claims permission | Show it as supplied context; apply the actual company rule's evidence requirement. |
| Rule is inapplicable | Explain Not applicable without fabricating an evidence quote. |
| One AI quote is invalid | Reject that observation, explain the actual mismatch and downgrade affected coverage while preserving independent results. |
| Overall reply cannot be parsed | Retain the attempt as failed, keep the draft accessible and offer an explicit retry. |
| Repeated date edit and removed attribution | Group the date change once, quote both versions and identify the dropped source without inventing a title edit. |
| Caption is partly shortened | Describe the retained and deleted wording accurately; do not quote the retained caption as entirely removed. |
| Public description could repeat a flagged claim | Use supported candidate material or leave the suggestion unavailable with a reason. |
| Source or rule changes before another review | New evidence/configuration belongs to the new attempt; the old review still opens its original snapshots. |
| All rules are disabled | Show that policy checks were not requested while preserving available overview, metadata and comparison. |
| Repeated Review clicks | One running attempt performs one bounded set of retrieval/provider work. |
| Everyday Editor tries to change shared policy | Enforce the designated editor capability at the server boundary. |

Carry forward the radio-story failures as regression cases, while keeping the old wording/results identifiable as historical evidence. Add a fresh fictional article, an unrelated script and a revision with expectations prepared before the first run. Use controlled public source fixtures that are clearly labelled fictional. Include a text PDF and changed/missing-page fixtures in the reader proof.

Record expected versus observed findings, exact input and rule versions, provider/model identity, retrieved material, statuses, rejected observations and remaining gaps. Do not declare the feature accurate merely because quotations match. Human evaluation must also assess whether the interpretation is useful and faithful to the policy.

## Out of Scope

- Public-facing publishing, automatic sign-off, automatic legal clearance or independent fact certification.
- Independent web search, recursive crawling, private/login-protected sources, video/audio verification or scanned-document OCR.
- Uploading complete policy handbooks, story PDFs or other files as the first-build submission method; policy and story input remain pasted text. Public text PDFs are supported source candidates.
- Mandatory LangExtract, a new Python/browser service, embeddings, a vector database or an agent orchestration framework.
- A new application scope, multi-company product administration, billing or replacement of teammates' existing workflow tickets.
- Rewriting previous reviews or human approvals to fit the new contract.

## Further Notes

All new implementation slices in this feature are Deon-owned. This includes narrowly scoped AI-related server changes; it does not transfer the team's existing tickets. An integrated whole-app acceptance demonstration still needs those teammates' human workflow and access/history work.

The feature preserves the assignment's wording:

| Assignment wording | This feature's contribution |
| --- | --- |
| “Revision comparisons and editorial policy checks take time.” | Compare saved story versions and reuse company-approved rules across different stories. |
| “Summarize changes” | Explain meaningful edits with before/after evidence. |
| “suggest metadata” | Offer permitted section/tags/description for editor acceptance. |
| “flag potential checklist conflicts” | Show advisory concerns tied to applicable approved rules and passages. |
| “Editors and legal reviewers retain publishing authority.” | Keep AI review separate from the existing version-specific human decision workflow. |
| “App Engine; content and revision records; AI comparison and classification; review workflows; audit history.” | Extend the existing scoped app, revision/review records and evidence history; integrate with the separately owned human/legal workflow. |

The tool comparison contains primary-source links, checked free limits and platform constraints. The implementation proof must test the actual ServiceNow route rather than assume that a package working locally will run inside the platform. Current model/API costs remain subject to the configured account and quota.

References: [approved decisions](policy-redesign-interview.md), [tool comparison](../../docs/15-reusable-tools-research.md), [existing prototype contract](../../docs/03-ai-review-specification.md), [version-specific sign-off decision](../../docs/adr/0001-bind-sign-off-to-the-submitted-revision.md), [build plan](../../PLAN.md).
