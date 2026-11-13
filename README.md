# Suiko AI

Suiko AI is a ServiceNow app for a small newsroom or media team. An editor saves an article, script, or caption. Gemini summarizes the draft, compares it with the previous version when there is one, suggests tags and a description, and flags passages that may conflict with shared rules. People decide what can go out.

**Team Backyardigans.** Claim a ticket in [GitHub Issues](https://github.com/DeonHolo/suiko-ai/issues). Each ticket has steps, a prompt for your coding assistant, and a check you can demo. [Team task overview](TEAM-TASKS.md)

## Try the app

1. [Open the Suiko AI workbench](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) on the team's ServiceNow developer instance (PDI). Sign in with your ServiceNow account.
2. Open **Stories** and find **Halyard Desk proposes a listening room for its radio archive (AI-23 demo)**. Open Version 1 and Version 2 under **Review history**. The first review found an overconfident headline, a time conflict and an unconfirmed price. The revision corrected those details. [Expected story inputs and observed results](docs/23-acceptance-results.md)
3. To try your own draft, choose **New story**, select its format and kind, paste the text, public links and optional context, then click **Save version → Review this version**. An applicable approved rule can ask Suiko to read the links. Open the claim/source passages and choose which metadata to save. The designated editor can [set up and approve editorial rules](docs/18-approved-rule-setup.md).

The workspace separates Story, Stories and Rules. It resumes your last story and keeps technical details tucked away. Archive, legal tasks, all-story filters and human decisions need the teammate APIs before their controls become available. [Screen plan and acceptance status](docs/24-newsroom-workspace.md)

## Start your part

| Who | Start here |
| --- | --- |
| **Najarro** | #1: story-list data and filters. #4: current version, status and editor decisions. |
| **MGP** | #2: archive, restore and safe deletion. #6: human history and permissions. |
| **Russjie** | #3: legal task fields and protected read access. #5: legal routing and decisions. |
| **Deon** | All custom screens, AI behavior, integration and evaluation. [AI handoff, including Decision 1](docs/26-ai-review-handoff.md) |

Use the existing app in **ServiceNow Studio** for records, business rules, APIs, permissions and native inspection forms. Each [team ticket](TEAM-TASKS.md) has detailed steps, a prompt for your AI and a Done when check. Keep the existing issue numbers and claims. [Screen/API contract](docs/25-workspace-service-contract.md)

## Work from your computer

Use the team guide to fork this public repo, clone your fork, and sync with the team's main branch. From inside your clone, install the packages and run the checks with Node.js 24. [GitHub team workflow](docs/14-github-team-workflow.md)

```sh
npm --prefix ai-review ci
npm --prefix servicenow-app ci
npm --prefix ai-review test
npm --prefix servicenow-app run test:ui
npm --prefix servicenow-app run build -- --frozenKeys
```

Open a pull request from your fork. If you edit a form or flow in Studio, coordinate with Deon to include those changes in your branch. GitHub runs the tests and builds the app. Deon reviews and merges PRs, then installs the reviewed build on the shared PDI from his computer. [Development guide](docs/13-servicenow-development-and-cicd.md)

[Full build plan](PLAN.md) · [Demo guide](Suiko%20AI%20Build%20Guide.md) · [Product brief](docs/12-suiko-ai-product-brief.md) · [Change log](CHANGELOG.md)
