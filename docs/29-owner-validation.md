# Owner validation and remaining acceptance

These checks use fictional stories in the team development instance. Expectations were saved before model calls in `ai-review/output/owner-validation-2026-11-13/expected-results.md`. Raw replies, failures, checked results, browser states and screenshots remain in the ignored output folder. The repeatable [media pack](../ai-review/fixtures/owner-media-pack.json) uses isolated fixture rules; it does not edit live approvals.

## Reviewed and installed history fix

[PR #22](https://github.com/DeonHolo/suiko-ai/pull/22) merged as `b89af61`. Its new refresh regression failed before the fix. All 21 screen checks, 99 AI checks and the frozen-key SDK build passed. CodeRabbit marked the functional finding addressed; separate requirements and standards reviews found no other issue.

The installation preflight found no app-file changes in Studio after the prior install at 14:13 UTC. Before/after fingerprints preserved all 18 existing stories and their captured revisions, reviews, source snapshots, publishing choices, rule approvals and policy records. Provider configuration remained available. The SDK build completed with its existing generated-dependency scanner diagnostics.

The actual in-app browser worked. Using an ordinary Editor, view A held an unreviewed Version 2 and unsaved text; view B completed its review. Refresh in A selected the current result, removed the unreviewed placeholder and preserved the text. Selecting the Version 1 review and refreshing preserved that selection and its saved description. These were two views of the same ordinary account, rather than two independently authenticated people.

## Actual source and Decision 1 results

Story `8d67aa5583605f106fffc629feaad392` has a first draft and corrected revision. The main first review fell back from Gemini 3.5 Flash-Lite after HTTP 503 to 3.1 Flash-Lite; the revised review completed on 3.5. Both read the public noon brief and text PDF, and recorded the missing URL as unavailable. No claim cited the unrelated PDF. Missing-link status did not erase the usable overview or publishing controls.

| Saved copy | Main review | Decision 1 |
| --- | --- | --- |
| Version 1: 11 a.m. | Conflicts with the brief's noon | Conflict, 98.12% |
| Version 1: 40 seats | Support found | Support, 99.32% |
| Version 1: three-dollar entry | Needs confirmation; price is pending | Needs confirmation, 96.43% |
| Version 2: noon | Support found | Support, 99.36% |
| Version 2: 40 seats | Support found | Support, 99.27% |
| Version 2: admission pending | Support found | Support, 68.48% |

Decision 1 completed all three eligible comparisons in each installed review: 295 ms/1,193 input tokens and 241 ms/1,186 input tokens respectively. These are observed calls, not controlled performance benchmarks. Confidence is not proof of truth. The revision summary identified the actual title, time and admission edits. The first review retained the Editor's description.

The earlier Harbor teaser remains a different case: its IANA link was skipped because no applicable approved rule requested sources, and none of its original four reviews requested Decision 1. The saved Makers’ Night disagreement remains historical evidence; it is not a new model result from this validation.

## Permission improvement and observed failures

The baseline controlled Cedar Frame script again asked for the outside photo's permission but returned Potential conflict under both rights rules. After the instruction refinement, the same frozen input returned Needs confirmation under both rules on separate 3.5 and 3.1 runs. Staff-only material produced no rights concern, explicitly denied footage still produced a conflict under the broad rule, and missing/visible paid disclosures remained distinct on the completed 3.1 comparison. No approved live rule was rewritten.

Gemini 3.5 returned several HTTP 503 failures, retained alongside successes. The comparisons on 3.1 were run explicitly and recorded separately. Some replies still supplied invalid concern references or tried to support public metadata with internal notes; the validator removed those suggestions and exposed the gaps. These are unresolved model-quality limits.

The original pilot's strict staff-only status expected Not applicable; No issue found is also an acceptable no-warning result. Its expectation for the narrow missing-record rule on an expressly denied clip was too prescriptive. Both original expectations and mismatches remain saved; the reusable rubric explains the correction.

The held-out licensed-audio caption produced no missing-permission warning, and a different-format outside-photo caption requested confirmation. In the broader controlled source run, Flash-Lite omitted the 40-seat check from the first article and omitted admission-pending from the revision. The installed reviews did cover those facts. The omissions remain recorded, and there is no claim of complete model coverage.

## Decision 1 context regression

A held-out Orchard Screen auditorium case used a Halyard brief about a different project. Flash-Lite correctly returned insufficient support. The optional check, which received only the isolated seats sentence and source, returned Support at 51.57%. Its request lacked the story context identifying Orchard Screen.

A new regression failed on that missing context. The second opinion now receives the current public title/body/caption once alongside its claim cases. Internal notes and the baseline are excluded; the current story identifies the claim's subject and is not independent source evidence. The question version is `source-support-3`.

Replaying the identical saved claim/source material with that context changed Decision 1 to Needs confirmation at 97.72%. The conflicting-time, unknown-price and supported-time/seat comparison labels remained appropriate. All 100 AI checks pass. This context rerun was a real Decision 1 API call from the local evaluation; installed verification of the new question remains separate until deployment.

## Repeating the controlled pack

From the repository root, prepare the existing generated prompt and validators, then run the live evaluation:

```sh
node servicenow-app/scripts/prepare-review.mjs
node servicenow-app/scripts/evaluate-media.mjs gemini-3.1-flash-lite --decision
```

The runner reads the existing ignored local Gemini configuration. It saves full expectations and immutable inputs before calling either model, then saves raw/checked replies, HTTP failures, exact evidence issues, expected/actual rule and claim outcomes, and optional Decision 1 requests/results in a new ignored output folder. It does not perform new source retrieval or use live company approvals. `--dry-run` saves the plan without model calls; `--cases=article-sources,article-revision` selects a smaller pack. A nonzero result preserves failures or misses for inspection instead of treating them as a pass.

## Boundaries still to verify

Ordinary Editor save/review/source inspection and publishing-choice actions passed. The installed server regression suite passed its non-admin permission checks and restored its runner settings. A direct policy API URL opened in the browser returned unauthenticated; that result does not establish a role-specific denial. The server suite supplies the separate direct-action authorization evidence.

Keyboard activation and Escape returned focus to the sample-dialog opener. Labels, loading, partial results and historical read-only publishing controls were inspected. A requested 390px viewport was clamped by the in-app browser to a wider rendered view; the narrower view fitted, but that capture alone does not prove a 390px phone layout. A full assistive-technology audit is still pending.

Archive, Legal and human decisions remain platform-team dependencies. Component simulations verify prepared frontend behavior; they do not complete a teammate ticket or prove live assignment, deletion, retention or clearance guards. Teammate PRs remain for Deon's approval. Final installed follow-up and account cleanup are recorded below when complete.
