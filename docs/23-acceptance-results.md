# Newsroom review results

The [expected cases](23-acceptance-cases.md) were committed before the live reviews. The publisher, stories and brief are fictional. The first article, revision, separate script and setup actions used the ServiceNow workbench in the in-app browser. The supplemental API review and subsequent browser inspection are identified below.

| Case | What Suiko returned | Assessment |
| --- | --- | --- |
| Company-policy setup | Two proposed rules with quotes from the relevant handbook paragraphs and appropriate article/script scope. The editor approved the headline proposal, edited the rights proposal, and wrote a separate source rule. | The original wording remained available and every active rule had an explicit approval. |
| First article | An overview, the headline/proposal mismatch, a 10 a.m. versus 11 a.m. conflict, support for 40 seats, and a request to confirm the three-dollar fee. | These matched the written expectations. Decision 1 agreed on the time conflict, seats and unconfirmed price. |
| Broken source | A separate unreadable-link card alongside the usable brief and review. | The failed link kept its own retrieval outcome. |
| Metadata choice | Local news, Community events, and a description of the proposed room. The editor saved a different description. | The suggested description omitted the disputed time and fee. The editor's wording was saved with the first review. |
| Revised article | Three changes covering the headline, time and admission wording. Support for the corrected time and seats. | The new headline kept the proposal status. Gemini 3.5 was busy, so this review used the recorded Gemini 3.1 Flash-Lite fallback. |
| Unrelated script | A workshop overview and a permission follow-up for the outside photograph. Article-only rules were marked outside scope. | The useful finding matched the photo and action. Gemini called it Potential conflict where the policy requested Needs confirmation. It also put a rule identifier in the overview and returned a concern reference that required a diagnostic. |
| Two editor views | Proposal A stayed open while another view saved B. Approving A produced “This rule changed elsewhere. Reload it before saving or approving.” | B remained pending and version 1 stayed active. After reload, the screen showed pending version 3. The admin explicitly approved that version. The UI account was System Administrator and had rule-management access. Dedicated non-admin roles were checked in the installed suite below. |
| Changed source and rule | A supplemental API review used the same saved second draft, the noon source and headline rule version 3. It found the new time conflict. The browser then reopened that review and both earlier reviews. | The panel showed noon and version 3 for the new review, and 11 a.m. and version 1 for the earlier reviews. The first review kept the editor's saved description and original policy passage. |
| Review currentness | Earlier reviews showed the changed-rules notice. The latest review matched the approved configuration. Turning its headline rule off displayed the notice immediately, and restoring the rule cleared it. | Both actions were verified in the same browser session without reloading the page. The selected review and unsaved story text survived. The test text was then removed without saving a new version. |

## Final screen checks

Completed on 13 November 2026 after the in-app browser connection returned. The original article review, earlier revision review and changed-source review all reopened with their recorded evidence. The first review also displayed the editor's saved description and original company-policy passage. The earlier two showed the changed-rules notice; the latest did not.

CodeRabbit caught a same-session refresh problem. Approving or switching a rule on or off now reloads the saved review statuses while preserving the selected story, selected review and unsaved draft. The browser verified the disable/restore path against review `c20d0b018328db106fffc629feaad359`: the notice appeared, then cleared, and the unsaved text stayed intact. The headline rule was restored and the unsaved test text removed. No new Gemini call or story version was needed for this check. If the status refresh fails, the app explains that the rule change was saved and asks the editor to reload the statuses.

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
- Final browser evidence includes `original-history-ui`, `earlier-revision-history-ui` and `latest-history-ui` snapshots/screenshots, plus `same-session-rule-off-ui.json`, `same-session-rule-restored-ui.json` and `final-review-ui.png`.

## Team handoff

The AI feature provides editable approved rules, policy-to-check suggestions, saved content and revisions, source reading, claim/source comparison, metadata suggestions and inspectable review history. Editors choose their metadata and keep publishing authority.

The assignment also needs the human review workflow. The seven teammate issues remain open. Their updated scope is ServiceNow platform work: FE-01 supplies story-list data, FE-02 archive/restore/deletion, FE-03 legal records/read access, BE-01 editor decisions, BE-02 legal routing and BE-03 human history/access. Deon owns all custom screens. QA-01 rehearses the combined app. [Detailed team steps](../TEAM-TASKS.md) · [AI handoff including Decision 1](26-ai-review-handoff.md)

The next model-quality improvement to investigate is the permission result. The evidence and next action were useful, but the label should match the approved instruction. The saved script preserves that example for a future test.
