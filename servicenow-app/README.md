# Suiko AI on ServiceNow

This is the SDK project for the team's developer instance. Deon owns the custom screens and AI behavior. Teammates own the ServiceNow data, archive, human/legal actions and access work in [Team tasks](../TEAM-TASKS.md). Follow the [screen/API contract](../docs/25-workspace-service-contract.md). The build also takes shared review schemas, prompts and quote checks from the workspace.

## App identity

| Setting | Value |
| --- | --- |
| Instance | https://dev309702.service-now.com |
| App | Suiko AI |
| Scope | `x_2236136_suiko_ai` |
| App ID | `b47095969f3848a7bdf385b3650b68c2` |
| SDK | `4.14.0` |
| Review page | [Open Suiko AI](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) |
| API | `/api/x_2236136_suiko_ai/v1/workbench` |

The app ID in `now.config.json` and record IDs in `src/fluent/generated/keys.ts` identify the same records across builds. Keep both in the team repository.

## Where to edit

| Change | Source |
| --- | --- |
| Navigation and Story | `src/client/app.jsx`, `routes.js` and `app.css` |
| Review results | `src/client/ReviewPanel.jsx`, `ClaimChecks.jsx` and `Sources.jsx` |
| Rules and policy | `src/client/Rules.jsx` and `PolicySetup.jsx` |
| App page and navigation | `src/fluent/` |
| Save, review, rules, and metadata actions | `src/server/workbench.ts` |
| Shared quote and identity checks | `../ai-review/src/assessment-checks.js` |
| Prompt | `../prompts/editorial-review-v0.4.md` plus the workbench instructions in `scripts/prepare-review.mjs` |
| Request and assessment schemas | `../contracts/` |

The `src/server/generated/` files are prepared from those sources each build. Edit their source files when changing the prompt or checks.

## Set up another computer

Install Node 24 and restore both packages from the workspace root.

```powershell
npm --prefix ai-review ci
npm --prefix servicenow-app ci
npm --prefix ai-review test
npm --prefix servicenow-app run test:ui
npm --prefix servicenow-app run build -- --frozenKeys
```

GitHub runs these checks on PRs. Deon installs reviewed builds and manages the Gemini configuration on the shared PDI.

## Gemini and editorial rules

The Gemini key is stored in the instance's encrypted provider configuration. Provider setup adds the two starter rules when the rules table is empty. An editor can change or disable them, and each review retains the rule versions it used.

Gemini 3.5 Flash-Lite is the default. If it returns HTTP 503, the server makes one attempt with 3.1 Flash-Lite. The model remains in saved data and optional Technical details. New editor reviews use only the main model. Decision 1 remains in backend experiment code and saved historical results; legacy editor requests cannot enable it. Other failures leave a retryable result on the same saved draft. [Decision and rationale](../docs/30-decision-1-retirement.md) · [Results and limits](../docs/26-ai-review-handoff.md)

## Local preview

The preview requires an authenticated SDK profile named `suiko-pdi` for the shared instance. Coordinate with Deon if you need to preview a panel change against the PDI. In a clone with that profile, build the panel and start the preview from the workspace root.

```powershell
npm --prefix servicenow-app run build
npm --prefix servicenow-app run dev
```

The preview listens at `http://127.0.0.1:13542`. Saved versions and reviews go to the shared PDI, so use fictional drafts. Stop it with Ctrl+C and restart after a new build. To try the deployed app, [open the workbench](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) and sign in with your ServiceNow account.

## Working with teammates

Claim the platform work in [Team tasks](../TEAM-TASKS.md). Keep capability flags false until real endpoints pass their tests. If you edit app files in Studio, use the [Studio sync steps](../docs/13-servicenow-development-and-cicd.md#changes-made-in-studio) before the next build. Custom screens remain Deon's responsibility.

The [development guide](../docs/13-servicenow-development-and-cicd.md) explains the GitHub checks and how to get a reviewed change onto the PDI.

## Validate Inbox and editor decisions

Install the SDK build in a development instance. In **Scripts - Background**, select
the Suiko AI scope and run the following as admin to populate current revision
references for existing stories. Keep the sandbox option off for the backfill.
A second run is safe. The script reports how many stories it updated.

```js
var workflow = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/story-workflow.ts');
gs.info('Suiko story workflow records updated: ' + workflow.backfillCurrentRevisions());
```

As a regular Editor, open the Suiko story list with the **Story inspection** view
(`x_2236136_suiko_ai_story_list.do?sysparm_view=suiko_story_inspection`). In REST
API Explorer or an authenticated session, verify `GET workbench/stories` with
title and status filters. Verify the second page with the returned cursor, and
confirm a non-Editor cannot read the endpoint. Run the **Suiko FE-01 / BE-01**
and **Suiko BE-02** ATF tests with their dedicated test accounts.

The workspace uses `x_2236136_suiko_ai.inbox_enabled` and
`x_2236136_suiko_ai.workflow_enabled` to advertise the new capabilities.
Set each property to `true` after the corresponding installed API and role
checks pass. The existing legal capability uses its own property.

Editor decisions are appended to the story's audited history field in the same
guarded update as the status change. The state response joins those entries with
existing legal task events. Coordinate this history writer with BE-03 if the
team chooses a separate decision table.
