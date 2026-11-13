# Suiko AI team tasks

Updated 13 November 2026. This is the team's **task breakdown**, or backlog.

**Deon builds all custom screens. Teammates build the ServiceNow records, business rules, actions and permissions those screens use.** Work in the existing scope, `x_2236136_suiko_ai`. Do not create another app.

The FE IDs are historical names. Their work is now inside ServiceNow. Issue numbers and claim comments stay in place. These are existing claims, not GitHub assignees.

| Ticket | What to build | Existing claim | Issue |
| --- | --- | --- | --- |
| [FE-01](#fe-01-inbox-data-and-filters) | Story list data, search and filters | Najarro · anirak411 | [#1](https://github.com/DeonHolo/suiko-ai/issues/1) |
| [FE-02](#fe-02-archive-restore-and-safe-deletion) | Archive, restore and guarded deletion | MGP · migoreng-punch | [#2](https://github.com/DeonHolo/suiko-ai/issues/2) |
| [FE-03](#fe-03-legal-records-and-read-access) | Legal task fields and access to the submitted copy | Russjie · russtyruss | [#3](https://github.com/DeonHolo/suiko-ai/issues/3) |
| [BE-01](#be-01-editor-decisions) | Current version, status and editor decisions | Najarro · anirak411 | [#4](https://github.com/DeonHolo/suiko-ai/issues/4) |
| [BE-02](#be-02-legal-routing-and-decisions) | Legal routing and version-specific clearance | Russjie · russtyruss | [#5](https://github.com/DeonHolo/suiko-ai/issues/5) |
| [BE-03](#be-03-history-and-permissions) | Human decision history and permission checks | MGP · migoreng-punch | [#6](https://github.com/DeonHolo/suiko-ai/issues/6) |
| [QA-01](#qa-01-rehearse-the-whole-flow) | Test the combined app with ordinary accounts | Available | [#7](https://github.com/DeonHolo/suiko-ai/issues/7) |

## Before touching the shared instance

1. Update your fork from team main using the [team workflow](docs/14-github-team-workflow.md). Make a branch for your ticket.
2. Read your section and the [screen-to-ServiceNow contract](docs/25-workspace-service-contract.md). Give both to your AI. The contract names the responses the custom screens expect.
3. Open **ServiceNow Studio → Suiko AI**. Check the scope. Tell Deon which app files you will change before editing shared files. Coordinate with the teammate whose ticket shares those files.
4. Use a named update set for your ticket when supported. List every table, field, ACL, business rule, API resource, flow, form and view you change, with its record ID. This lets us find the work for export.
5. Use fictional records and regular test accounts. Admin access does not prove permissions work.
6. Have Deon export your Studio work into your branch. Inspect the export together: include your configuration and stable IDs, excluding unrelated work, story data, credentials and the Gemini key.
7. Open a PR with `Closes #YOUR_ISSUE`, changed app files, account roles, exact test steps and expected/actual results. Deon reviews teammate PRs, merges and installs. Recheck your work after installation.

If a screen needs a different response, agree it with Deon and update the contract first. Do not replace custom screens or enable an unfinished capability flag.

## Which screens do we need?

| Screen | Everyday use | Owner |
| --- | --- | --- |
| Story | Draft, saved versions, AI review and human decisions | Deon: screen; BE-01/BE-02: decisions |
| Stories | Find stories and see what is waiting | Deon: screen; FE-01: data |
| Rules | Add, approve, edit and turn checks on or off | Deon |
| Legal Review | Read and respond to the exact assigned copy | Deon: screen; FE-03/BE-02: task and actions |
| Archive | Restore hidden items; eligible admin deletion | Deon: screen; FE-02/BE-03: storage and guards |

Native forms and lists remain useful for setup, inspection and fallback administration. The assignment names capabilities and does not specify a screen technology in the brief we received.

## FE-01 Inbox data and filters

**Own:** story-list API, native inspection view, search and pagination. Pair with BE-01 for story status. Deon owns Stories.jsx.

1. Inspect existing story and revision tables in Studio. Compare them with the contract's Story list response.
2. Agree current-revision and status fields with BE-01. Use one shared definition. Backfill current revision from each story's highest saved version without changing frozen text.
3. Add an Editor-authorized GET resource at `workbench/stories`, accepting `q`, `status` and `cursor`. Use parameterized queries; do not insert user text into encoded queries.
4. Return one row per permitted nonarchived story: ID, title, current version, format, status and last activity. Sort by activity descending, then ID as a stable tie-breaker.
5. Limit pages to 50. Return an opaque next cursor. Reset pagination for a new search/filter. Reject malformed cursors with a useful 400 message.
6. Create a native **Story inspection** list view with title, current revision, status and updated time. This helps inspect the data while Deon owns the public screen.
7. Test as an Editor: find two stories, search part of a title, filter each status and inspect two pages. Confirm no duplicate unchanged rows and no archived stories once FE-02 is installed. Test a non-Editor too.
8. Enable `capabilities.inbox: true` only after the complete API works. Export the API, view, fields and tests for the PR.

**Done when:** the custom Stories screen searches all permitted active stories, filters by status and loads another page using the real API, including after app reinstallation.

**Ask your AI**

```text
I own FE-01 (#1) in Suiko AI. Read TEAM-TASKS.md and docs/25-workspace-service-contract.md, then inspect scope x_2236136_suiko_ai. Help me build GET workbench/stories, title/status filters, stable cursor pagination and a native inspection list. Coordinate BE-01's current-revision/status fields and FE-02's archive fields. Give me Studio steps, changed app-file IDs, permission checks and a two-page test. Do not build React screens, recreate the app or overwrite unrelated work. Export my configuration into my fork's branch for a PR.
```

## FE-02 Archive, restore and safe deletion

**Own:** archive storage/actions and deletion eligibility for stories and rules. Pair with BE-03 on protected history. Deon owns Archive.jsx.

1. Read the contract's archive policy. Archive hides clutter and preserves history. Restored rules return **off** until an editor turns them on.
2. Add archived flag, time and actor to story/rule tables. Add admin-controlled disposable-demo and protected-evidence markers. Ordinary records are not disposable by default. Protect the capstone examples in the AI-23 report.
3. Omit archived records from daily lists. Reject new saves/reviews for archived stories. Exclude archived rules from new reviews while keeping earlier snapshots readable.
4. Add GET `workbench/archive?kind=story|rule&cursor=...`. Return authorized archived items, pagination, server-calculated `can_restore`/`can_delete`, readable retention reason and deletion summary.
5. Add POST `workbench/archive`: archive/restore/delete, kind, ID and expected modification count. Check role, state and modification count on every action. Stale requests return 409.
6. Permit Editors to archive/restore stories and Rules Editors to archive/restore rules. Permanent deletion is admin-only and only from Archive.
7. Compute eligibility on the server. Unused items and explicitly disposable demos may qualify. Retained reviews, protected evidence, human/legal decisions and references from retained records block deletion. Used rules remain protected even when off.
8. Preflight every related record before removal. Do not leave orphaned drafts/reviews. If a complete disposable set cannot be removed safely, explain why and keep it archived. Do not wipe native audit history.
9. Test archive, refresh, restore, duplicate/stale actions and direct unauthorized API requests. Test a protected article, referenced rule, unused draft rule and explicitly disposable demo. Delete only a separate throwaway record.
10. Enable `capabilities.archive: true` only when both kinds and all guards work. Export configuration and tests.

**Done when:** items leave daily lists and can return; direct requests cannot delete retained evidence or bypass admin/Archive restrictions.

**Ask your AI**

```text
I own FE-02 (#2), now ServiceNow archive/restore and guarded deletion. Read TEAM-TASKS.md, docs/25-workspace-service-contract.md and docs/23-acceptance-results.md. Inspect story/rule/revision/review tables. Give me Studio steps for archive fields, GET/POST workbench/archive, safe relationship checks and server-calculated permissions. Preserve protected examples and retained review/human/legal history. Restore rules off. Reject stale actions using expected_modified. Do not build UI or delete existing evidence. Prepare role-based tests and export my changes for a PR.
```

## FE-03 Legal records and read access

**Own:** legal task schema, assigned-reviewer read API and permissions. Pair with BE-02. Deon owns LegalReview.jsx.

1. Agree one task/approval record with BE-02. Inspect what already exists. Prefer a scoped task if it simplifies frozen-version access and exports; do not build competing legal systems.
2. Configure story, exact revision reference, assignee, reason, request actor/time, state, decision note and decision actor/time.
3. Add a Legal Reviewer role if needed. It grants task-specific access, not another everyday newsroom role. Make a legal-only test account.
4. Configure a native inspection form with submitted title, body and notes read-only. The task must read its referenced revision, not the latest story body.
5. Add the separate GET `/api/x_2236136_suiko_ai/v1/legal/tasks`. Without a task ID, return permitted assigned tasks. With `task=ID`, return the task and its frozen revision using the contract.
6. Make `?page=legal&task=ID` usable by a legal-only account without granting Editor access. Restrict the API and record access to assigned copies and appropriate admins; do not grant every legal reviewer broad revision access.
7. Return actions permitted by BE-02's state/authorization checks. Missing/inaccessible tasks must not leak their text.
8. Test assigned and unassigned legal accounts, Editor and outsider through API and native form. Save a newer draft and verify the task still shows the earlier submitted copy.
9. Once decisions are connected, enable `capabilities.legal_review: true` for eligible accounts. Export fields, ACLs, page access, API, inspection form and tests.

**Done when:** a legal-only assigned reviewer reads exactly the submitted copy, while other accounts cannot fetch it through a direct request.

**Ask your AI**

```text
I own FE-03 (#3), now legal-task schema and protected read access. Read TEAM-TASKS.md and docs/25-workspace-service-contract.md. Coordinate the table with BE-02. Give me Studio steps for fields, a native inspection form, legal-only page access and GET legal/tasks. Bind each task to one frozen revision. Do not reuse the Editor-only workbench API for legal-only access or build the custom screen. Show assigned/unassigned permission tests and app-file export steps.
```

## BE-01 Editor decisions

**Own:** current version, status, save behavior, request changes and sign-off. Pair with FE-01 on fields and BE-03 on the decision log.

1. Inspect saveRevision and existing tables. Agree current-revision/status fields with FE-01. Use the contract's five status values.
2. Backfill current revision. Changed text creates a new revision and Needs review. An identical save returns the same revision and preserves human status.
3. Add POST `workbench/workflow/actions` using a shared server action for API/native callers. Accept revision ID, action and note. Get actor from the signed-in session.
4. Implement request_changes with a required note and sign_off with an optional note. Check Editor role and exact current revision again when writing. Stale tabs get 409 and change nothing.
5. Integrate BE-02's gate: once a story has gone to legal, sign-off requires clearance of its exact current revision. Routine stories need no legal task.
6. Record accepted actions once through BE-03's shared history writer. Guard repeated requests so they do not create duplicate decisions.
7. Extend state with workflow status, server-allowed actions, reviewer choices and human history. Allowed buttons must match server checks.
8. AI runs/retries, metadata choices and rule changes must not change human status. AI failure must not block a permitted human decision.
9. Test routine decisions, identical/changed saves, duplicate requests, non-Editor access, stale tabs and the legal gate.
10. Export fields, business rules, actions and tests. Enable `capabilities.workflow: true` when the integrated workflow is usable.

**Done when:** editor decisions identify the current copy, and outdated or uncleared revisions cannot be signed off.

**Ask your AI**

```text
Help me implement BE-01 (#4) in the existing Suiko AI scope. Read TEAM-TASKS.md, docs/25-workspace-service-contract.md, the sign-off ADR and saveRevision. Give me Studio business-rule/API steps for current revision, status, request changes and sign-off. Use the signed-in actor, reject stale versions, preserve identical-save status and use BE-03's shared history writer. BE-02 supplies legal clearance. Do not change AI behavior or build React controls. Include duplicate, two-tab, non-Editor and AI-failure tests and export my configuration for a PR.
```

## BE-02 Legal routing and decisions

**Own:** send-to-legal action, legal responses and fresh-clearance rules. Pair with FE-03's schema and BE-01's decisions.

1. Agree task schema with FE-03 and read the [sign-off decision](docs/adr/0001-bind-sign-off-to-the-submitted-revision.md).
2. Implement send_to_legal within the editor workflow action. Require current revision, eligible reviewer and reason. Validate reviewer on the server; store exact revision and request actor/time.
3. Reuse an existing pending request for that revision instead of duplicating it. Set With legal and retain that this story requires legal clearance on future revisions.
4. Add POST `legal/tasks/decision`. Accept task ID, revision ID, expected modification count, action and note. Only the assignee or appropriate admin can respond. Reject mismatched IDs, stale tasks and duplicate decisions.
5. Support clear and request_changes; require a reason for changes. Save actor/time and append BE-03 history. Never replace the task's revision reference.
6. If its revision is current, clearance sets Ready for sign-off and a change request sets Changes requested. Decisions on old tasks cannot change the latest story status.
7. A new copy of an escalated story keeps old history but needs fresh legal clearance. No automated action signs off or publishes the story.
8. Return permitted actions through the read/state APIs. Legal-only access must not require the Editor role.
9. Test route Version 1, repeat route, clear, save Version 2, reject its sign-off, obtain fresh clearance and sign off. Test an old-task decision after a newer version exists and unassigned/stale requests.
10. Export actions, workflow/business rules and tests. Coordinate shared app files with FE-03 so exports do not overwrite one another.

**Done when:** legal clears one copy and the Editor signs off that same current copy; clearance never transfers to a new revision.

**Ask your AI**

```text
I own BE-02 (#5). Read TEAM-TASKS.md, docs/25-workspace-service-contract.md and the sign-off ADR. Use FE-03's agreed task schema. Help me build send_to_legal, duplicate prevention, legal/tasks/decision, assigned-reviewer checks and current-version clearance. Give Studio steps and a two-version test proving old clearance cannot authorize a new draft. Keep human decisions independent of AI. Do not build UI or create a second legal table. Export my changed app files for a PR.
```

## BE-03 History and permissions

**Own:** shared human-decision log, history readback and combined access tests. Pair with FE-02 on deletion protection.

1. Inspect existing saved drafts, AI requests/results, approved rule versions, sources and metadata choices. Preserve them. Use native history where it records enough; add human decision records where needed.
2. Agree one shared shape/writer with BE-01/BE-02: story, revision, action, actor, UTC time, note and legal task reference when applicable.
3. Prevent ordinary users from rewriting/deleting decisions. Created/updated times alone do not explain a human action.
4. Return permitted decisions in workflow.history with display names and version numbers, consistently ordered. The client formats UTC times for the reader.
5. Enforce Editor, designated Rules Editor, assigned legal-only reviewer and outsider permissions. Provider configuration remains admin-only.
6. Test direct APIs and native record access. Include Editor changing rules, unassigned legal reading/responding, legal-only calling editor state and any non-admin reading provider configuration.
7. With FE-02, protect retained reviews and human/legal history from deletion. Archived rules must remain readable in earlier snapshots.
8. Save a new version, replace a rule and reopen an earlier review plus human decisions. Verify original passages, chosen description, actor and exact version.
9. Put role matrix, HTTP outcomes and record IDs in PR evidence. Export only configuration/tests, without keys, passwords or provider data.

**Done when:** history answers who did what, when and to which copy, and direct requests cannot bypass the screen's restrictions.

**Ask your AI**

```text
I own BE-03 (#6). Read TEAM-TASKS.md, docs/25-workspace-service-contract.md and existing history/ACLs. Help configure a shared human decision log and workflow.history without replacing AI evidence. Coordinate its writer with BE-01/BE-02 and deletion guards with FE-02. Give me a role matrix, exact direct-API tests, Studio steps and exported app-file list. Do not expose secrets or implement custom screens.
```

## QA-01 Rehearse the whole flow

Start after platform APIs and custom screens are installed together.

1. Record installed commit, date, account role, story ID and revision ID. Write expectations before each run.
2. As ordinary Editor, save a draft, run AI, inspect claim/source passages and save an edited description. Leave/reopen it. Ordinary UI should hide model names and raw UTC times.
3. Search/filter Stories and open page two. Return to an unsaved draft without losing it; replacing it must ask first.
4. Request changes, save a revision and sign off a routine story. AI retry must not change human status; AI failure must not block a permitted manual decision.
5. Send a different version to legal. Clear it using the assigned legal-only account. Save a revision as Editor and prove the old clearance cannot sign it off.
6. Get fresh clearance, sign off and inspect both decisions. An unassigned account must neither read the task's draft nor respond.
7. Edit/approve a rule as designated editor. Reopen an old review and verify original rule, sources and chosen metadata remain.
8. Archive/restore a disposable story and unused rule. Restored rule stays off. Delete a separate eligible throwaway as admin. Protected examples and retained human/legal history stay protected.
9. Check keyboard navigation, dialog focus/Escape, labels, narrow-screen overflow and local 12-hour times without seconds.
10. Record screenshots and expected/actual results, including failures. Mark unavailable APIs as blocked. Preserve the accepted capstone evidence.

**Done when:** another teammate can demonstrate first draft through sign-off using ordinary accounts and explain each version's saved evidence.

**Ask your AI**

```text
Help me run QA-01 (#7). Read TEAM-TASKS.md, docs/24-newsroom-workspace.md and docs/25-workspace-service-contract.md. Make a click-by-click checklist with role, record/version, expectation and evidence. Cover AI, Stories, unsaved drafts, human/legal decisions, fresh clearance, history, archive/deletion, access, keyboard and narrow screens. Mark unavailable APIs as blocked. Do not report tests you have not run.
```

## How much of the assignment works?

| Requirement | Evidence available | Whole-app work still needed |
| --- | --- | --- |
| App Engine | Existing scoped app builds and runs on the PDI | Preserve Studio changes in reviewed exports |
| Content and revision records | Saved copies and ordinary-Editor access tested | Current version/status and archive: #1, #2, #4 |
| AI comparison and classification | AI-16–AI-23 implemented and evaluated, including real source reading and optional Decision 1 | Continue assessing model mistakes; connect human workflow |
| Review workflows | Manual AI run, retry and saved history work | Human decisions and legal clearance: #3, #4, #5 |
| Audit history | Frozen AI inputs, rules, sources and chosen metadata | Human action log and wider access tests: #6 |

There is no honest single completion percentage. The AI feature is implemented and evaluated; required human workflow remains open. The new frontend also needs browser inspection and teammate APIs before the combined app is accepted. [AI handoff and Decision 1 result](docs/26-ai-review-handoff.md)
