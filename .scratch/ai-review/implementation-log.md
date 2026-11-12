# Company-policy AI review implementation

**Execution authorized:** 12 November 2026. **Owner:** Deon.

Active goal: implement AI-16 through AI-23 without stopping for routine implementation choices. Ask only for genuinely missing decisions or access. Create a commit and pull request targeting main for each ticket.

**Updated delivery instruction, 12 November:** Deon authorized the agent to open each PR, read CodeRabbit's review, assess the findings, fix valid problems, run the checks and merge the PR itself. Record reasons for findings not applied. This replaces the earlier instruction to wait for Deon to merge. Do not enable automatic merging or bypass failed checks.

The [specification](company-policy-review-spec.md), [approved breakdown](company-policy-review-tickets-proposed.md) and [build plan](../../PLAN.md) are the source of scope. Preserve the existing team tickets and any unrelated work. Do not commit credentials, generated private review output or owner-local deployment tooling.

## Progress

| Ticket | State | Commit / PR | Evidence |
| --- | --- | --- | --- |
| AI-16 | tested; review corrections ready | `1469343` plus corrections · [PR #11](https://github.com/DeonHolo/suiko-ai/pull/11) | 50 local tests; SDK/PDI builds; API smoke; three live UI attempts; passing installed persistence/retry test. |
| AI-17 | ready-for-agent | pending | Saved format/kind/source/context inputs. |
| AI-18 | ready-for-agent | pending | Approval, applicability and historical rule versions. |
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
