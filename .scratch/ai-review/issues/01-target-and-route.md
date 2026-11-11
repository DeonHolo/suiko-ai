# AI-01: Identify the shared app and integration route

**Status:** done · app and route established on 12 November 2026
**Owner:** Deon with the integration teammates
**Blocked by:** None

Deon authorized app setup and a repeatable local-to-PDI development route on 12 November.

## Outcome

The team knows which existing ServiceNow app receives AI review and which development/runtime routes will be used.

## Steps

- [x] Record the shared app name, scope, and sys_app ID. Record missing instance facts explicitly.
- [x] Establish Deon's local SDK route and document how teammates share the app identity.
- [x] Prove SDK installation and outbound integration through the live workbench.
- [x] Use a direct server-side Gemini adapter, shared prompt and checks, and encrypted provider configuration.

## Done when

App identity and ownership are explicit; the chosen route has evidence or a named unresolved prerequisite. Missing instance facts are recorded as missing, not invented.

## Evidence and current state

On 12 November, the SDK connected to `dev309702.service-now.com`. The shared app is **Suiko AI**, scope `x_2236136_suiko_ai`, sys_app ID `b47095969f3848a7bdf385b3650b68c2`. SDK 4.14.0 built and installed it repeatedly. Its page and API work, and the PDI called Gemini successfully. The platform release-family name remains unrecorded. Deon coordinates this first local implementation. No prior teammate app was replaced.

The direct adapter keeps the editor's saved copy and review together, avoids a separately hosted WildTrack service, and uses the same request snapshots and quote checks. [Working project](../../../servicenow-app/README.md)

## References

- [07-local-development-and-pdi-integration.md](../../../docs/07-local-development-and-pdi-integration.md)
- [09-servicenow-connection-research.md](../../../docs/09-servicenow-connection-research.md)
- [Main plan](../../../PLAN.md)

