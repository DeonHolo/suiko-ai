# Suiko AI build plan

Team Backyardigans · Updated 13 November 2026 · First-build workflow confirmed with Deon

Claim work in [Team tasks](TEAM-TASKS.md). It has the next steps for each teammate and the status of the five assignment requirements.

**AI review redesign, 12 November:** Deon confirmed the [company-policy review specification](.scratch/ai-review/company-policy-review-spec.md) and [eight-ticket breakdown](.scratch/ai-review/company-policy-review-tickets-proposed.md). These local tickets belong to Deon. He authorized a separate commit/PR per ticket, followed by agent review of CodeRabbit's findings, justified fixes, successful checks and agent merge to main. [Execution log](.scratch/ai-review/implementation-log.md) · [Decisions](.scratch/ai-review/policy-redesign-interview.md) · [Reusable tools](docs/15-reusable-tools-research.md).

Suiko AI is a private ServiceNow workspace for a small media team. One **Editor** can enter drafts, review them, ask for fixes, and sign off. A designated editor can manage shared rules. A legal reviewer joins when assigned a specific draft to clear. [Team build guide](Suiko%20AI%20Build%20Guide.md) · [Product brief](docs/12-suiko-ai-product-brief.md) · [Decision register](docs/06-sources-and-open-decisions.md#decision-register)

## How a story moves through the app

1. **Save a version.** The editor pastes an article, script, or caption with optional source links or production notes. Saving a version puts that exact copy in the review inbox. Each story has its own revision history.
2. **Review this version.** The editor clicks the button to run Gemini. The panel shows a short internal overview, findings that cite the applicable rule and passage, and suggested section, tags, or description. A first draft gets those results on its own. A later draft also shows meaningful changes from the previous submitted version of the same story.
3. **Make a decision.** The editor can inspect the quoted passage, accept or edit suggested metadata and save the choice with the review, request changes, or sign off. If Gemini is unavailable or returns an unusable quote, the editor can retry on the same saved copy or continue manually.
4. **Send to legal when needed.** Legal receives a task for that exact version and records clearance or requests changes. The editor gives the final sign-off. If an escalated story gets a new version, the editor sends that copy back for fresh legal clearance. Earlier decisions remain visible on their versions. Publication happens through the team's usual tools.
5. **Update shared rules.** The designated editor adds, edits, or disables rules in ServiceNow settings. Future AI runs use the active rules. Past reviews show the rule text and versions they actually used.

## Who builds what

| Owner | Work | What can start first |
| --- | --- | --- |
| **Deon** | AI behavior, evaluation, integration and every custom screen: Story, Stories, Rules, Legal Review and Archive. | Finish screen acceptance and connect teammate APIs. |
| **Najarro** | FE-01 story data/filter API and BE-01 editor decisions. | Current revision/status fields and story listing in Studio. |
| **MGP** | FE-02 archive/restore/deletion and BE-03 history/access. | Archive fields, retention policy and shared decision log. |
| **Russjie** | FE-03 legal schema/read access and BE-02 routing/decisions. | One agreed legal task table, exact revision and assigned-only access. |

Use the existing app `x_2236136_suiko_ai` and keep its app ID and generated record identities. The panel already saves versions, starts live Gemini reviews, opens quoted text, and saves metadata choices through the app API. The first PDI spike proved the live path directly. AI-07 records the earlier fixture-only step as superseded. [Working project and push command](servicenow-app/README.md)

Check each sample from three perspectives. The editor can find the relevant line and the next action. A teammate can reproduce the result with a prepared request. Gemini receives the exact draft, supplied notes, comparison copy when there is one, and the active rules.

## Build steps

Each row opens an editable checklist. Dependencies describe what the team needs to demonstrate the completed step.

| ID | Step | Owner | Depends on | Status |
| --- | --- | --- | --- | --- |
| AI-01 | [Identify the shared app and integration route](.scratch/ai-review/issues/01-target-and-route.md) | Deon + integration teammates | None | done · app identity and SDK route recorded |
| AI-02 | [Agree the shared review example and rules](.scratch/ai-review/issues/02-contract-and-policy.md) | Deon + teammates | None | in-progress · workflow confirmed with Deon, interface and demo rule text to agree |
| AI-03 | [Connect a development workspace to the PDI](.scratch/ai-review/issues/03-development-connection.md) | Deon + integration teammates | AI-01 | done · SDK 4.14.0 and repeated installs verified |
| AI-04 | [Make one offline review pass validation](.scratch/ai-review/issues/04-offline-review.md) | Deon | AI-02 for final handoff | done · local prototype on contract 0.2.0 |
| AI-05 | [Define the first-draft review and revision comparison](.scratch/ai-review/issues/05-revisions-and-metadata.md) | Deon | AI-04 · AI-02 for shared handoff | in-progress · behavior implemented in the PDI prototype |
| AI-06 | [Run live Gemini reviews locally](.scratch/ai-review/issues/06-local-gemini-pilot.md) | Deon | AI-05 for the revised review | in-progress · earlier pilot results saved |
| AI-08 | [Design and build the AI review panel](.scratch/ai-review/issues/08-ai-review-interface.md) | Deon | Saved PDI revision and review actions | in-progress · live panel built, final access and keyboard checks remain |
| AI-13 | [Save drafts, route to legal, and sign off](.scratch/ai-review/issues/13-editorial-workflow.md) | Backend + frontend teammates | AI-02, AI-03 | in-progress · saved versions work, decisions and legal tasks remain |
| AI-14 | [Make shared editorial rules editable](.scratch/ai-review/issues/14-editable-editorial-rules.md) | Deon + integration teammates | AI-02, AI-03 | in-progress · settings and snapshots work, ordinary-account checks remain |
| AI-07 | [Return a fixed review through ServiceNow](.scratch/ai-review/issues/07-pdi-fixed-response.md) | Deon + integration teammates | A saved revision | superseded · live PDI path proved directly |
| AI-09 | [Return a real review through the PDI](.scratch/ai-review/issues/09-pdi-live-review.md) | Deon + integration teammates | AI-06, saved revisions, AI-14 | in-progress · live Gemini results saved, broader verification remains |
| AI-10 | [Handle failure, duplicate, and outdated reviews](.scratch/ai-review/issues/10-reliability-and-currentness.md) | Deon + backend teammate | AI-08, AI-09 | in-progress · busy-provider retry proved, simulated cases remain |
| AI-11 | [Evaluate AI quality against held-out cases](.scratch/ai-review/issues/11-evaluation.md) | Deon | AI-06 | in-progress · fresh story found status and validation failures |
| AI-12 | [Prepare the integrated demo and handoff](.scratch/ai-review/issues/12-demo-and-handoff.md) | Whole team | AI-10, AI-11, AI-13 | draft |
| AI-15 | [Push and check the shared ServiceNow app](.scratch/ai-review/issues/15-pdi-pipeline.md) | Deon | AI-03 | Local deployment and GitHub build checks |

## Company-policy review follow-up

The [approved specification](.scratch/ai-review/company-policy-review-spec.md) defines this AI build. The existing steps above retain their implementation/evidence history. All eight follow-up slices belong to **Deon** and have individual local ticket files.

| ID | What it delivers | Blocked by | Status |
| --- | --- | --- | --- |
| [AI-16](.scratch/ai-review/issues/16-useful-partial-reviews.md) | Useful partial results, consistent statuses and clear failures | None | done · [PR #11](https://github.com/DeonHolo/suiko-ai/pull/11) merged |
| [AI-17](.scratch/ai-review/issues/17-story-inputs-and-context.md) | Format/kind, source URLs and context saved with each version | None | done — [PR #12](https://github.com/DeonHolo/suiko-ai/pull/12) merged |
| [AI-18](.scratch/ai-review/issues/18-approved-editorial-rules.md) | Approved editable starter/manual rules and applicability | AI-17 | done, [PR #13](https://github.com/DeonHolo/suiko-ai/pull/13) merged |
| [AI-19](.scratch/ai-review/issues/19-policy-to-proposed-checks.md) | Company policy and refinements turned into editable proposed checks | AI-18 | done, [PR #14](https://github.com/DeonHolo/suiko-ai/pull/14) merged |
| [AI-20](.scratch/ai-review/issues/20-source-reading-and-evidence.md) | Public sources read and retained as inspectable evidence | AI-18 | done, [PR #15](https://github.com/DeonHolo/suiko-ai/pull/15) merged |
| [AI-21](.scratch/ai-review/issues/21-claim-source-review.md) | Advisory claim/source matches, confidence and Decision 1 trial | AI-16, AI-20 | done, [PR #16](https://github.com/DeonHolo/suiko-ai/pull/16) merged |
| [AI-22](.scratch/ai-review/issues/22-grounded-revision-comparison.md) | Revision summaries grounded in actual saved-text changes | AI-16 | done, [PR #17](https://github.com/DeonHolo/suiko-ai/pull/17) merged |
| [AI-23](.scratch/ai-review/issues/23-company-policy-acceptance.md) | Complete AI flow evaluated in ServiceNow with saved expected/actual evidence | AI-19, AI-21, AI-22 | done, [PR #18](https://github.com/DeonHolo/suiko-ai/pull/18), UI history and rule-notice checks passed |

AI-16 through AI-23 are implemented and evaluated. The [AI-23 report](docs/23-acceptance-results.md) records the full example, final browser checks, remaining model limits and team handoff. Jina Reader and jsdiff passed the ServiceNow compatibility checks. LangExtract was not needed for this build.

Teammates retain FE-01 through QA-01 and their existing claims. Deon owns every custom screen. FE-01/02/03 now cover ServiceNow list data, archive lifecycle and legal schema/access. BE-01/02/03 retain human decisions, routing, history and access. [Detailed steps](TEAM-TASKS.md) · [API contract](docs/25-workspace-service-contract.md).

The [newsroom UI direction](docs/24-newsroom-workspace.md) adds a last-story entry point, separate lists/forms, plain labels, local 12-hour timestamps and optional technical details. Archive and Legal screens await teammate APIs and are gated by server capabilities. Component checks and browser acceptance are recorded separately. [AI handoff and Decision 1 result](docs/26-ai-review-handoff.md).

## What the earlier prototype demo needs to prove

- Open an article and an unrelated script as separate first drafts. Each gets a useful overview. A shared sourcing rule can apply to both, and an outside-footage rule applies only when relevant.
- Revise a story and review it again. The comparison groups a changed fact once, cites the old and new passages, and names any source that was dropped. Suggested public copy leaves out claims flagged for verification.
- Save a chosen tag or edited description. Show the human choice next to the original AI suggestion.
- Send a version to legal, then save an updated copy. Show that the newer version needs its own legal clearance and editor sign-off. Open the history and find who decided what, when, and on which copy.
- Edit a shared rule, rerun the review, and open the earlier review to see the rule it used.
- Try a bad AI reply. Show the unmatched quote or other issue in plain language and allow a retry or a manual decision.

## Evidence and decisions still open

The [local workbench](ai-review/README.md) runs Gemini and retains results. The updated foundation passes 23 checks, including free-form source notes, reviews with all rules disabled, and keeping production notes out of public metadata evidence. Earlier library trials passed the date, attribution, and description checks. [Trial notes](.scratch/ai-review/issues/06-local-gemini-pilot.md) · Progress page (local file `ai-review/output/library-review-progress.html`)

The [shared PDI app](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) saves versions and calls Gemini from ServiceNow. SDK 4.14.0 builds and updates the same app. Repeated pushes preserved saved data, metadata choices, edited rules, and the encrypted provider configuration. The release-family name remains unrecorded. GitHub runs the build and tests. Deon installs reviewed changes from his local clone. The Inbox and human/legal sign-off still need implementation. [Development and pipeline guide](docs/13-servicenow-development-and-cicd.md)

## Editing this plan

Change a step's checklist or completion checks in its linked Markdown file. Update this table when ownership, dependencies, or status change. Keep existing step IDs and use the next unused ID for new work. Record decisions in the [decision register](docs/06-sources-and-open-decisions.md), evidence in the step file, and team changes in the [change log](CHANGELOG.md).
