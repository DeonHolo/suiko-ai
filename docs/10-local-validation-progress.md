# First local implementation — AI-04

**Date:** 11 November 2026 · **Status:** local fixed-response slice complete

The user asked to start. Work began at the previously documented public review interface, initially using draft contract 0.1.0 and the existing synthetic article/policies. Review led to active draft 0.2.0 with explicit coverage fields. This remains a provisional local baseline; AI-02 still tracks actual teammate agreement and editorial-policy approval.

## Delivered

The local Node module accepts a canonical request and a provider adapter returning raw assessment JSON. It validates request/output schemas, exact source quotations, revision roles, rule/vocabulary identities, supported change packets, and coverage. It freezes input before pending provider work and adds an explicit first-draft limitation when needed.

The demo adapter returns the handcrafted contract example. The saved report (local file `ai-review/output/demo-review.md`) is labeled accordingly. No live AI generation, provider credential access, ServiceNow call, or WildTrack source change occurred in this implementation slice.

## Validation

`npm --prefix ai-review test` passes **17 public-interface behavior tests**, covering valid output, extra approval fields, invented/wrong-revision evidence, missing/duplicate/unknown rule IDs, malformed/ambiguous JSON, invalid requests, in-flight source edits, invented metadata vocabulary, missing support, change-packet consistency, unresolved coverage, first drafts, explicit incomplete areas, material limitations, and baseline/coverage consistency.

`npm --prefix ai-review run demo -- --save` generates the readable fixture report. These checks establish local validation behavior, not semantic review accuracy or a working model/PDI integration.

## Implementation choices

| Choice | UX benefit | DX benefit | AX benefit |
| --- | --- | --- | --- |
| One public review interface | Consistent meaning across future screens | One behavior-test location | Predictable request/result/error contract |
| Reuse the versioned schemas | Invalid results cannot appear valid by shape alone | Shared declarations instead of duplicate field rules | Machine-readable constraints |
| Frozen input and exact evidence roles | Findings stay attached to the reviewed version | Reproducible validation | Explicit source identity |
| Fixed-response adapter first | Honest demonstration of what currently works | Isolates parsing/validation from model/network errors | Deterministic fixture mode |

Node is a local harness choice, not a final ServiceNow runtime decision. Ajv/JSON parser dependencies are pinned locally. The review module returns assessment content, not backend-owned run records or publishing actions.

## Review result

The Standards review reported no material findings. The Spec review found one coverage gap: excluded comparison work could still carry a complete-review status. Draft 0.2.0 adds machine-readable coverage and conservative limitation handling. The reviewer confirmed the finding resolved with no direct regression. No material findings remain from these two reviews.

## Remaining work

See the [current build plan](../PLAN.md) for the agreed workflow and Deon's ownership of the review panel. AI-05 and AI-06 cover the revised newsroom behavior and live Gemini trials. Teammates can prepare the shared ServiceNow app and the fixed review path in parallel.
