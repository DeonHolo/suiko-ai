# AI-09: Return a real review through the PDI

**Status:** in-progress · live reviews saved, broader verification remains
**Owner:** Backend teammate with you owning AI behavior and validation
**Depends on** AI-06, saved revisions, AI-14

Deon authorized the live PDI review spike on 12 November.

## Outcome

The editor can click **Review this version** in the app and get a saved Gemini review for that submitted draft.

## Steps

- [x] Use the direct Gemini route from ServiceNow's server-side REST API.
- [x] Configure backend-owned provider credentials and the PDI-reachable endpoint.
- [x] Save the exact revision, earlier submission when applicable, supplied notes, and rule versions used by the run. Validate its response against those inputs.
- [x] Run a synthetic first draft and a later revision through the PDI. Check that the active rule version appears in each result.
- [ ] Edit a shared rule and rerun the same saved revision. Compare its rule snapshot with the older run.
- [x] Keep the provider key on the server, require an editor action to save metadata, and leave sign-off to the human workflow.

## Done when

A real provider result is validated, persisted, and displayed or inspectable against the intended PDI revision. Record the actual route and versioned deployment evidence.

## Evidence and current state

Both river versions completed on Gemini 3.5 Flash-Lite in the PDI. Version 1 had a useful overview and no concerns under the supplied rules. Version 2 grouped the schedule change and flagged undocumented outside-footage permission. Its description left the internal clip note out. Busy responses are retained as failed attempts on the same revision. The server now makes one 3.1 Flash-Lite attempt if 3.5 returns HTTP 503 and records which model ran. A same-revision rerun after an edited rule and ordinary-account checks remain part of the broader verification. [Project instructions](../../../servicenow-app/README.md)

## References

- [07-local-development-and-pdi-integration.md](../../../docs/07-local-development-and-pdi-integration.md)
- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [Main plan](../../../PLAN.md)

