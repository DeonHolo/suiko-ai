# Scope and project brief

**Project:** Suiko AI · **Team:** Backyardigans · **Date:** 11 November 2026 · **Status:** draft 0.1

The [build plan](../PLAN.md) records the first-build workflow confirmed on 12 November. The examples here explain the initial scope and design goals.

## Project purpose

A newsroom editor should be able to understand what changed in an article, inspect potential editorial-policy conflicts, and consider useful metadata without re-reading every revision unaided. The ServiceNow application retains the article records, review workflow, human decisions, and audit history. AI contributes advisory analysis.

The assignment identifies four core outcomes: summarize revision changes, suggest metadata, flag potential checklist conflicts, and preserve editorial/legal publishing authority. The proposed design below interprets that use case; it is not an additional instructor rubric.

## Your ownership

| Work | Ownership | Your deliverable |
| --- | --- | --- |
| AI review behavior and boundaries | You — confirmed | Review specification and acceptance criteria. |
| Prompt, output structure, evidence rules, and uncertainty | You — confirmed | Versioned prompt, contract, validator requirements, and examples. |
| WildTrack AI adaptation assessment | You — confirmed | Reuse/gap map with source evidence. |
| Newsroom AI evaluation | You — confirmed | Synthetic revision pairs, expected checks, evaluation results when run. |
| AI review UX/UI | Deon designs and builds the panel | Findings layout, evidence interaction, metadata decisions, and review states. |
| Wider application frontend | Other teammate(s) | They implement navigation, article editing, and the overall application experience. |
| Backend / ServiceNow implementation | Other teammate(s) | They implement records, access controls, provider transport, secrets, jobs, persistence, approvals, and audit. |
| Editorial policies and publication decisions | Human reviewers / team scenario owner | They approve the checklist, judge findings, and authorize publication. |

You define the behavior of AI-specific validation. Its final runtime location is a team integration decision. Defining a retry or freshness requirement does not make you the owner of backend infrastructure.

## Example demo story

A reporter submits revision 2 of a fictional article about a community library opening. Revision 1 says that the opening is on December 5 and attributes the expected attendance to the organizers. Revision 2 changes the date to December 12, raises the attendance figure, and removes that attribution.

The reviewer opens AI Review and sees the date and attendance changes with old/new quotations. The checklist panel flags the current numerical claim for attribution review under a specific policy rule. The metadata panel suggests a section and tags from the newsroom's supplied vocabulary. An editor can dismiss the concern with a reason, request changes, or route the article to the legal reviewer through the application workflow. AI cannot approve or publish it.

This is a synthetic scenario. No real reporting, personal information, or claim about an actual organization is needed for the initial demonstration.

## Initial AI scope

1. **Change summary:** explain meaningful differences between a supplied baseline and candidate revision. On a first draft, explicitly report that there is no baseline.
2. **Metadata suggestions:** suggest a section, tags, and short description using the candidate text and approved vocabulary. Leave unsupported suggestions empty.
3. **Checklist assessment:** assess every supplied rule with a stable ID, supporting evidence where available, and an explicit outcome when the available text cannot answer the rule.
4. **Evidence and limitations:** connect concerns to the exact revision and source segment, and distinguish uncertainty from a technical failure.

Proposed first-release inputs are English title/body text, at most 12,000 characters per revision, and at most 12 approved rules. These are deliberately small pilot limits, not Gemini platform limits. Backend teammates enforce and report them without silently truncating content.

## Outside the initial AI scope

The initial review does not fact-check the open web, determine legal liability, detect plagiarism, authenticate sources, infer unseen permissions, or decide publication. It does not operate as an autonomous publishing agent. Images, OCR, uploaded PDFs, multilingual review, and long-form investigations can be considered after the core revision contract works.

This boundary keeps the first demonstration assessable. For example, AI may report that a supplied paragraph lacks visible attribution under a newsroom rule; it cannot claim the reporter has no source or that the allegation is legally actionable.

## UX, DX, and AX decision criteria

Here AX means the experience of development assistants and any authorized program consuming the AI result: explicit inputs, stable identifiers, predictable outputs, and clear authority boundaries. It does not require an autonomous agent at runtime.

| Proposed decision | UX benefit | DX benefit | AX benefit |
| --- | --- | --- | --- |
| One versioned review contract | Consistent findings and states | One integration target and reusable fixtures | Typed fields and stable IDs reduce inference |
| Frozen baseline/candidate snapshots | The reviewer knows exactly what was checked | Reproducible debugging and caching | Staleness and source identity are machine-checkable |
| Exact evidence plus policy IDs | Concerns are inspectable | Shared grounding validator | Unsupported references can be rejected deterministically |
| Distinct processing, assessment, and decision states | An outage cannot look like a clean review | Simpler state transitions | Successful processing cannot be mistaken for approval |
| Changes first; evidence on demand | Editors reach important edits quickly | Shared result components | One ordered result structure supports UI and tooling |
| Text-first newsroom pilot | Stable paragraphs and readable comparisons | Smaller adapter and test surface | Deterministic source references without PDF ambiguity |
| Reuse WildTrack behavior before selecting a transport | Familiar advisory/evidence patterns | Avoid re-solving proven problems | Preserved contracts and regression cases |

For a new decision, write one concrete benefit in each column and identify how to verify it. Revisit decisions that help only one audience by creating unexplained work or ambiguity for the others.

## Success evidence

Success means a human can identify important revision changes, inspect the basis for a concern, and understand which suggestions remain unaccepted. The AI result must be reproducible from recorded inputs and never contain a publication decision. The evaluation plan defines proposed thresholds; none have been measured for this newsroom adaptation yet.
