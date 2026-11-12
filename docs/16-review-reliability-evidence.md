# AI-16: usable reviews and clear failures

**Owner:** Deon. **Date:** 12 November 2026.

## What changed

The app now checks review sections independently. A bad observation can be excluded while usable findings, metadata or changes remain visible. An unresolved rule shows Needs confirmation. A rule cannot be labelled clear while its retained findings say it has concerns.

Missing evidence is explained as missing evidence. A real quote mismatch shows Gemini's quote beside the saved passage. The checked result is what gets saved as the usable review. Earlier failed attempts remain unchanged and clearly unverified.

An internal overview can have its own passage references and remain available when an unrelated section fails. Rejected material affecting that summary still withholds it. An internal summary can explain a valid concern; suggested public metadata receives a separate check. Rejected descriptions and withheld overviews are available as labelled unverified wording, so the editor can inspect what Gemini actually returned.

## Repeatable checks

**42 local tests pass.** They cover existing strict review behaviour plus the workbench's partial results, status contradictions, missing/mismatched quotes, inapplicable rules, metadata vocabulary, public descriptions, independent overview evidence, malformed/duplicate-key JSON, frozen inputs and rule identities.

Two minimized historical replies from the fictional radio test are committed as regression fixtures. They now preserve their findings and explain the old missing-evidence problem. These fixtures verify application behaviour; they do not establish complete editorial accuracy.

## Live ServiceNow checks

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

Quotation matching establishes that words were present in the supplied material. It does not prove that a source supports a claim or that Gemini found every concern. The differing live results demonstrate why the later claim-by-claim source review and fresh-case evaluation are still needed.

The ordinary Editor/designated-editor permission work for company-policy setup belongs to the later approved-rule slice. These live checks used the existing admin session and did not exercise the full human/legal workflow.

References: [AI-16 ticket](../.scratch/ai-review/issues/16-useful-partial-reviews.md), [implementation log](../.scratch/ai-review/implementation-log.md), [approved specification](../.scratch/ai-review/company-policy-review-spec.md).
