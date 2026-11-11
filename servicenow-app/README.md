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
| Local SDK profile | `suiko-pdi` |

## Push a change from this computer

From the workspace root, run this after editing.

```powershell
npm --prefix servicenow-app run push:pdi
```

The command verifies the target and app identity, runs the existing review checks, prepares the shared schemas and prompt, builds the app, installs it, and checks the page and API. It stops if any step fails. Refresh the ServiceNow page after a successful push.

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
npx @servicenow/sdk@4.14.0 auth --add https://dev309702.service-now.com --type basic --alias suiko-pdi
```

The SDK prompts for that developer's login and stores the credentials encrypted for their user account. Each teammate works from the same app configuration and record keys.

## Configure Gemini

The local Gemini key stays in the existing `ai-review/.env.local` file. This command sends it through the authenticated app action into the instance's encrypted provider configuration.

```powershell
npm --prefix servicenow-app run configure:gemini
```

The provider action requires admin access. The browser receives only the configured status and model name. App builds carry the field definition, and the key value is configured separately on the instance.

Provider setup adds the two starter rules only when there are no rule records. An editor can change or disable them, and later app pushes preserve that choice. Each review retains the rule versions it used.

Gemini 3.5 Flash-Lite is the default. If it returns HTTP 503, the server makes one attempt with 3.1 Flash-Lite. The review records and displays the model used. Other failures leave a retryable result on the same saved draft.

## Local preview

Build, then open the local preview.

```powershell
npm --prefix servicenow-app run build
npm --prefix servicenow-app run dev
```

The preview listens at `http://127.0.0.1:13542` and uses the authenticated PDI backend for saved versions and reviews. Actions in this preview affect the team's development data. Stop it with Ctrl+C and restart after a new build.

## Working with teammates

Deon owns the panel and review behavior. Use the existing Story screen and add the Inbox, legal task form, and human decisions in the same app. Claim the work in [Team tasks](../TEAM-TASKS.md). If you edit app files in Studio, use the [Studio sync steps](../docs/13-servicenow-development-and-cicd.md#changes-made-in-studio) before the next build.

The [deployment guide](../docs/13-servicenow-development-and-cicd.md) explains the GitHub checks and manual deployment.
