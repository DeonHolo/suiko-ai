# Work on Suiko AI through pull requests

Start with a [GitHub issue](https://github.com/DeonHolo/suiko-ai/issues). Each issue has the task steps, a prompt for your coding assistant, and a **Done when** check. Make one branch for the task. Open a pull request (PR) for Deon to review.

## Set up access once

Suiko AI is a private repository under Deon's personal account. GitHub gives collaborators write access on private personal repositories. To let teammates claim issues and send PRs from their own forks while Deon controls pushes and merges, use a private repository in a GitHub organization Deon owns. [Personal repository permissions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository)

1. Create or choose the team organization. Keep Deon as the owner and set the organization's base repository permission to **None** so each person's access is explicit.
2. In the current repository's **Settings → General → Danger Zone**, choose **Transfer** and select the organization. GitHub transfers the code, issues, and PRs with the repository. Check that it remains **Private** and update Deon's local Git remote to the new URL. [Transfer guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)
3. In the organization's **Settings → Member privileges**, allow forking of private repositories. In the repository's **Settings → General → Features**, enable **Allow forking**. Teammates can then fork Suiko AI to their personal accounts. [Organization fork policy](https://docs.github.com/en/organizations/managing-organization-settings/managing-the-forking-policy-for-your-organization) · [Repository fork policy](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-the-forking-policy-for-your-repository)
4. Give each teammate **Triage** on Suiko AI. This lets them assign issues to themselves, request a review, and send PRs from their forks. Triage grants no permission to push or merge in the original repo. Confirm the effective role on the repo's access page. [Role permissions](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization#permissions-for-each-role)
5. Under **Actions → General → Fork pull request workflows**, enable **Run workflows from fork pull requests** if you want the test/build workflow to run for teammates' PRs. Use the read-only token option and leave the options for sending write tokens and secrets off. If maintainer approval is enabled, approve each run you want to test. [Private fork workflow settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#enabling-workflows-for-forks-of-private-repositories)

## Your first task

1. Once you have access, open an issue and pick yourself under **Assignees**. FE-01 and BE-01 can start in parallel. Follow the issue's dependencies and reuse the existing Suiko AI app.
2. Click **Fork** on the original repo and choose your GitHub account. Clone the fork to your computer. Replace `YOUR_GITHUB_USERNAME` and `TEAM_ORG` below with the names on GitHub.

```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/suiko-ai.git
cd suiko-ai
git remote add upstream https://github.com/TEAM_ORG/suiko-ai.git
git remote -v
```

In the output, **origin** should be your fork. **upstream** is the original repo. Set up Node and the project packages in your clone. [Local setup](../README.md#work-from-your-computer)

3. Start your branch from the latest upstream `main`. Here is the branch for issue #1.

```sh
git fetch upstream
git switch -c fe-01-inbox upstream/main
```

4. Open that folder in your coding assistant. Use your own account and paste the issue's **Ask your AI** prompt along with the task steps. Add this to the prompt:

```text
Use the existing Suiko AI repository and work on my task branch. Check the remotes first. Upstream is the team repo and origin is my fork. Build the linked issue, run the checks, and show evidence for its Done when section. Keep the existing ServiceNow scope and record IDs. Tell me which part still needs a test in the shared ServiceNow instance.
```

## When Deon updates main

Save your current work in a commit first. Stay on your task branch, then run:

```sh
git fetch upstream
git merge upstream/main
```

This brings Deon's latest changes into the branch you are working on. Do this before you ask for review and when someone changes a file your task depends on. If Git reports a conflict, ask your AI to explain both edits and keep the parts each task needs. Re-run the relevant checks after resolving it.

## Open the PR

1. Run the relevant tests and build. For a ServiceNow screen or workflow change, capture how someone can reproduce the result in the PDI. If you configured a form or flow in Studio, bring those app files into the branch. [Studio changes](13-servicenow-development-and-cicd.md#changes-made-in-studio)
2. Commit your changed files and push your task branch to your fork.

```sh
git push -u origin fe-01-inbox
```

3. Open a PR with **base** set to the team repo's `main` and **compare** set to your fork's task branch. Fill out the PR template with the issue, the result, and the evidence. For example, use `Closes #1` when the PR completes issue #1. Use a draft PR if you want feedback before it is ready. [Linking issues and PRs](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
4. Push further fixes to the same branch. GitHub adds them to the existing PR. Mark the PR ready and ask Deon to review when the task can be checked end to end.

## Review the code and the task

Open the PR in GitHub. **Checks** shows the automated tests and SDK build. **Files changed** shows what the author changed. Read the linked issue's **Done when** check and use the evidence in the PR to verify it. For a ServiceNow workflow, reproduce the important steps using the right account and version. Use **Review changes** to request a fix or approve, then merge when ready. [Reviewing a PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request)

For a second look, open a fresh session with your own AI and paste the PR link and issue link.

```text
Review this Suiko AI pull request against the linked GitHub issue. Read the issue's steps and Done when check, the latest PR diff, and the current GitHub check results. For each acceptance check, say Met, Missing, or Needs a PDI test, and cite the code, test, or demo evidence. Then list any bugs or regressions, with a file and line and a way to reproduce each one. Check version-specific decisions, permissions, and stable ServiceNow record IDs where relevant. Return the review in this session for Deon to use.
```

Start with the existing CI and this review prompt. Each teammate can run the prompt in their own AI account before asking Deon to review. Deon can run it again against the submitted PR and make the final decision.

For a bot later, **PR-Agent** is open-source and can review a linked GitHub issue alongside the diff. It needs a configured model provider, so token costs depend on the provider. Its reviewer supports the following option when the issue context is available. [PR-Agent review options](https://docs.pr-agent.ai/tools/review/) · [Run PR-Agent locally](https://docs.pr-agent.ai/installation/locally/)

```toml
[pr_reviewer]
require_ticket_analysis_review = true
```

**Kodus Community** is another option for automated PR reviews. Its free plan uses your own model API key. The model provider bills any usage outside its allowance. [Kodus Community pricing](https://kodus.io/pricing/)
