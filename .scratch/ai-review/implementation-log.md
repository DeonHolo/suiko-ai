# Company-policy AI review implementation

**Execution authorized:** 12 November 2026. **Owner:** Deon.

Active goal: implement AI-16 through AI-23 without stopping for routine implementation choices. Ask only for genuinely missing decisions or access. Create a commit and pull request targeting main for each ticket.

**Updated delivery instruction, 12 November:** Deon authorized the agent to open each PR, read CodeRabbit's review, assess the findings, fix valid problems, run the checks and merge the PR itself. Record reasons for findings not applied. This replaces the earlier instruction to wait for Deon to merge. Do not enable automatic merging or bypass failed checks.

The [specification](company-policy-review-spec.md), [approved breakdown](company-policy-review-tickets-proposed.md) and [build plan](../../PLAN.md) are the source of scope. Preserve the existing team tickets and any unrelated work. Do not commit credentials, generated private review output or owner-local deployment tooling.

## Progress

| Ticket | State | Commit / PR | Evidence |
| --- | --- | --- | --- |
| AI-16 | done; merged | `ab679b7` · [PR #11](https://github.com/DeonHolo/suiko-ai/pull/11) | 50 local tests; SDK/PDI builds; API smoke; three live UI attempts; passing installed persistence/retry test. |
| AI-17 | done | `f1ce321` · [PR #12](https://github.com/DeonHolo/suiko-ai/pull/12) | 64 local checks; SDK/PDI build and smoke; versioned input UI/API checks; link-guard regressions verified in the installed app. |
| AI-18 | done | `c9c8790` · [PR #13](https://github.com/DeonHolo/suiko-ai/pull/13) | 73 local checks, installed role and rule lifecycle tests, live headline and permission examples. |
| AI-19 | done | `f11c6de` · [PR #14](https://github.com/DeonHolo/suiko-ai/pull/14) | 78 local checks, installed policy and role checks, and a live policy proposal used in a story review. |
| AI-20 | done | `24845b6` · [PR #15](https://github.com/DeonHolo/suiko-ai/pull/15) | 84 local tests, five live link outcomes, preserved earlier source text after a fresh fetch. |
| AI-21 | done | `5f9cf3f` · [PR #16](https://github.com/DeonHolo/suiko-ai/pull/16) | Per-claim evidence, mixed outcomes, saved metadata, and live Decision 1 confidence. |
| AI-22 | implemented and verified | [PR #17](https://github.com/DeonHolo/suiko-ai/pull/17) | Library and caption comparisons with exact saved text. First drafts and unchanged text produce no change entries. |
| AI-23 | final UI reopen pending | [PR #18](https://github.com/DeonHolo/suiko-ai/pull/18) | Fresh UI article, script and revision, stale approval, source-change API history and installed role/failure tests. |

## Working notes

- The eight local ticket files were published after Deon approved their size and dependencies.
- Tool selection: existing Gemini and validators; trial a text-returning reader such as Jina; verify a standard text-difference library in the SDK. LangExtract remains optional and is not an initial dependency.
- Scope-specific setup, source and review tests belong to these tickets. Whole-app Inbox, human/legal decisions and wider history/access remain coordinated with the team.

## AI-16 delivery

- Branch: `codex/ai-16-partial-reviews`.
- Planning baseline commit: `3f84eb0`.
- Shared checked-result handling now retains independent sections, reconciles rule statuses with findings, distinguishes missing evidence from mismatched quotes, and preserves rejected-quote diagnostics.
- The PDI stores the checked result rather than leaving the raw provider reply as the successful saved output. Failed attempts now also display their recorded model and frozen input.
- Local checks: 42 passed, including both minimized fictional radio replies from AI-11, independent overview evidence, and rejected wording inspection. Those replays test validation behaviour; they do not establish that Gemini found every issue.
- SDK 4.14.0 build and frozen-key build passed. The jsonc-parser dependency produced SDK wrapper warnings about guarded browser globals; the installed API smoke check passed. A live review is being used to verify the parsing/result path as well.
- Installation completed on the existing app identity; page/API reachable, two existing rules and provider configuration preserved.
- Pre-run expectations and screenshot/output are local under `ai-review/output/ai-16-2026-11-12/`. Three unchanged-radio reviews were clicked and inspected in the in-app browser. [Public evidence summary](../../docs/16-review-reliability-evidence.md). The final direct 3.5 attempt retained metadata while withholding an overview with a mistyped version reference. The earlier 3.1 attempt retained both expected sourcing concerns.
- Remaining semantic gap for AI-21/AI-23: model outcomes varied, with unsupported assumptions that the station sourced the six-week duration and 420 registrations. Do not count a passed quote check as source-support accuracy.
- AX follow-up for AI-17: use short model-facing version labels while retaining actual ServiceNow record identities in saved provenance, reducing long-ID transcription errors without weakening exact-passage checks.
- Initial AI-16 code/evidence were committed as `1469343` and published in PR #11. Deon's later instruction added the CodeRabbit/fix/test/agent-merge loop.
- All four inline CodeRabbit findings were applicable and corrected. The installed server test now passes with actual records and generated validators: partial checked result, checklist mismatch, unreadable JSON, released lock, intact draft, retry and reopened history. See the public report's named evidence. AI-16 has 50 local checks; the preserved combined AI-17 build has 62.
- Added the future stale-rule approval case to AI-23. React child-key warnings were not applied: the mapped outer article is already keyed. Historical responses remain readable; new attempts require overview references.
- Deon confirmed useful advisory judgments, visible confidence and an easy editor experience as the goal. AI-21 includes the approved Decision 1 trial. No absolute-truth completion gate is required.

## AI-17 delivery

AI-16 merged at 20:35 Singapore on 12 November after checks succeeded on `d9cedf0`. The follow-up review's evidence wording was corrected; its fixture-cleanup suggestion was declined after verifying ATF rollback and no leftover fixture stories. Local main was pulled successfully before integrating it into this branch.

- Branch: `codex/ai-17-story-inputs`; original code commit `6eeb194`. AI-16 corrections were merged into this branch while preserving its installed schema and records.
- Explicit format/kind, separate bounded source URLs and optional Review context are saved per revision. Classified 0.3 requests preserve legacy 0.2 baselines/reviews.
- Short model-facing draft-N labels map to actual ServiceNow record identities in saved provenance.
- 62 combined local checks passed, along with SDK/frozen-key build, installation and page/API smoke. Article/script creation, article version 2, switching stories and legacy history were verified through the in-app browser and saved API readback. A live direct 3.5 article review retained its overview and correctly identified the context edit.
- Source links remain visibly Not read. Actual retrieval belongs to AI-20. Private inputs, assertions and screenshots are under `ai-review/output/ai-17-2026-11-12/`.
- Both inline CodeRabbit findings were valid: fragment access parameters and serialized URL-list overflow. New tests failed before the fixes and passed afterward. The installed API rejected both examples with existing versions/reviews unchanged; the form showed the access-link message. No Gemini calls were made for these checks. The local suite now has 64 passing checks.

## AI-18 work in progress

- AI-17 merged as `f1ce321` after checks passed on `dcefc30`; both valid CodeRabbit findings were fixed and verified before merging.
- Branch: `codex/ai-18-approved-rules`. The rule-definition module offers five editable starters, unchanged manual instructions, typed applicability and exact approval snapshots.
- Saved rule proposals, explicit approval, disable/re-enable, stale-write checks, legacy labels and the editor panel are implemented. Review input uses approved versions; a pending replacement stays separate. There are 73 passing local checks and a successful SDK build.
- Installed verification passed: suite result `bd7881c183289b106fffc629feaad36e`, including dedicated non-admin designated-editor and everyday-editor accounts. Stale edits and approvals were rejected; retained interrupted proposals did not block a fresh version. Runner settings were restored.
- Two live browser reviews caught the fictional headline/body mismatch and excluded the Sponsored-only rule. A review made while replacement wording awaited approval still used version 1. After version 2 approval, both earlier reviews retained version 1. Browser disable/re-enable also passed. [Evidence](../../docs/18-approved-rule-setup.md).
- The description safeguard over-withheld accurate body text because it was co-cited with the bad headline. This is recorded for AI-21 rather than treating the useful review as a failed truth check.
- CodeRabbit found that a fresh token could overwrite approval metadata and that the native test depended on available rule slots. The fix rejects a second approval of the same version and checks 11 and 12 other active rules using a controlled count. The installed suite passed as `217015c183689b106fffc629feaad395`.
- A live footage example initially asked for the correct permission record with the wrong status. The clarified prompt and Gemini 3.1 fallback showed **Needs confirmation** on the same saved script. Both runs are recorded. The history test suggestion is covered by actual browser reopen and saved-request readback after the replacement approval.
- The follow-up review caught a status notice that could point to an empty concerns card. The notice now names incomplete sections and directs the editor to the recorded reason.
- GitHub validation and CodeRabbit completed on `eef3d7a`. The three review threads were resolved. PR #13 merged on 12 November at 22:41 Singapore.

## AI-19 delivery

- Branch `codex/ai-19-policy-proposals`. Saved policy copies remain inspectable after edits. The designated editor can use a passage as written or ask Gemini for proposals with quotes and questions. A proposal needs explicit approval before use.
- Native ServiceNow tests passed with separate non-admin accounts. Browser testing saved and reopened the Juniper Cut handbook, discarded a suggestion, approved an edited proposal, saved a revised handbook and reviewed a fictional article against the approved version.
- The original Gemini schema returned 400. The leaner schema passed a direct 3.5 test and the full ServiceNow example. Gemini preserved the vote and footage exceptions and asked about the sponsor conflict. One vague clause was absent from the reply, so the proposal screen now surfaces uncited passages for the editor.
- [Setup and observed results](../../docs/19-company-policy-setup.md). No additional extraction service was needed for these cases.
- CodeRabbit caught the source-checkbox save guard and missing fallback. Both were fixed. The installed suite `4e1b550d83a89b106fffc629feaad30f` proved fallback and unchanged rules after a failed reply. The browser verified the save guard and reopened the original handbook from a saved review. The final handbook run asked about the vague clause. GitHub checks passed and PR #14 merged as `f11c6de`.

## AI-20 delivery

- Branch `codex/ai-20-source-evidence`. The installed app read a fictional brief, a text PDF, an unrelated webpage, a missing link and a long webpage. The first review kept its overview with a 404 and a partly read source visible.
- A retry saved source material while Gemini was busy. The external reader initially returned 6 p.m. after the fixture was changed. Once it returned the fresh page, a new review saved 7 p.m. and a different fingerprint. The browser reopened the earlier 6 p.m. copy.
- [Reader setup and evidence](../../docs/20-source-reading.md). The Decision 1 trial for AI-21 used the frozen first review.

## AI-21 delivery

- Branch `codex/ai-21-claim-evidence`. ServiceNow supplies retrieved text to the review. Each claim has a saved rule, draft quote, source or context quote, and suggested action. The public description guard checks the flagged passage and can retain nearby supported text.
- The nine-case Decision 1 trial matched eight expected answers, as did Flash-Lite. The installed rerun showed both models' judgments about an unannounced exhibition time. Decision 1 returned Needs confirmation at 97% while Flash-Lite called it a conflict. The editor can open the exact source and confidence distribution.
- The live example supported the seat count, found a conflicting screening time, and separated the unsupported price from the editor's note. The rerun's description omitted all three disputed or unconfirmed details. [Results](../../docs/21-claim-and-source-review.md).
- CodeRabbit's source-gap, redirect, confidence-limit, evidence and description findings were assessed and fixed. The installed suite `9aafcf458328db106fffc629feaad371` passed the added saved-review cases. GitHub checks passed on `8ea6da1`, and PR #16 merged as `5f9cf3f`.

## AI-22 delivery

- The ServiceNow SDK ran jsdiff's synchronous word comparison and saved the literal changes. The editor can inspect these alongside Gemini's summaries.
- The library comparison grouped the date update, identified the removed attribution and kept the estimate out of the description. The shortened caption kept the cast-interview sentence and showed only the removed sponsorship wording and the release-day change.
- A version with the same text and a changed content kind reported unchanged text. A source-link-only edit showed a literal link addition even though Gemini omitted it from the summary. [Results and limits](../../docs/22-revision-comparisons.md).
- CodeRabbit caught whole-caption additions/removals and the numeric grouping of unrelated facts. One-sided quotations now preserve the text matched to the opposite version. Gemini groups related facts in its explanation, and the checker retains independent summaries. The installed suite `9aafcf458328db106fffc629feaad371` verified the caption and independent-date cases.

## AI-23 evaluation

- [Expected cases](../../docs/23-acceptance-cases.md) were committed before the first live review. The browser runs matched the expected article headline, time, seats and price findings. The revised article retained the corrected details. The unrelated script identified the outside photograph and next action, with its status mismatch recorded.
- Two editor views verified a stale approval. B remained pending until it was explicitly approved after reload. The supplemental API history review used the noon source and rule version 3, while earlier reviews retained the 11 a.m. source, version 1 and the saved metadata choice.
- The installed suite passed the fixed-response failures and the non-admin Editor/Rules Editor boundary. [Results and team handoff](../../docs/23-acceptance-results.md).
- The final on-screen history reopen awaits the in-app browser connection. All seven teammate issues remain open and unassigned.
