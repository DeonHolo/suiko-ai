# AI-16: usable reviews and clear failures

**Owner:** Deon. **Date:** 12 November 2026.

## What changed

The app now checks review sections independently. A bad observation can be excluded while usable findings, metadata or changes remain visible. An unresolved rule shows Needs confirmation. A rule cannot be labelled clear while its retained findings say it has concerns.

Missing evidence is explained as missing evidence. A real quote mismatch shows Gemini's quote beside the saved passage. The checked result is what gets saved as the usable review. Earlier failed attempts remain unchanged and clearly unverified.

An internal overview can have its own passage references and remain available when an unrelated section fails. Rejected material affecting that summary still withholds it. An internal summary can explain a valid concern; suggested public metadata receives a separate check. Rejected descriptions and withheld overviews are available as labelled unverified wording, so the editor can inspect what Gemini actually returned.

## Repeatable checks

**50 local tests pass for AI-16.** They cover existing strict review behaviour plus partial results, status contradictions, missing/mismatched quotes, inapplicable rules, metadata vocabulary, public descriptions, independent overview evidence, malformed/duplicate-key JSON, frozen inputs, rule identities and saved-attempt handling.

Two minimized historical replies from the fictional radio test are committed as regression fixtures. They now preserve their findings and explain the old missing-evidence problem. These fixtures verify application behaviour; they do not establish complete editorial accuracy.

## Live ServiceNow checks

### Evidence for each Done when item

| Requirement | Named repeatable check | ServiceNow evidence |
| --- | --- | --- |
| No clear sourcing status alongside missing-source findings | `a clear sourcing assessment cannot coexist with its retained missing-source finding` and `the recorded fictional radio replies now retain findings and explain their old failures` in [workbench-review.test.js](../ai-review/test/workbench-review.test.js) | Manual radio attempt at 11:07:32 UTC retained both missing-source observations. |
| Outside-media check can be Not applicable without an invented quote | `an inapplicable outside-media check does not need an invented passage` in the same file | Manual radio attempt at 11:07:32 UTC returned Not applicable. |
| Bad finding preserves independent sections and labels the gap | `an invented finding quote leaves other sections usable and shows the actual mismatch`; `an unknown-rule finding cannot lend its rejected passage to the overview` | Manual 11:13:52 UTC radio attempt retained metadata. The installed issue labels were inspected in the in-app browser. The automated server test also saved a partial checked result. |
| Malformed reply stays failed with draft/retry available | `unreadable JSON remains a saved failed attempt, with an inspectable excerpt` in [review-attempt.test.js](../ai-review/test/review-attempt.test.js) | Automated test **Suiko AI-16: checked review persistence and retry** passed, including malformed JSON, intact draft, retry and reopened history. |

These are application-reliability checks. Editorial judgments remain advisory information for the editor; uncertainty does not require truth certification.

### Automated save-path proof

[review-tests.now.ts](../servicenow-app/src/fluent/review-tests.now.ts) installs the server-only test. Its [test module](../servicenow-app/src/server/review-persistence-test.ts) uses actual GlideRecords, installed generated validators and the same `persistReviewAttempt` function called by `runReview`. It injects fictional replies and makes no Gemini calls.

The passing test covers a partial result saved as complete with checked JSON; a checklist mismatch saved as failed with the unchecked reply and named diagnostic; unreadable JSON saved as failed with an inspectable excerpt; released revision locks; retry of that same revision; four attempts reopened through `getState`; and an unchanged saved draft.

- [Passing suite](https://dev309702.service-now.com/sys_atf_test_suite_result.do?sys_id=9554f44d83649b106fffc629feaad357).
- [Passing test](https://dev309702.service-now.com/sys_atf_test_result.do?sys_id=5d54f44d83649b106fffc629feaad35d).
- [Passing step and assertion summary](https://dev309702.service-now.com/sys_atf_test_result_step.do?sys_id=6d54f44d83649b106fffc629feaad38b).

Earlier attempts exposed a running-marker save problem. The handler now reopens the inserted attempt before updating it and clears the marker explicitly. Test logic runs in the same SDK module context as production. A missing module extension in test wiring was also corrected. The final rerun passed; previous runner settings were restored after every test run.

This automation covers persistence and generated validation, not a simulated HTTP round trip to Gemini. The three real provider requests below were manual browser checks.

### Manual provider checks

The unchanged first version of **Bracken Sound Radio announces The Spare Key** was selected and reviewed through the in-app browser. Expected results were recorded before the run. The draft contains a named bulletin, a cast-roster note, and two numerical claims without identified sources: six weeks of recording and 420 registrations.

| Attempt | What happened | Interpretation |
| --- | --- | --- |
| 10:59:44 UTC / 18:59:44 Singapore | Gemini 3.5 returned busy; the existing fallback used 3.1 Flash-Lite. The app retained metadata and marked missing outside-media evidence unresolved. Gemini incorrectly assumed an implied station source covered both numerical claims. | The new failure handling worked. The two missed sourcing concerns remain a model-quality failure, recorded for the later claim/source review work. |
| 11:07:32 UTC / 19:07:32 Singapore | The fallback again used 3.1 Flash-Lite. Gemini flagged both numerical claims and marked outside media Not applicable. The app retained the finding and metadata section/tags; the public description was withheld because its evidence included flagged passages. | The editorial findings matched expectations. This exposed overly conservative handling of an internal overview when a public description was withheld; that distinction was corrected and covered by a new regression test. |
| 11:13:52 UTC / 19:13:52 Singapore | Gemini 3.5 Flash-Lite responded directly. One overview reference contained a mistyped revision identity, so the overview was withheld and preserved as unverified wording. Checked section/tags/description remained available. Gemini again missed the two unsupported numerical claims. | The invalid-reference path and useful partial result were exercised live. Editorial accuracy remains a separate unresolved issue for AI-21/AI-23. |

Each attempt records the actual model and any fallback. The third attempt used Gemini 3.5 directly; the first two used 3.1 after busy responses. No web pages were opened for sourcing in these attempts; source retrieval belongs to AI-20.

The latest installation passed the SDK's frozen-key build and page/API smoke checks. The JSON parsing dependency triggers SDK warnings about its generated wrapper's browser-global fallbacks; installed API and live parsing/result paths have run successfully. This is tested compatibility for the exercised path, not a claim that all npm packages run unchanged in ServiceNow.

Independent overview retention and rejected wording inspection pass in the local tests. The live runs also exercised the path that withholds an overview when its own reference is invalid. Private full inputs, run JSON and screenshots stay in the ignored local output directory; the ticket/log records the PR reference.

## What this does not prove

All four inline CodeRabbit findings were applicable and corrected: unknown-rule evidence now affects overview independence; the prompt names the exact status value; issue cards identify their rule/section; and completion claims map to named evidence above. New attempts require overview references while historical response compatibility remains available. AI-23 now includes stale rule approval. Static child-key warnings were not applied because the mapped outer article already has a React key.

Quotation matching establishes that words were present in the supplied material. It does not prove that a source supports a claim or that Gemini found every concern. The differing live results demonstrate why the later claim-by-claim source review and fresh-case evaluation are still needed.

The ordinary Editor/designated-editor permission work for company-policy setup belongs to the later approved-rule slice. These live checks used the existing admin session and did not exercise the full human/legal workflow.

References: [AI-16 ticket](../.scratch/ai-review/issues/16-useful-partial-reviews.md), [implementation log](../.scratch/ai-review/implementation-log.md), [approved specification](../.scratch/ai-review/company-policy-review-spec.md).
