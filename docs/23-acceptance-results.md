# Newsroom review results

The [expected cases](23-acceptance-cases.md) were committed before the live reviews. The publisher, stories and brief are fictional. The runs below used the ServiceNow workbench in the in-app browser.

| Case | What Suiko returned | Assessment |
| --- | --- | --- |
| Company-policy setup | Two proposed rules with quotes from the relevant handbook paragraphs and appropriate article/script scope. The editor approved the headline proposal, edited the rights proposal, and wrote a separate source rule. | The original wording remained available and every active rule had an explicit approval. |
| First article | An overview, the headline/proposal mismatch, a 10 a.m. versus 11 a.m. conflict, support for 40 seats, and a request to confirm the three-dollar fee. | These matched the written expectations. Decision 1 agreed on the time conflict, seats and unconfirmed price. |
| Broken source | A separate unreadable-link card alongside the usable brief and review. | The failed link kept its own retrieval outcome. |
| Metadata choice | Local news, Community events, and a description of the proposed room. The editor saved a different description. | The suggested description omitted the disputed time and fee. The editor's wording was saved with the first review. |
| Revised article | Three changes covering the headline, time and admission wording. Support for the corrected time and seats. | The new headline kept the proposal status. Gemini 3.5 was busy, so this review used the recorded Gemini 3.1 Flash-Lite fallback. |
| Unrelated script | A workshop overview and a permission follow-up for the outside photograph. Article-only rules were marked outside scope. | The useful finding matched the photo and action. Gemini called it Potential conflict where the policy requested Needs confirmation. It also put a rule identifier in the overview and returned a concern reference that required a diagnostic. |
| Two editor views | Proposal A stayed open while another view saved B. Approving A produced “This rule changed elsewhere. Reload it before saving or approving.” | B remained pending and version 1 stayed active. After reload, the screen showed pending version 3. The admin explicitly approved that version. The UI account was System Administrator and had rule-management access. Dedicated non-admin roles were checked in the installed suite below. |
| Changed source and rule | A supplemental API review used the same saved second draft, the noon source and headline rule version 3. It found the new time conflict. | API readback confirmed that the earlier reviews still held their 11 a.m. source and rule version 1. The first review kept the editor's saved description. |
| Review currentness | Final acceptance found a missing notice for reviews that used an earlier rule configuration. The API now reports whether the saved approvals match today's enabled rules, and the panel has a notice for a changed configuration. | API readback identified the new review as current and the earlier two as using older rules. Every saved input, result and metadata choice remained identical. The notice's on-screen check is pending the browser reconnect. |

## Remaining verification

The browser connection became unavailable before reopening the changed-source result and the original reviews on screen. The supplemental API check above passed. The final UI reopen is pending.

CodeRabbit also caught a same-session refresh problem. Approving or switching a rule on or off now reloads the saved review statuses while preserving the selected story, selected review and unsaved draft. If the refresh fails, the screen explains that the rule change was saved and asks the editor to reload the statuses. This fix passed the build and installation checks. Its on-screen check remains pending alongside the history reopen.

## Repeatable ServiceNow checks

Installed suite `caf4df418368db106fffc629feaad36b` passed. It used saved story/review records and injected source-reader and provider replies. The earlier suites `9aafcf458328db106fffc629feaad371` and `0b6c0b8d83e4db106fffc629feaad316` also passed. The combined local suite has 99 passing checks.

| Case | Verified result |
| --- | --- |
| Bad source quotation | The affected claim became unresolved. The supported claim, overview and saved diagnostic survived. |
| Contradictory rule status | A clear rule summary paired with a retained headline concern was reconciled to a conflict. |
| Partial reply | Usable sections remained available after an evidence problem, and the attempt reopened from history. |
| Missing and redirected source | A 404 stayed unavailable. The opened URL and actual passages were saved with the redirect. |
| Editor access | A dedicated non-admin everyday Editor could save and reopen a story. It received 403 responses for rule/policy setup actions. |
| Designated editor access | A dedicated non-admin Rules Editor could save, approve and replace rules. The suite checked stale edits, stale approvals and preserved approval history. |
| Comparison coverage | Whole-caption additions/removals were excluded while actual edits survived. Independent dates retained their summaries. A missing attribution summary or ambiguous repeated date quote kept comparison coverage incomplete. |
| Changed rule configuration | The saved review was current before a rule was disabled, then became out of date without rewriting its recorded rules. |

## Saved evidence

- Article story `89688f4583e4db106fffc629feaad327`.
- First review `1a68438583e4db106fffc629feaad3e3`, Gemini 3.5 Flash-Lite.
- Revised review `1a88078583e4db106fffc629feaad3e1`, Gemini 3.1 Flash-Lite.
- Script story `eaa8c78583e4db106fffc629feaad33e`, review `c3a84b8583e4db106fffc629feaad338`, Gemini 3.5 Flash-Lite.
- Changed-source API review `c20d0b018328db106fffc629feaad359`, Gemini 3.1 Flash-Lite.
- Headline rule `c1484b4583e4db106fffc629feaad326`. Proposal A is version 2, `c4e8034583e4db106fffc629feaad39a`, which remains unapproved. Replacement B is version 3, `49f843c583e4db106fffc629feaad3dd`, which the admin explicitly approved after reloading.
- Local inputs, full saved responses and screenshots are under `ai-review/output/ai-23-2026-11-13/`.

## Team handoff

The AI feature provides editable approved rules, policy-to-check suggestions, saved content and revisions, source reading, claim/source comparison, metadata suggestions and inspectable review history. Editors choose their metadata and keep publishing authority.

The assignment also needs the human review workflow. The seven teammate issues are still open. FE-01 adds the Inbox. FE-02 connects it to the existing Story screen. FE-03 builds the Legal Review form. BE-01 adds editor decisions, BE-02 adds legal routing, and BE-03 adds wider human-action history and access checks. QA-01 rehearses the combined demo. [Claim a team ticket](../TEAM-TASKS.md)

The next model-quality improvement to investigate is the permission result. The evidence and next action were useful, but the label should match the approved instruction. The saved script preserves that example for a future test.
