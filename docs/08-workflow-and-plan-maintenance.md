# Workflow and maintaining the plan

**Current stage: local offline foundation implemented; integration planning continues** · **Tracking: local Markdown, confirmed by user**

## Selected workflow

Use **primary-source research → recorded vocabulary and decisions → reviewed specification → small dependency-aware work steps → tested implementation when requested**.

This project is already bounded enough to plan directly. We do not need a broad discovery project, an autonomous publishing agent, or a new external tracker to begin. Research and decisions remain separate from building.

The user-invoked [Ask Matt router](<C:/Users/Deon Holo/.agents/skills/ask-matt/SKILL.md>) recommends a documented interview/spec/ticket path for work in a local directory. The relevant skills were read before selecting this route.

| Skill / stage | Use in this project | Current status |
| --- | --- | --- |
| [Ask Matt](<C:/Users/Deon Holo/.agents/skills/ask-matt/SKILL.md>) | Select a coherent workflow | Consulted. |
| [Research](<C:/Users/Deon Holo/.agents/skills/research/SKILL.md>) | Investigate platform facts against official sources and save cited findings | Applied to the PDI connection research. |
| [Grill with docs](<C:/Users/Deon Holo/.agents/skills/grill-with-docs/SKILL.md>) and [Domain modeling](<C:/Users/Deon Holo/.agents/skills/domain-modeling/SKILL.md>) | Resolve actual decisions and keep language consistent | First-build workflow confirmed with Deon on 12 November. The plan, glossary, and sign-off decision capture the result. |
| [To spec](<C:/Users/Deon Holo/.agents/skills/to-spec/SKILL.md>) | Consolidate agreed requirements after decisions settle | Existing AI spec is a draft; formal publication/readiness is deferred. |
| [To tickets](<C:/Users/Deon Holo/.agents/skills/to-tickets/SKILL.md>) | Turn settled behavior into independently verifiable slices with blockers | Step files are drafts for review, not approved implementation tickets. |
| [ServiceNow's official now-sdk skill](https://github.com/ServiceNow/sdk/blob/master/skills/now-sdk/SKILL.md) | Consult project-version documentation and live instance facts during later SDK work | Reviewed as the platform-specific companion; not installed or executed here. |

The official SDK skill's orientation depends on an actual Fluent project and its SDK version. This workspace has no `now.config.json` yet. When that project is created, read its installed version's guidance and command help before editing or querying; the upstream skill documents version requirements. [Official SDK skill](https://github.com/ServiceNow/sdk/blob/master/skills/now-sdk/SKILL.md)

## Why the plan is editable

[PLAN.md](../PLAN.md) is the index. Each step has one local file under `.scratch/ai-review/issues/`, with a stable ID, owner, blockers, checklist, and completion evidence. The [local tracking convention](agents/issue-tracker.md) records that choice.

To change work later:

1. Edit the step's behavior and completion checks.
2. Update its blockers and the index table if the order changes.
3. Add a new ID for new work; do not renumber existing references.
4. Record changed assumptions in the decision register.
5. Update affected contract/prompt/example versions together.

Preserve completed evidence when reopening a step. Record the result and evidence when a build step is demonstrated. Update the owner in the step and index when a responsibility changes.

## Readiness versus permission to start

The user authorized a first local implementation slice. AI-04 is complete as a fixed-response validation spike against active draft 0.2.0; AI-02 remains open for team agreement. Other implementation steps remain draft. The module is tested through its public review interface using a fixed provider adapter. Before instance work, settle the target app, route, ownership, and specific step being started.

The formal Matt workflow's setup and ticket publication include additional configuration/review choices. We have not claimed that setup is complete, created `AGENTS.md`/`CLAUDE.md`, configured triage labels, published GitHub issues, or marked tickets `ready-for-agent`. The user-approved local planning convention is sufficient for these draft documents; complete formal setup if those engineering flows are adopted for execution.

## Decision quality

For material choices, record UX, DX, and AX benefits together. Prefer one understandable review contract and reproducible source identity. A new integration should make review clearer for editors, easier to diagnose for teammates, and more predictable for authorized agents. Test those benefits during the corresponding step rather than declaring them achieved from the plan alone.
