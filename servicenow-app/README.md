# Suiko AI on ServiceNow

This is the SDK project for the team's developer instance. Edit the page, server actions, and app definitions here. The build also takes the shared review schemas, prompt, and quote checks from the workspace.

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
| Review panel | `src/client/app.jsx` and `src/client/app.css` |
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
npm --prefix servicenow-app run build -- --frozenKeys
```

GitHub runs these checks on PRs. Deon installs reviewed builds and manages the Gemini configuration on the shared PDI.

## Gemini and editorial rules

The Gemini key is stored in the instance's encrypted provider configuration. Provider setup adds the two starter rules when the rules table is empty. An editor can change or disable them, and each review retains the rule versions it used.

Gemini 3.5 Flash-Lite is the default. If it returns HTTP 503, the server makes one attempt with 3.1 Flash-Lite. The review records and displays the model used. Other failures leave a retryable result on the same saved draft.

## Local preview

The preview requires an authenticated SDK profile named `suiko-pdi` for the shared instance. Coordinate with Deon if you need to preview a panel change against the PDI. In a clone with that profile, build the panel and start the preview from the workspace root.

```powershell
npm --prefix servicenow-app run build
npm --prefix servicenow-app run dev
```

The preview listens at `http://127.0.0.1:13542`. Saved versions and reviews go to the shared PDI, so use fictional drafts. Stop it with Ctrl+C and restart after a new build. To try the deployed app, [open the workbench](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) and sign in with your ServiceNow account.

## Working with teammates

Deon owns the panel and review behavior. Use the existing Story screen and add the Inbox, legal task form, and human decisions in the same app. Claim the work in [Team tasks](../TEAM-TASKS.md). If you edit app files in Studio, use the [Studio sync steps](../docs/13-servicenow-development-and-cicd.md#changes-made-in-studio) before the next build.

The [development guide](../docs/13-servicenow-development-and-cicd.md) explains the GitHub checks and how to get a reviewed change onto the PDI.
