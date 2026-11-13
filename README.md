# Suiko AI

Suiko AI is a ServiceNow app for a small newsroom or media team. An editor saves an article, script, or caption. Gemini summarizes the draft, compares it with the previous version when there is one, suggests tags and a description, and flags passages that may conflict with shared rules. People decide what can go out.

**Team Backyardigans.** Claim a ticket in [GitHub Issues](https://github.com/DeonHolo/suiko-ai/issues). Each ticket has steps, a prompt for your coding assistant, and a check you can demo. [Team task overview](TEAM-TASKS.md)

## Try the app

1. [Open the Suiko AI workbench](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) on the team's ServiceNow developer instance (PDI). Sign in with your ServiceNow account.
2. Under **Saved stories**, choose **Halyard Desk proposes a listening room for its radio archive (AI-23 demo)**. Open Version 1 and Version 2 under **Review history**. The first review found an overconfident headline, a time conflict and an unconfirmed price. The revision corrected those details. [Expected story inputs and observed results](docs/23-acceptance-results.md)
3. To try your own draft, choose **New story**, select its format and kind, paste the text, public links and optional context, then click **Save version → Review this version**. An applicable approved rule can ask Suiko to read the links. Open the claim/source passages and choose which metadata to save. The designated editor can [set up and approve editorial rules](docs/18-approved-rule-setup.md).

The workbench already serves as the **Story** screen. The next build adds a **Review Inbox** to find stories by status, human decisions on the Story screen, and a **Legal Review** form for assigned clearances. Use the existing Suiko AI app in **ServiceNow Studio** to work on native lists and forms. [Screen plan](TEAM-TASKS.md#which-screens-do-we-need)

## Start your part

| Who | Start here |
| --- | --- |
| **Frontend** | Add the Review Inbox list in ServiceNow and connect it to the current Story screen. Then add status and decision controls. [Frontend tickets](TEAM-TASKS.md#frontend-tickets) |
| **Backend** | Add the current version, workflow status, and editor decisions to the existing records. Then add legal approval and decision history. [Backend tickets](TEAM-TASKS.md#backend-tickets) |
| **Deon** | Own the AI prompt, checks, review quality, and panel. Pair with frontend on opening a saved story from the Inbox. [AI review results and known limits](docs/23-acceptance-results.md) |

The scoped app, saved drafts, and AI reviews have working demo paths. The Inbox, human approvals, and decision history are next. [Status against the assignment](TEAM-TASKS.md#how-much-of-the-assignment-works)

## Work from your computer

Use the team guide to fork this public repo, clone your fork, and sync with the team's main branch. From inside your clone, install the packages and run the checks with Node.js 24. [GitHub team workflow](docs/14-github-team-workflow.md)

```sh
npm --prefix ai-review ci
npm --prefix servicenow-app ci
npm --prefix ai-review test
npm --prefix servicenow-app run build -- --frozenKeys
```

Open a pull request from your fork. If you edit a form or flow in Studio, coordinate with Deon to include those changes in your branch. GitHub runs the tests and builds the app. Deon reviews and merges PRs, then installs the reviewed build on the shared PDI from his computer. [Development guide](docs/13-servicenow-development-and-cicd.md)

[Full build plan](PLAN.md) · [Demo guide](Suiko%20AI%20Build%20Guide.md) · [Product brief](docs/12-suiko-ai-product-brief.md) · [Change log](CHANGELOG.md)
