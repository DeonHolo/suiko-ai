# AI-07: Return a fixed review through ServiceNow

**Status:** superseded · live PDI path proved directly in AI-09
**Owner:** Backend teammate, with you validating AI semantics
**Depends on** a saved revision from AI-13

The authorized 12 November implementation connected a saved revision to live Gemini directly. A fixture-only PDI endpoint was not added. The local AI module retains deterministic fixtures for its checks. The original checklist below remains available if the team later needs a fixture-based PDI test.

## Outcome

An authorized request from the team app produces a saved, inspectable synthetic review without model variability.

## Steps

- [ ] Map the saved story, revision, notes, and prepared rule input to the agreed request.
- [ ] Connect the editor's **Review this version** action to the saved run and result records.
- [ ] Return a deterministic fixture assessment and label its provenance as a fixture.
- [ ] Verify input identity, evidence navigation data, currentness, and authorization in the PDI.
- [ ] Confirm review generation changes no article content, approval, or publication state.

## Done when

A prepared result travels through the real application boundary and is saved on the intended story and version. Deon can load that same result in the panel.

## Evidence and current state

AI-09 now supplies saved PDI results and request snapshots to Deon's panel. Tests at the local boundary remain deterministic. [Working project](../../../servicenow-app/README.md)

## References

- [07-local-development-and-pdi-integration.md](../../../docs/07-local-development-and-pdi-integration.md)
- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [Main plan](../../../PLAN.md)

