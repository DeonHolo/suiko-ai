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
| Two editor views | Proposal A stayed open while another view saved B. Approving A produced “This rule changed elsewhere. Reload it before saving or approving.” | The stale action left the prior approved version active. The editor reloaded and explicitly approved the current version. |

## Remaining verification

The same public brief was changed from 11 a.m. to noon after the first two reviews. The final check will review the saved second draft with the replacement rule, inspect the new source snapshot and reopen the original reviews. The browser connection became unavailable before that action.

## Saved evidence

- Article story `89688f4583e4db106fffc629feaad327`.
- First review `1a68438583e4db106fffc629feaad3e3`, Gemini 3.5 Flash-Lite.
- Revised review `1a88078583e4db106fffc629feaad3e1`, Gemini 3.1 Flash-Lite.
- Script story `eaa8c78583e4db106fffc629feaad33e`, review `c3a84b8583e4db106fffc629feaad338`, Gemini 3.5 Flash-Lite.
- Local inputs, full saved responses and screenshots are under `ai-review/output/ai-23-2026-11-13/`.

## Team handoff

The AI feature provides editable approved rules, policy-to-check suggestions, saved content and revisions, source reading, claim/source comparison, metadata suggestions and inspectable review history. Editors choose their metadata and keep publishing authority.

The assignment also needs the human review workflow. The seven teammate issues are still open. FE-01 adds the Inbox. FE-02 connects it to the existing Story screen. FE-03 builds the Legal Review form. BE-01 adds editor decisions, BE-02 adds legal routing, and BE-03 adds wider human-action history and access checks. QA-01 rehearses the combined demo. [Claim a team ticket](../TEAM-TASKS.md)

The next model-quality improvement to investigate is the permission result. The evidence and next action were useful, but the label should match the approved instruction. The saved script preserves that example for a future test.
