# Suiko AI Build Guide

**13 November update:** Deon now owns every custom screen. Teammates build ServiceNow records, business rules, APIs, legal actions and permissions. Use [Team tasks](TEAM-TASKS.md) for current steps and ownership, [the workspace guide](docs/24-newsroom-workspace.md) for the new screens and [the service contract](docs/25-workspace-service-contract.md) for integration. The original division below is retained as earlier planning history.

Team Backyardigans · 12 November 2026

Claim work in [Team tasks](TEAM-TASKS.md). This guide walks through what the team should show in the demo. The [full build plan](PLAN.md) records the earlier decisions and checks.

Suiko AI helps a small media team review a story before it goes out. One **Editor** can enter the draft, run AI, and sign off. One designated editor can also update the shared rules. Legal gets a task for a specific copy when the editor asks for clearance.

Paste an article, script, or caption, add any source links or notes, and save a version. Click **Review this version** to get an overview, suggestions for tags and description, and concerns linked to a rule and a quote. When the same story has an earlier submitted version, the review also explains what changed.

App Engine provides the forms and tables for the team. ServiceNow can send the saved drafts to Gemini from the server, route a decision to an editor or legal reviewer, and keep the record of who decided what on which draft. [App Engine](https://www.servicenow.com/docs/r/application-development/app-engine-studio/create-application.html) · [Outbound REST](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_RESTMessageV2API.html) · [Approvals](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/ask-approval-action-designer.html) · [Record auditing](https://www.servicenow.com/docs/r/platform-security/exploring-auditing.html)

## What we want to see in the first demo

An editor opens a story about a community library. In version 1, it opens December 5 and the organizers expect 200 people. In version 2, it opens December 12 and the story says more than 500 people are expected, with the source of the estimate removed.

When the editor reviews version 2, the panel can show these results.

| On screen | What the editor sees |
| --- | --- |
| Overview | A short note telling the editor what the draft is about. This appears on a first draft too. |
| Changes | December 5 became December 12. The estimate changed from 200 to more than 500 and lost its attribution to the organizers. The editor can open the old and new passages. |
| Needs attention | “More than 500 residents are expected to attend.” The shared sourcing rule prompts the editor to check where this figure came from. |
| Suggested details | Section **Community**, tags **Libraries** and **Community events**, and a short description based on the new draft. The editor chooses which suggestions to keep. |

Start with the [live workbench](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) and the saved river script. Open both completed reviews to show the schedule change and the outside-clip finding. Use the library article to show a review of a first draft. Once the human workflow is built, send the river script to legal. Save a newer copy, request fresh clearance, and record the editor's sign-off.

The local progress page (local file `ai-review/output/library-review-progress.html`) also shows two media tests. The river cleanup video checks the time in the script and on-screen text and asks for permission to use an outside clip. The sponsored teaser checks whether a revised caption still tells viewers who paid for it. [Media production examples](ai-review/fixtures/README.md)

## Who builds what

| Person | First task | What they own |
| --- | --- | --- |
| Backend teammate | Give each story a current version and workflow status. | Editor decisions, legal tasks, permissions, and decision history. |
| Frontend teammate | Create the Review Inbox list using existing story records. | The native list and legal form, and decision controls on the existing Story screen. |
| Deon | Check the AI on more articles, scripts, and captions. | The AI panel, Gemini instructions and results, quote checks, and quality testing. |

## What to save in ServiceNow

| Record | What goes in it |
| --- | --- |
| Story | Latest submitted version and where it is in review. |
| Submitted revision | Story, version number, title, text, optional source notes, who saved it, and when. The saved copy is what the editor and legal see. |
| Editorial rule | Wording, where it applies, and which version is active. |
| AI review | Current revision, previous submission when there is one, rules used, who ran it, time, model, prompt version, and the result or error. |
| Human decision | Revision, action, person, time, and any reason. Save metadata choices with the review and record the human decisions for the exact version. |

Agree on two starter rules for the demo. A shared sourcing rule can work across different topics. An outside-asset rule applies when the text or notes propose using someone else's media.

## Build it in this order

1. **Try the live review.** Use both saved river versions so the team has a shared example and can see the records that already exist.
2. **Add the Inbox and editor decisions.** Open the existing Story screen from a row. Test **Request changes** and **Sign off** with the regular Editor account.
3. **Add legal clearance and history.** Assign the exact version. Save the decision, then prove that a newer copy needs fresh clearance. Show the actor, time, and version in the Story screen.
4. **Rehearse with the team.** Use the [demo ticket](TEAM-TASKS.md#qa-01-rehearse-the-whole-flow) to check the full path and gather evidence.

## Quick checks before the demo

- Open two unrelated first drafts. Each shows an overview and applicable findings.
- Save a newer version. The older review stays in history, and the new comparison uses the previous submitted copy.
- Save a metadata choice and change a shared rule. Reopen earlier reviews and inspect the original suggestions and rule wording.
- Simulate a failed AI call. Keep the saved draft open with a retry and the manual review actions.
- Route a revision to legal, then update it. Verify that the new copy gets its own legal clearance and final editor sign-off.

## Files to use while building

- **Deon and frontend** can use the [prototype result](contracts/ai-review.response.example.json) and [AI panel step](.scratch/ai-review/issues/08-ai-review-interface.md).
- **Backend** can use the [prototype input](contracts/ai-review.request.example.json) and [shared example step](.scratch/ai-review/issues/02-contract-and-policy.md) to agree the new review fields with Deon.
- **Everyone** can update their step in the [build plan](PLAN.md) and record what changed and how they checked it in the [change log](CHANGELOG.md).
