# AI-04: Make one offline review pass validation

**Status:** done — local spike against draft 0.2.0
**Owner:** You; backend agrees the validator runtime boundary
**Blocked by:** AI-02 for final team handoff; provisional local work was authorized by the user

The user authorized this local first slice. It is implemented against the draft contract, with team agreement still tracked in AI-02. No live model or ServiceNow setup was performed.

## Outcome

One synthetic article can move through the AI boundary and produce a correctly validated advisory result without calling a model.

## Steps

- [x] Create the local AI module after implementation was requested; keep WildTrack source unchanged.
- [x] Drive the draft review interface with a deterministic provider stub and one synthetic request.
- [x] Validate output shape, rule-set equality, exact evidence references, and structural authority boundaries.
- [x] Verify invalid JSON, invented references, and an approval field cannot become a clean successful review.
- [x] Keep the saved run explicitly labeled as a fixture, not a Gemini response.

## Done when

The valid example is accepted and meaningful invalid examples are rejected or downgraded as specified through the public AI boundary.

## Evidence and current state

Completed 11 November 2026. The Node module, input schema, strict provider parser, exact-evidence/rule/taxonomy checks, frozen request snapshot, coverage handling, and demo are implemented. `npm --prefix ai-review test` passes 17 behavior tests. `npm --prefix ai-review run demo -- --save` writes a labeled handcrafted-response report. The active draft is 0.2.0 after resolving the coverage finding from review.

See the [module guide](../../../ai-review/README.md) and saved demo (local file `ai-review/output/demo-review.md`). This is not evidence of model-generated comparison, semantic review accuracy, team policy approval, or PDI integration. Reopen affected checks if the draft changes during AI-02 handoff.

Add dated evidence here when the step is actually performed.

## References

- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [05-team-handoff-and-delivery-plan.md](../../../docs/05-team-handoff-and-delivery-plan.md)
- [Main plan](../../../PLAN.md)

