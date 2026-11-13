# Suiko AI team tasks

Team Backyardigans · 12 November 2026

A **task breakdown**, also called a **backlog**, is the team's list of things to build. Each ticket below has steps, a prompt for your coding assistant, and a check that tells you when it works.

Claim a ticket by commenting on its GitHub issue. Make a branch with its ID, such as **fe-01-inbox**. Link your pull request to the issue. [GitHub team workflow](docs/14-github-team-workflow.md)

| Ticket | Work | GitHub issue |
| --- | --- | --- |
| [FE-01](#fe-01-build-the-review-inbox) | Build the Review Inbox | [#1](https://github.com/DeonHolo/suiko-ai/issues/1) |
| [FE-02](#fe-02-connect-the-inbox-and-story-screen) | Connect the Inbox and Story screen | [#2](https://github.com/DeonHolo/suiko-ai/issues/2) |
| [FE-03](#fe-03-configure-the-legal-review-form) | Configure the Legal Review form | [#3](https://github.com/DeonHolo/suiko-ai/issues/3) |
| [BE-01](#be-01-add-editor-decisions) | Add editor decisions | [#4](https://github.com/DeonHolo/suiko-ai/issues/4) |
| [BE-02](#be-02-route-a-version-to-legal) | Route a version to legal | [#5](https://github.com/DeonHolo/suiko-ai/issues/5) |
| [BE-03](#be-03-finish-history-and-test-access) | Finish history and test access | [#6](https://github.com/DeonHolo/suiko-ai/issues/6) |
| [QA-01](#qa-01-rehearse-the-demo) | Rehearse the demo | [#7](https://github.com/DeonHolo/suiko-ai/issues/7) |

Deon owns the AI prompt, evidence checks, evaluation, and AI panel. Pair with him on FE-02. FE-01 and BE-01 can start in parallel. [Full build plan](PLAN.md)

## How much of the assignment works?

Three of the five requirement areas have a working demo path. The human approval workflow needs to be built, and the current history covers drafts and AI runs. This is a count of requirement areas for the demo.

| Assignment asks for | What we can show today | What remains |
| --- | --- | --- |
| **App Engine** | Suiko AI runs as a scoped app on the team's developer instance. Studio shows its app files. | Extend the shared app with the workflow. |
| **Content and revision records** | One story holds saved copies with format, kind, text, context and links. Dedicated non-admin Editor tests passed saving and reopening. | Connect these records to the human workflow and Inbox. |
| **AI comparison and classification** | The library and caption comparisons, editable approved rules, company-policy suggestions, source matches and optional confidence check have working examples. Editors can save their metadata choices. The final UI history and rule-notice checks passed. | Connect this feature to the human workflow and keep evaluating missed concerns and inaccurate judgments. [AI results](docs/23-acceptance-results.md) |
| **Review workflows** | An editor can run, retry, and reopen AI review for a saved version. | Add the Inbox, requests for changes, legal routing, and final editor sign-off. |
| **Audit history** | The app keeps old drafts, AI results, exact rule versions, retrieved passages and metadata choices. The browser reopened old and new source evidence with the original rules and editor choice intact. | Record human decisions with person, time, reason, and exact version. |

See it under **Saved stories → River cleanup video package → Review history**. The Scripted REST API calls the AI logic from a server module, which Studio lists under **ECMAScript Module**. [Open Suiko AI](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) · [Server code](servicenow-app/src/server/workbench.ts) · [ServiceNow module guide](https://servicenow.github.io/sdk/guides/module-guide)

## Which screens do we need?

| Screen | What it does | What to build |
| --- | --- | --- |
| **Review Inbox** | Shows many stories and what each one is waiting for. | Add a native list with title, latest version, status, and last activity. |
| **Story** | Shows one draft, its notes, versions, AI review, and next action. | The current **Review a story** screen already handles the draft and AI work. Add status, human decisions, and history to it. |
| **Legal Review** | Shows the assigned reviewer the exact copy and why the editor asked for clearance. | Configure a native task or approval form with the saved text and notes available to read. |
| **Editorial Rules** | Lets a designated editor change rules for future reviews. | Use the existing tab and verify access with a regular account. |

**Use the forms in ServiceNow Studio.** Open the existing **Suiko AI** app and find its forms under **Data → Form**. ServiceNow calls the visual editor **Form Builder** or **Form Designer**. Use **List Layout** for the Inbox and **Form Builder** for Legal Review. Keep the custom UI Page as the Story screen and AI panel. If the team needs a native Story form too, use it as a read-only summary with an **Open story** action. [Form Builder guide](https://www.servicenow.com/docs/r/zurich/application-development/form-builder-glide-family-release/form-view-configuration.html) · [List Layout guide](https://www.servicenow.com/docs/r/platform-administration/list-administration/t_ConfigureTheListLayout.html)

The assignment lists what the app must do and leaves the screen technology open. Confirm any additional UI requirement when the instructor releases the rubric.

## Before your first ticket

1. Open the live workbench and try the river example. **ServiceNow Studio** is where developers open app files. The **workbench** is where editors use the app.
2. Fork the repository, clone your fork, and run the setup and checks. Work in the existing scope, **x_2236136_suiko_ai**. [Setup commands](README.md#work-from-your-computer)
3. Give your coding assistant this file and your ticket ID. Point it at the repository or open the Suiko AI scope in Studio. Use a branch and fictional test stories.
4. For changes in Studio, coordinate edits on the shared PDI with Deon. Include the exported app files in your PR. Deon installs the reviewed build. [Studio steps](docs/13-servicenow-development-and-cicd.md#changes-made-in-studio)

## Frontend tickets

### FE-01 Build the Review Inbox

Use the existing **Suiko story** table (`x_2236136_suiko_ai_story`). The river and library samples give you rows to work with now.

1. Open the story table's list in the Suiko AI scope. Right-click a column header and choose **Configure → List Layout**. Create a named **Review Inbox** view with **Title** and **Updated**.
2. Add **Review Inbox** to the existing Suiko AI application menu. Point it to that table and view. Sort by last activity, newest first. Show one row per story.
3. When BE-01 supplies the fields, add **Latest version** and **Status**. Make the list easy to filter by the statuses in BE-01 and BE-02.
4. Open a story from its row. A native list can open the record form first. Add an **Open story** action that passes the record ID to the workbench when FE-02 supports the link.
5. Test the list as an Editor. Bring the view and menu changes into your branch so the next deployment includes them.

**Done when** an Editor can find the river and library stories, filter by status, and reach the correct story with its latest version.

**Ask your AI**

```text
Help me with FE-01 in TEAM-TASKS.md. Read the existing Suiko story table and app menu in servicenow-app/src/fluent/review.now.ts. Give me steps to configure a named ServiceNow list view and Review Inbox menu item for that table. Start with Title and Updated and show where to add the backend fields later. Include an Editor test and how to bring the changes into the SDK project.
```

### FE-02 Connect the Inbox and Story screen

The screen already loads a story selected under **Saved stories**. Pair with Deon. [Story screen](servicenow-app/src/client/app.jsx) · [API client](servicenow-app/src/client/services/ReviewService.js)

1. Agree on a link such as `x_2236136_suiko_ai_review.do?story=STORY_ID`. Load that ID through the existing story-loading action. Add **Back to Inbox**. Keep **New story** and **Saved stories** available.
2. Test the link on the river and library stories. Show a clear message if the story is unavailable. Put the version and workflow status beside the title.
3. Add **Request changes**, **Send to legal**, and **Sign off**. Ask for a note on a change request and a reviewer plus reason for legal. Call the agreed BE-01 and BE-02 server actions with the visible revision's ID.
4. Refresh the story after each decision. If someone saved a newer version in another tab, display the server's message and let the editor reopen the latest copy.
5. Check that the review button, quotes, retry, and metadata choices still work. Try making a human decision after an AI failure.

**Done when** an Editor opens the correct draft, records a permitted decision, and sees its new status back in the Inbox.

**Ask your AI**

```text
Help me with FE-02 in TEAM-TASKS.md. Read app.jsx, ReviewService.js, and the BE-01/BE-02 handoff. Reuse the current Story screen. Show how to open a story by ID from a ServiceNow list, keep the AI panel working, and add status and decision controls. Include checks for two stories, an outdated page, and a failed AI review.
```

### FE-03 Configure the Legal Review form

Use the task or approval record BE-02 chooses.

1. Open the task or approval form in **Form Builder**. Arrange **Story**, **Version**, **Assigned reviewer**, **Reason for legal review**, and **Decision**. Show the saved text and notes as read-only fields or through a protected link to that copy.
2. Show **Clear this version** and **Request changes**, with a place for a note. Connect them to the native approval or scoped actions agreed in BE-02.
3. On the Story screen, show the decision history from BE-03 with date, person, action, version, and note. Keep AI review history in its existing area.
4. Sign in as the assigned reviewer and open the task. After a newer version exists, check that the form still identifies the version sent to legal.

**Done when** the assigned reviewer can respond to the right copy, and the editor can reopen that decision from the Story screen.

**Ask your AI**

```text
Help me with FE-03 in TEAM-TASKS.md. Inspect the actual task or approval table selected in BE-02. Give me the Form Builder steps for version, read-only draft, reason, assignee, decision, and note. Explain how to show that version's decision in the existing Story screen. Give me checks for the assigned legal reviewer and the Editor.
```

## Backend tickets

### BE-01 Add editor decisions

Use the existing story and revision tables and the save-version action. [Tables and API](servicenow-app/src/fluent/review.now.ts) · [Server code](servicenow-app/src/server/workbench.ts)

1. Agree field names with frontend. Start with a **current revision** reference and **workflow status** choice on the story. Show the referenced revision's number in the Inbox. Start with **Needs review**, **Changes requested**, and **Signed off**.
2. Point existing stories at their newest saved versions. Set **Needs review** for copies without a human decision. Saving changed text creates a new version and resets the status. Saving identical text keeps the current version and status.
3. Add server actions for **Request changes** and **Sign off**. Accept a target revision ID and note. Get the actor from the signed-in account, check the Editor role, and check that the revision is still current when writing the decision.
4. Save the action with its revision, actor, time, and note. Agree the history fields with BE-03. Return the new status and decision to the Story screen.
5. Try both actions as an Editor. Save a newer copy from a second tab and try signing off from the older one. Run AI and verify that the human workflow status stays the same.

**Done when** an Editor can request changes and sign off a routine draft. Each decision records the exact version, and an outdated page cannot change the latest version's status.

**Ask your AI**

```text
Help me implement BE-01 in the existing Suiko AI SDK app. Read review.now.ts, workbench.ts, TEAM-TASKS.md, and the sign-off ADR. Propose the story fields, setup for existing stories, action request fields, and status values so frontend can start. Preserve saved revisions and AI reviews. Show how to check the Editor role and current revision when writing each decision.
```

### BE-02 Route a version to legal

Use BE-01's editor actions and the revision record that holds the saved copy. [Sign-off decision](docs/adr/0001-bind-sign-off-to-the-submitted-revision.md)

1. Pick a scoped task or approval record that can reference one revision and one assigned reviewer. Try **Ask for Approval** in Workflow Studio on a compatible record. Verify the approval field and permissions in the PDI. A scoped task with server actions is another option. [Ask for Approval guide](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/ask-approval-flow-designer.html)
2. On **Send to legal**, save the revision ID, assignee, reason, and time. Set the current story to **Waiting for legal**. A repeated click should find the open request for that version.
3. Let the assignee clear the version or request changes. Check access on the server and save the decision and note. For the current version, clearance sets **Ready for sign-off** and a change request sets **Changes requested**.
4. Once a story has gone to legal, check for clearance of its current revision before editor sign-off. A newer version returns to **Needs review** and needs fresh clearance. Keep earlier tasks and decisions tied to their saved copies.
5. Clear Version 2, then save Version 3. Verify that Version 3 needs fresh clearance and that a decision on the old task leaves the latest version's status alone.

**Done when** legal can respond to an assigned copy, and the Editor can sign off an escalated story after legal clears the same current version.

**Ask your AI**

```text
Help me with BE-02 in TEAM-TASKS.md. Read the story and revision tables and docs/adr/0001-bind-sign-off-to-the-submitted-revision.md. Show how to use a compatible ServiceNow approval or scoped task for one saved revision. Include fields, allowed actions, permission checks, and what happens when a newer version appears. Give me a repeatable test with Versions 2 and 3.
```

### BE-03 Finish history and test access

Use the existing draft history, AI runs, rule snapshots, and metadata choices. Add the human decisions from BE-01 and BE-02.

1. Agree where human actions are saved. Use native approval history where it includes revision, actor, time, action, and note. Add a decision record for actions that need one. Preserve earlier entries.
2. Give FE-03 the decision history for the selected story, ordered by time and labeled by version.
3. Check permissions with regular accounts. The Editor can open stories and run AI. The designated editor can change rules. Legal can read its assigned task and exact copy. Enforce these rules on the server. Keep provider configuration available to admins.
4. Try reading and clearing the legal task as an unassigned account. Try changing a rule as a regular Editor. Check the underlying record or API as well as the visible controls.
5. Save a newer version and edit a shared rule. Confirm the older review still shows its original wording and the earlier human decisions still show the correct actor and version.

**Done when** history answers who did what, when, and on which version. Assigned and unassigned access checks pass.

**Ask your AI**

```text
Help me with BE-03. Read TEAM-TASKS.md and the existing access controls and history code. Show what we already save and where to record human decisions. Propose the response for the Story screen's history. Give me an access test matrix for an Editor, designated rule editor, assigned legal reviewer, and unassigned account.
```

## Demo ticket

### QA-01 Rehearse the demo

Run this after the Inbox, human decisions, and history are connected.

1. As an Editor, open a routine story from the Inbox, save a draft, run AI, inspect a quote, save a metadata choice, and sign off. Try a manual decision on a separate draft after an AI failure.
2. Send the river version with the outside clip to legal. As the assigned reviewer, open and clear that exact copy. As the Editor, save a newer version and verify the old clearance cannot sign it off.
3. Request fresh clearance, finish sign-off, and open the history. As the designated editor, edit a shared rule and show its original wording in an older AI review.
4. Record the story, version, account role, expected result, and observed result in the pull request or [change log](CHANGELOG.md).

**Done when** a teammate can follow the demo from the Inbox to sign-off using regular accounts and can find the decisions for both versions.

**Ask your AI**

```text
Turn QA-01 from TEAM-TASKS.md into a click-by-click demo checklist. Include the expected result and which screen proves it after each step. Use the completed tickets and actual PDI behavior to mark any step still missing.
```

The editor records final sign-off. The team publishes through its usual tools. [Version-specific sign-off decision](docs/adr/0001-bind-sign-off-to-the-submitted-revision.md)
