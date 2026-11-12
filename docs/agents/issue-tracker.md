# Local AI review planning

The user selected local Markdown for the Suiko AI review plan on 11 November 2026. AI planning remains local. The team's separate frontend/backend/QA work has GitHub issues linked from `TEAM-TASKS.md`; that does not move these AI planning tickets to GitHub.

## Locations

- Main plan: `PLAN.md`.
- Specification pointer: `.scratch/ai-review/spec.md`.
- Approved next-build specification: `.scratch/ai-review/company-policy-review-spec.md`.
- Approved next-build breakdown: `.scratch/ai-review/company-policy-review-tickets-proposed.md` (filename retained for existing links).
- Execution and PR evidence: `.scratch/ai-review/implementation-log.md`.
- One draft step per file: `.scratch/ai-review/issues/<NN>-<slug>.md`.
- Established scope/design: `docs/01` through `docs/06`.
- Connection/workflow references: `docs/07` through `docs/09`.

IDs such as `AI-04` stay stable when steps are added or reordered. Dependencies are the explicit `Blocked by` IDs, not the numeric ordering of filenames. Update the step and plan index together.

## State

Implementation steps remain `draft` during planning. The agreed specification can be `ready-for-agent` after scope confirmation. Publish individual implementation tickets as `ready-for-agent` after the user reviews their size and blockers. Later states include `in-progress`, `blocked`, and `done`; record the blocking fact and completion evidence. A draft or ready ticket is not an instruction to start implementation during a documentation-only task.

This records the selected local convention, not a claim that formal skill setup or triage-label configuration has been completed. No new AI GitHub issues or labels were created by this specification/ticket-planning workflow.
