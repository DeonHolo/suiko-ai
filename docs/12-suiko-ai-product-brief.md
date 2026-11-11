# Suiko AI product brief

Team Backyardigans · 12 November 2026

The [editable team build plan](../PLAN.md) records the first-build decisions. This brief explains the product and the workflows that informed it.

## What we need to build

The assignment calls for a ServiceNow app for media production. It asks for content and revision records, AI change summaries and classification, suggestions for metadata, possible conflicts with an editorial checklist, a review workflow, and an audit history. Editors and legal reviewers keep publishing authority. The team still needs to choose whose work we are helping, what they submit, and what a useful review looks like.

**First product.** Suiko AI is an internal inbox for a small media team to review stories before they go live. An editor can enter a draft, see what needs a decision, request changes or route it to legal, and find the exact version that was signed off. Each article, script, or caption gets its own story record and revision history.

The problem to test is whether a late edit sends an editor chasing through drafts and messages to work out what changed, which concern still needs attention, and who cleared which copy.

## What already exists and what we can borrow

| Product | What it already does | How it fits in Suiko AI |
| --- | --- | --- |
| Arc XP Composer, a newsroom publishing tool | Suggests metadata and comments on a story using uploaded style guides or custom rules. Its revision history compares versions, and teams can configure tasks such as legal review. [AI Assistant](https://docs.arcxp.com/en/products/composer/composer-ai-assistant.html) · [Revision history](https://docs.arcxp.com/en/products/composer/getting-started-with-composer/using-revision-history.html) · [Task setup](https://docs.arcxp.com/en/products/content/getting-started-configuring-your-arc-xp-tools.html) | Show AI notes beside the draft with the relevant words in view. Let the editor accept or edit suggested labels and send the draft to the right person from the same page. |
| Filestage, a media proofing tool | Supports custom AI checks, side-by-side version review, human decisions, and reports of comments and approvals by version. [Review Agents](https://help.filestage.io/en/articles/9465074-how-to-get-started-with-review-agents) · [Versions and reports](https://help.filestage.io/en/articles/7872784-chapter-3-managing-versions) | Give each submitted draft a version. A reviewer sees meaningful changes and records a decision tied to that exact version. |
| PublishPress, a WordPress editorial workflow | Lets teams configure their own checklist tasks. Editors can review, compare, and approve submitted revisions. [Custom tasks](https://publishpress.com/knowledge-base/custom-requirements-checklist/) · [Revision queue](https://publishpress.com/knowledge-base/revision-queue/) | Put rules on an **Editorial rules** settings page. Keep AI flags as suggestions and give the editor control of the decision. |

These are workflow patterns we can adapt in App Engine. The vendor documentation establishes that much of the idea already exists. A reason to adopt Suiko AI still needs to be demonstrated.

## What the editor would see

| Screen | What someone can do |
| --- | --- |
| **Review inbox** | See stories waiting for an editor, a revised draft, or legal. Open the latest submitted version. |
| **Story review** | Read the draft alongside a short overview, the most important things to check, changes from the previous version if one exists, and suggested metadata. Click a finding to see the quoted passage. Ask for changes, route to legal, or record a decision. |
| **Editorial rules** | An authorized editor can add, edit, or turn off a shared rule in plain language. The next review uses the active rules. The history shows the rule text that was used at the time. |

An editor pastes text with a title and can add source links or production notes. They click **Review this version** to get an overview, findings tied to rules, and suggested metadata. A later draft also gets a comparison with the previous submission. In a pilot, test whether sending a draft from the team's existing writing tool would save enough work to justify an integration. People publish from their usual tools after the appropriate humans sign off.

**Example.** A river cleanup script proposes an outside drone clip. The review shows *Check permission for Northbank Aerial's clip* and opens the line in the production notes. The editor asks for the permission record, adds it to a new version, and sends that copy to legal. Legal clears the copy and the editor signs off. If the version also moved the cleanup from Saturday to Sunday, Suiko AI shows that change once with the relevant lines. The history answers who made the decision and which copy they saw.

One possible follow-up is **Changes since sign-off**. If version 2 was approved and the team is already on version 5, the editor could compare version 5 directly with the copy that was cleared.

## Editorial rules and findings

Editorial rules are the publication's standing instructions for what its people check before a story goes out. For instance, Reuters describes sourcing and attribution principles that apply across stories, photos, and video. The team should choose its own sample rules for the capstone. [Reuters standards and values](https://reutersagency.com/about/standards-values/)

| Shared rule | A finding on one draft |
| --- | --- |
| Give the editor a way to trace important factual claims to a source or reporting note. | “The draft says ‘more than 1,000 subagents.’ Which source supports that number?” The same rule could ask where a library attendance estimate came from. |
| When a script or caption uses an outside asset, check whether the submitted notes document permission. | “The footage note names Northbank Aerial. Please add the permission record for this clip.” |

A rule can yield zero, one, or several findings. A story using only staff footage can skip the outside-asset check. A source link or production note gives the editor something to inspect. Gemini can identify a gap in what it was given, and the editor can confirm the underlying fact or permission. The review starts with what requires action. The full list of checks is available when someone needs it.

The earlier review notes treated the 1,000-subagents example as a policy. It was a draft-specific question. The actual saved tech reviews used the video preset. The current workbench can select a news or video preset from files, so an editor still needs a developer to change their contents. WildTrack's tested review mechanics are useful here, especially saving inputs and grounding feedback in exact quotes. Story requirements come from the newsroom workflow. Saved review notes (local file `ai-review/output/river-live/b74495d5-7c53-4f4d-a610-911d16a67c85/review-notes.md`) · [Workbench profile loading](../ai-review/src/workbench-server.js#L63)

## Build the smallest complete version

1. **Make one human review work in ServiceNow.** Save a story and a submitted revision. Use a prepared AI result so the editor can open the quoted line, request a fix, and record a decision. Give legal a review task when the editor routes it. Save the reviewer, time, revision, and reason. App Engine provides the app and records. Workflow Studio supports approvals on records. The app needs to link the decision to the specific draft and show the history. [App Engine](https://www.servicenow.com/docs/r/application-development/app-engine-studio/create-application.html) · [Ask for Approval](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/ask-approval-flow-designer.html) · [Record auditing](https://www.servicenow.com/docs/r/platform-security/exploring-auditing.html)
2. **Make the first draft review useful.** Load the active rules from ServiceNow settings and send those rules, the saved draft, and supplied context to Gemini. Show an overview, grounded findings, and suggested section, tags, or description. Keep the quote checks. If AI fails, show which part could not be verified and let the editor retry or continue manually.
3. **Make edits and later reviews work.** Save a revised copy under the same story. Compare it with the previous submitted copy. Show which revision the editor or legal cleared. A newer draft gets its own review decision. Editing a rule creates a new version for future runs, so past results still show the rule they actually used.

Deon owns review behavior, prompting, evaluation, and the design and build of the AI review panel. The teammates build the wider frontend, ServiceNow records, rule settings, and approval flow. The shared example gives each person the same input and expected result.

The proposed demo covers short text, optional source notes, and the review and sign-off flow. Video playback, PDF ingestion, web fact-checking, and CMS publishing integrations are later scope.

## How we can tell it works

| Demo check | Expected behavior |
| --- | --- |
| Submit an article and an unrelated script as new stories | Each has its own first draft and review. The same sourcing rule can help on either, and checks for outside footage apply only when relevant. |
| Submit a clean draft with a supplied source | It shows an overview and suitable metadata, with zero sourcing findings when the source is adequate. |
| Change a rule in settings and review again | A new run uses the edited rule without a prompt or code change. The earlier run still shows the original rule. |
| Update a date and remove a source in a later revision | One change per fact, both revisions available to inspect, the lost source called out, and the unsupported claim left out of suggested copy. |
| Send a concern to legal and then save a newer version | An authorized human records the decision for the submitted revision. The history shows who decided, when, and which version. The newer version starts its own decision. |
| Give the system a reply with an incorrect quote | The editor can see which passage could not be matched and can retry or continue manually. |

The UI gives people a next action. The developer keeps rule text in records and the Gemini integration in one place. The model gets the exact draft, source notes, and applicable rules for the job. Use the same examples to evaluate all three.

## Who might buy it

The first adopter to test is a small media desk that already uses ServiceNow for internal approvals and still coordinates publication sign-off across documents and messages. Its editors use the queue day to day. Legal joins when a draft needs clearance.

> Before a story goes live, see what changed, what needs checking, and who signed off on this version. Keep the draft and any requested legal clearance together for your editors.

Ask an editor to walk through two recent stories with last-minute edits. Find where the draft lived, who tracked the remaining questions, and how they proved which version was approved. Time the same work with and without the prototype. Include copying the draft, checking any false alarms, and finding the final decision. Look for faster handoff, no missed high-priority issues in the pilot cases, and someone willing to try it on their next batch of stories. If their publishing or proofing tool already handles the handoff, the case for another app is weak.

## How we turn this into requirements

Use the local **Product Manager Toolkit** for discovery interviews and a short requirements document. Once the team has a workflow to test, use **grill-with-docs** to settle the open decisions, **to-spec** to write testable behavior, and **to-tickets** to split it into demoable steps in the local plan. The online **PM Skills** toolkit offers a discovery workflow for testing assumptions and a separate skill for drafting a product requirements document. [Discovery workflow](https://github.com/phuryn/pm-skills/blob/main/pm-product-discovery/commands/discover.md) · [Create PRD](https://github.com/phuryn/pm-skills/blob/main/pm-execution/skills/create-prd/SKILL.md)

Use the [editable plan](../PLAN.md) for the confirmed workflow and [AI-02](../.scratch/ai-review/issues/02-contract-and-policy.md) to agree the shared example and demo rules.
