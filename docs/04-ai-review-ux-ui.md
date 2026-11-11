# AI review UX/UI brief

Deon designs and builds the AI review panel. The frontend teammate builds the story page that contains it. Use [AI-08](../.scratch/ai-review/issues/08-ai-review-interface.md) for the agreed first-build actions and this brief for reference layouts.

## Reviewer goal

The editor should see the important changes, understand why a checklist item needs attention, and decide what to do with suggestions while keeping the article's original context accessible.

The interface should use the same revision IDs, policy rules, assessment states, and source references as the contract. Do not create a second interpretation of the AI result in frontend-only labels.

## Proposed layout

Use one review page or an AI Review panel inside the article record. The header identifies the candidate revision, baseline, and review state. A single primary action starts a review or opens the latest current review. Avoid duplicate buttons for the same action.

```text
Article title                         Revision 2 compared with 1
AI Review                            [Review revision 2]

[Changes] [Checklist] [Metadata]      Review completed · Current

Changes
Opening date changed from December 5 to December 12.
[Show before and after]

Checklist
Attribution needed                   Attribution of numerical claims
More than 500 residents are expected to attend.
[Show evidence]                       [Record decision]
```

This is a structural sketch, not a finished design or a screenshot of an implementation. Exact placement depends on the team's selected ServiceNow experience technology.

## Changes view

Lead with up to six meaningful changes. Expanding a change shows the old and new excerpts, revision labels, and links to the corresponding article segments. Distinguish added, removed, and changed content in text as well as visually. Preserve the reader's place when opening or closing evidence.

The deterministic comparison can be available beside the summary. A reviewer should be able to inspect changes even when AI generation fails; the backend/frontend teams can provide that fallback independently of the AI explanation.

Do not merge a detected change with a policy judgment. A changed date is a factual difference between supplied revisions; whether the new date is correct can require human verification.

## Checklist view

Show each supplied policy rule and its assessment. Put potential conflicts and manual checks first, while keeping every rule discoverable. Concerns show a concrete next action, the relevant article excerpt, and the exact policy text available on demand.

Use concise labels such as **Needs attention**, **Verify manually**, **No concern observed**, and **Not applicable**, mapped directly to the contract. Never label AI output **Approved**, **Legally cleared**, or **Safe to publish**.

A reviewer can record **Request changes**, **Dismiss concern**, or **Needs legal review** if those actions fit the team's workflow. These are authenticated human decisions stored separately from the original AI assessment. A dismissal requires a reason. The backend owns authorization and durable audit; your UX specification defines the interaction.

## Metadata view

Show the existing value beside the proposed section, tags, or short description. Provide **Accept** and **Keep current** for each field. Accepted values become recorded human edits through the backend; generating or opening a suggestion changes nothing by itself. Accepting one field leaves unchanged article findings and other independently current suggestions usable. If another editor changed that field, refresh its comparison before applying an old suggestion.

Show no invented byline, source identity, event detail, or new taxonomy label. If evidence is insufficient, show no suggestion for that field. Outdated suggestions remain inspectable as history but cannot be applied to the current revision.

## State design

| State | Reviewer sees | Available action |
| --- | --- | --- |
| Not reviewed | Current revision and baseline selection | Review current revision |
| Queued / reviewing | Processing state; readable article remains available | Continue reading; avoid duplicate run |
| Completed with observations | Changes, rule assessments, suggestions | Inspect evidence and record human decisions |
| Partial / unable to assess | Specific limitation and affected rules | Verify manually or supply missing input |
| Technical failure | Short cause category, distinct from article findings | Retry when appropriate |
| Outcome unknown | Prior attempt may have reached the provider | Explicit retry after acknowledgement |
| Outdated | The reviewed revision/policy differs from current inputs | Open historical result or review current revision |

Do not show a green completion state as proof of article quality. Processing success, content assessment, freshness, and human approval are separate facts.

## Accessibility and interaction requirements

Tabs, evidence expansion, suggestion decisions, and dialogs must work by keyboard with visible focus. Status changes should be announced without moving focus unexpectedly. Source excerpts remain selectable text. Labels and icons supplement color; evidence highlights must remain understandable without color alone.

On narrow layouts, stack old/new excerpts with explicit revision labels rather than forcing horizontal scrolling. Keep the concern, next action, and source link together. Use progressive disclosure for detailed policy text and run diagnostics; do not fill the page with repeated advisory taglines or implementation details.

## UX/DX/AX verification

| Design choice | UX check | DX check | AX check |
| --- | --- | --- | --- |
| Shared contract labels | Editor distinguishes failure from uncertainty | One state mapping | Same enum has one meaning everywhere |
| Revision-linked evidence | Editor reaches the correct excerpt | One source-link component | References resolve without inferred context |
| Field-level metadata acceptance | Editor sees exactly what will change | Small, auditable update operation | Suggested and accepted values stay distinct |
| Outdated-result handling | Editor cannot apply old suggestions accidentally | Explicit freshness condition | Currentness is machine-readable |

Before implementation, review one normal, one partial, one failed, and one outdated example with the frontend/backend teammates. If you own UI implementation as well as design, select the ServiceNow component route with the frontend owner before translating these states into code.
