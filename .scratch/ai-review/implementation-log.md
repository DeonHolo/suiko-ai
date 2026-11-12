# Company-policy AI review implementation

**Execution authorized:** 12 November 2026. **Owner:** Deon.

Active goal: implement AI-16 through AI-23 without stopping for routine implementation choices. Ask only for genuinely missing decisions or access. Create a commit and pull request targeting main for each ticket. Deon retains review and merge authority; do not enable automatic merge or merge on his behalf.

The [specification](company-policy-review-spec.md), [approved breakdown](company-policy-review-tickets-proposed.md) and [build plan](../../PLAN.md) are the source of scope. Preserve the existing team tickets and any unrelated work. Do not commit credentials, generated private review output or owner-local deployment tooling.

## Progress

| Ticket | State | Commit / PR | Evidence |
| --- | --- | --- | --- |
| AI-16 | in-progress | pending | Reproduce radio-story failures first. |
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
