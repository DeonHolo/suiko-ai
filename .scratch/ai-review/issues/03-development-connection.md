# AI-03: Connect a development workspace to the PDI

**Status:** done · local SDK connection and repeated updates verified
**Owner:** Deon with the integration teammates
**Blocked by:** AI-01

Deon authorized connecting the instance and establishing the app on 12 November.

## Outcome

A later developer can edit the correct app through the agreed route and verify the connection without replacing teammate work.

## Steps

- [x] Pin SDK 4.14.0 and prove that it builds and installs on the assigned PDI.
- [x] Create `servicenow-app/` and the encrypted local SDK profile `suiko-pdi`.
- [x] Scaffold the shared app and keep its app ID and generated record identities across updates.
- [x] Document the source-edit, build, install, and check loop, including reconciliation of Studio edits.
- [x] Keep credentials out of project files and configure Gemini separately as encrypted runtime data.
- [x] Verify the page, API, app identity, and saved data after an update.

## Done when

The intended app can be read/edited through the agreed development workflow and the unchanged baseline is understood. No application replacement or unrelated schema work is required.

## Evidence and current state

On 12 November, the local push ran 23 checks, built the app, installed the package, and confirmed the page and API. Saved stories, reviews, metadata, edited rule version 2, and provider configuration survived the update. [Project instructions](../../../servicenow-app/README.md) · [Pipeline guide](../../../docs/13-servicenow-development-and-cicd.md)

## References

- [07-local-development-and-pdi-integration.md](../../../docs/07-local-development-and-pdi-integration.md)
- [09-servicenow-connection-research.md](../../../docs/09-servicenow-connection-research.md)
- [Main plan](../../../PLAN.md)

