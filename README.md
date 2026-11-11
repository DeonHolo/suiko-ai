# Suiko AI

Suiko AI is a ServiceNow app for a small newsroom or media team. An editor saves an article, script, or caption. Gemini summarizes the draft, compares it with the previous version when there is one, suggests tags and a description, and flags passages that may conflict with shared rules. People decide what can go out.

**Team Backyardigans.** Claim a ticket in [GitHub Issues](https://github.com/DeonHolo/suiko-ai/issues). Each ticket has steps, a prompt for your coding assistant, and a check you can demo. [Team task overview](TEAM-TASKS.md)

## Try the app

1. [Open the Suiko AI workbench](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) on the team's ServiceNow developer instance (PDI). Sign in with your ServiceNow account.
2. Under **Saved stories**, choose **River cleanup video package**. Use **Review history** to open the completed reviews for Version 1 and Version 2. Version 2 moved the event from Saturday at 8 a.m. to Sunday at 9 a.m. and flagged the outside drone clip for a permission check.
3. To try your own draft, choose **New story**, paste the text and any notes, then click **Save version → Review this version**. You can edit and save the metadata suggestions. The designated editor can update **Editorial rules**.

The workbench already serves as the **Story** screen. The next build adds a **Review Inbox** to find stories by status, human decisions on the Story screen, and a **Legal Review** form for assigned clearances. Use the existing Suiko AI app in **ServiceNow Studio** to work on native lists and forms. [Screen plan](TEAM-TASKS.md#which-screens-do-we-need)

## Start your part

| Who | Start here |
| --- | --- |
| **Frontend** | Add the Review Inbox list in ServiceNow and connect it to the current Story screen. Then add status and decision controls. [Frontend tickets](TEAM-TASKS.md#frontend-tickets) |
| **Backend** | Add the current version, workflow status, and editor decisions to the existing records. Then add legal approval and decision history. [Backend tickets](TEAM-TASKS.md#backend-tickets) |
| **Deon** | Own the AI prompt, checks, review quality, and panel. Pair with frontend on opening a saved story from the Inbox. [AI panel checklist](.scratch/ai-review/issues/08-ai-review-interface.md) |

The scoped app, saved drafts, and AI reviews have working demo paths. The Inbox, human approvals, and decision history are next. [Status against the assignment](TEAM-TASKS.md#how-much-of-the-assignment-works)

## Work from your computer

Use the team guide to fork this public repo, clone your fork, and sync with the team's main branch. From inside your clone, install the packages and run the checks with Node.js 24. [GitHub team workflow](docs/14-github-team-workflow.md)

```sh
npm --prefix ai-review ci
npm --prefix servicenow-app ci
npm --prefix ai-review test
npm --prefix servicenow-app run build -- --frozenKeys
```

Use one branch for your ticket and open a pull request from your fork. Bring forms or flows you edit in Studio into that branch so the next build includes them. Coordinate deployments to the shared PDI with your team.

For a local app push, set up your SDK login once and run this from the repository root. [ServiceNow project guide](servicenow-app/README.md#set-up-another-computer)

```sh
npm --prefix servicenow-app run push:pdi
```

That command checks the app, builds it, installs it on the same PDI, and checks the deployed page and API. GitHub checks pull requests and builds the app. PDI deployment from GitHub is manual and uses the team's ServiceNow deployment credentials. [Development and deployment guide](docs/13-servicenow-development-and-cicd.md)

[Full build plan](PLAN.md) · [Demo guide](Suiko%20AI%20Build%20Guide.md) · [Product brief](docs/12-suiko-ai-product-brief.md) · [Change log](CHANGELOG.md)
