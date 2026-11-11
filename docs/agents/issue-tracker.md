# Local AI review planning

The user selected local Markdown for the Suiko AI review plan on 11 November 2026. No external issue tracker has been configured for this workspace.

## Locations

- Main plan: `PLAN.md`.
- Specification pointer: `.scratch/ai-review/spec.md`.
- One draft step per file: `.scratch/ai-review/issues/<NN>-<slug>.md`.
- Established scope/design: `docs/01` through `docs/06`.
- Connection/workflow references: `docs/07` through `docs/09`.

IDs such as `AI-04` stay stable when steps are added or reordered. Dependencies are the explicit `Blocked by` IDs, not the numeric ordering of filenames. Update the step and plan index together.

## State

Implementation steps remain `draft` during planning. Later states can be `ready-for-agent`, `in-progress`, `blocked`, and `done`; record the blocking fact and completion evidence. A draft is not permission to run its future commands.

This records the selected local convention, not a claim that formal skill setup, triage-label configuration, or ticket approval has been completed. No GitHub issues or labels were created.
