# Company-policy AI review implementation

**Execution authorized:** 12 November 2026. **Owner:** Deon.

Active goal: implement AI-16 through AI-23 without stopping for routine implementation choices. Ask only for genuinely missing decisions or access. Create a commit and pull request targeting main for each ticket.

**Updated delivery instruction, 12 November:** Deon authorized the agent to open each PR, read CodeRabbit's review, assess the findings, fix valid problems, run the checks and merge the PR itself. Record reasons for findings not applied. This replaces the earlier instruction to wait for Deon to merge. Do not enable automatic merging or bypass failed checks.

The [specification](company-policy-review-spec.md), [approved breakdown](company-policy-review-tickets-proposed.md) and [build plan](../../PLAN.md) are the source of scope. Preserve the existing team tickets and any unrelated work. Do not commit credentials, generated private review output or owner-local deployment tooling.

## Progress

| Ticket | State | Commit / PR | Evidence |
| --- | --- | --- | --- |
| AI-16 | done; merged | `ab679b7` · [PR #11](https://github.com/DeonHolo/suiko-ai/pull/11) | 50 local tests; SDK/PDI builds; API smoke; three live UI attempts; passing installed persistence/retry test. |
| AI-17 | review fixes verified; PR open | `6eeb194` · [PR #12](https://github.com/DeonHolo/suiko-ai/pull/12) | 64 local checks; SDK/PDI build and smoke; versioned input UI/API checks; link-guard regressions verified in the installed app. |
| AI-18 | in-progress | pending | Five editable starter definitions, exact wording/scope/approval snapshots; server/UI integration next. |
| AI-19 | ready-for-agent | pending | Pasted policy proposals through editor approval. |
| AI-20 | ready-for-agent | pending | Actual PDI source-reading proof and saved source text. |
| AI-21 | ready-for-agent | pending | Claim/source matching, uncertainty and metadata. |
| AI-22 | ready-for-agent | pending | Literal edits and accurate change summaries. |
| AI-23 | ready-for-agent | pending | Full PDI UI evaluation with expectations recorded first. |

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

- Branch: `codex/ai-18-approved-rules`, based on the tested AI-17 branch while PR #12 is reviewed.
- The shared rule-definition module offers the five editable starter templates, preserves manual instructions, validates typed applicability and captures exact approval snapshots. Five focused checks pass. This is not yet wired into the PDI.
- Remaining: immutable saved rule versions, explicit save/approve/enable actions with stale-write checks, legacy approval labels, rule applicability in review input/results, editable UI and installed role/lifecycle tests.
