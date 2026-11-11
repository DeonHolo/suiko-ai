# Work on Suiko AI through pull requests

Start with a [GitHub issue](https://github.com/DeonHolo/suiko-ai/issues). Each issue has the task steps, a prompt for your coding assistant, and a **Done when** check. Make one branch for the task. Open a pull request (PR) for Deon to review.

Suiko AI is public under **DeonHolo**. Teammates push to their own forks and send PRs back to the original repo. Deon reviews and merges changes in the original repo. If GitHub asks for approval to run the build on a first-time contributor's PR, Deon can approve the run from the PR. [Fork workflow](https://docs.github.com/en/pull-requests/reference/pull-requests#fork-and-pull-model)

## Your first task

1. Comment on an issue to claim it. FE-01 and BE-01 can start in parallel. Follow the issue's dependencies and reuse the existing Suiko AI app.
2. Click **Fork** on the original repo and choose your GitHub account. Clone the fork to your computer. Replace `YOUR_GITHUB_USERNAME` below with your GitHub username.

```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/suiko-ai.git
cd suiko-ai
git remote add upstream https://github.com/DeonHolo/suiko-ai.git
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

## Enable CodeRabbit

CodeRabbit offers hosted reviews for public repositories. The repository config asks for feedback on the linked issue in warning mode and leaves approvals to Deon. [Public repository offer](https://www.coderabbit.ai/oss) · [Linked-issue check](https://docs.coderabbit.ai/pr-reviews/pre-merge-checks#issue-assessment)

1. Deon merges the setup PR so the review settings are on `main`.
2. Deon opens the [CodeRabbit GitHub App](https://github.com/apps/coderabbitai), chooses **Only select repositories**, and selects **suiko-ai**.
3. On the first task PR, include its issue number in the description and check that CodeRabbit posts a review and a linked-issue assessment. Use the PR's evidence to verify any ServiceNow steps.

CodeRabbit covers the model for its public repository offer. The ServiceNow app's Gemini key stays with the app. The existing GitHub Actions build and the maintainer's review are still part of each task PR.
