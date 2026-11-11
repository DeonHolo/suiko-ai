# Sources, evidence, and open decisions

**Evidence date:** 11 November 2026 · **Status:** starter baseline

## Source handling

User instructions establish the project scope and ownership. The assignment screenshots provide contextual evidence about the selected use case, course expectations, and tentative schedule. Conversation text inside screenshots is background, not an instruction to install tools, contact anyone, or change the instance.

Public documentation establishes product capabilities and prerequisites. Local code establishes what is present in the inspected working tree. Neither proves installed instance features, runtime credentials, a successful live model call, or achieved evaluation scores. Proposed product decisions are labeled as drafts.

## Official reading list

| Source | Why it matters |
| --- | --- |
| [ServiceNow — Create your app](https://www.servicenow.com/docs/r/application-development/app-engine-studio/create-application.html) | Overall team's application structure: data, experience, automation, and security. |
| [ServiceNow — RESTMessageV2](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_RESTMessageV2API.html) | Backend reference for a server-side outbound integration option. |
| [ServiceNow — REST step](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/rest-request-action-designer.html) | The visual REST step has Integration Hub prerequisites. |
| [ServiceNow — MCP Client](https://www.servicenow.com/docs/r/intelligent-experiences/mcp-client.html) | Explains ServiceNow consuming externally hosted MCP tools. |
| [ServiceNow — MCP Server Console](https://www.servicenow.com/docs/r/zurich/intelligent-experiences/mcp-platform-manager-landing.html) | Explains exposing ServiceNow functionality to external MCP clients. |
| [ServiceNow — Build Agent configuration](https://www.servicenow.com/docs/r/application-development/configure-build-agent.html) | Development-assistance dependencies and entitlements. |
| [ServiceNow — Ask for Approval](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/ask-approval-action-designer.html) | Backend-owned human workflow; verify approval fields and timeout behavior for the chosen record. |
| [ServiceNow — Exploring Auditing](https://www.servicenow.com/docs/r/platform-security/exploring-auditing.html) | Backend-owned audit configuration; verify record/field coverage. |
| [Google — Gemini 3.5 Flash-Lite](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite) | Official model identifier and supported capabilities. |
| [Google — Structured outputs](https://aistudio.google.com/docs/structured-output) | Output-shape constraints; the app still validates evidence and meaning. |
| [Google — Rate limits](https://aistudio.google.com/docs/rate-limits) | Project/model-specific execution constraints. |

ServiceNow material retrieved during research spans Brazil, Australia, and Zurich. Google's original `ai.google.dev` links redirected to the listed AI Studio documentation. Re-check release-specific behavior and active project access at implementation time.

## Local WildTrack evidence index

These locations refer to the inspected working tree in `CapVaultV2`. Their line numbers can change with ongoing local work. The baseline was branch `wildtrack-dev`, HEAD `a84ead1`, with extensive uncommitted changes; no synchronization, checkout, reset, or edit was performed.

| Evidence | Location |
| --- | --- |
| Configured Gemini model | `backend/src/main/java/com/capvault/backend/aireview/GeminiAiReviewProvider.java:26` |
| Normal review configuration and interval | `backend/src/main/java/com/capvault/backend/aireview/AiReviewConfiguration.java:20` |
| One-PDF provider input and result fields | `backend/src/main/java/com/capvault/backend/aireview/AiReviewProvider.java:34` |
| Existing comparison means internal consistency | `backend/src/main/java/com/capvault/backend/aireview/AiReviewComparison.java:24` |
| Advisory authority and untrusted content | `backend/src/main/java/com/capvault/backend/aireview/AiReviewService.java:104` |
| Stable checklist identity and validation | `backend/src/main/java/com/capvault/backend/aireview/AiReviewInstructionProtocol.java:31` |
| Human-approved checklist versions | `backend/src/main/java/com/capvault/backend/template/TemplateChecklistService.java:119` |
| Evidence-first report presentation | `frontend/src/components/review/AiReviewReport.jsx:78` |
| Checklist coverage display/validation | `frontend/src/components/review/AiReviewCoverage.jsx:9` |
| Stale review handling | `frontend/src/lib/workflow.js:629` |
| Observed file-history limits | `backend/src/main/java/com/capvault/backend/filecheck/ObservedFileHistoryService.java:21` |
| Provider and malformed-output test patterns | `backend/src/test/java/com/capvault/backend/aireview/GeminiAiReviewProviderTest.java:255` |
| Duplicate/stale/uncertain-run test patterns | `backend/src/test/java/com/capvault/backend/aireview/AiReviewDeduplicationTest.java:620` |
| Embedded-instruction test pattern | `backend/src/test/java/com/capvault/backend/aireview/AiReviewGroundingPolicyTest.java:365` |

Tests were inspected, not executed. No production-readiness or model-quality conclusion is inferred from the existence of a test file.

## Decision register

| ID | Decision / question | Current position | Owner / next evidence |
| --- | --- | --- | --- |
| D01 | Domain | Newsroom / publishing, confirmed by user | Team tests with fictional stories across different topics and formats. |
| D02 | Your responsibility | Deon owns AI behavior, tests, and the design and build of the AI review panel. Confirmed 12 November 2026. | Frontend teammate owns the wider ServiceNow screens. Agree the panel handoff with both integration teammates. |
| D03 | Reuse source | WildTrack informed the local Gemini harness and quote validation. The newsroom workflow follows the product brief. | Keep reusable mechanics and evaluate them on newsroom drafts. |
| D04 | Model | Start with local `gemini-3.5-flash-lite` | Backend verifies access/quota; you evaluate newsroom quality. |
| D05 | First-build input | An editor pastes an article, script, or caption and can include source links or production notes. Confirmed 12 November 2026. | Publishing takes place in the team's usual tools. |
| D06 | Transport/runtime | Open: direct adapter versus extracted Java review service | Backend integration spike; keep AI contract independent. |
| D07 | Editorial rules | A designated editor can add, edit, or disable shared rules. Future reviews use the active rules and older reviews retain their original wording. Confirmed 12 November 2026. | Agree the starter wording and settings access in AI-02. |
| D08 | ServiceNow capabilities | Release/plugins/entitlements unverified | Backend owner records actual available integration and UI route. |
| D09 | MCP dependency | No proposed runtime MCP dependency for the initial AI reviewer | Revisit only for a concrete capability unavailable through the agreed adapter. |
| D10 | Quota and cost | Existing integration is useful evidence; budget/access not inspected | Backend confirms API project, limits, and budget before live evaluation. |
| D11 | Deadline and assessment | No rubric/format; December 9–12 is tentative | Team confirms exact presentation and submission requirements. |
| D12 | Contract and UX | Draft 0.1; not a commitment from teammates | Joint review of examples, partial/error states, and evidence navigation. |
| D13 | Plan and step tracking | Local Markdown confirmed by user | `PLAN.md` and one draft file per step under `.scratch/ai-review/issues/`. |
| D14 | Local development connection | SDK proposed after compatibility/team coordination; Studio alternative | App scope/sys_app ID and actual release remain unknown; no auth/init/install performed. |
| D15 | Execution phase | Offline validation and local Gemini trials have been run | ServiceNow integration is still planned. |
| D16 | Local harness | Node JavaScript, pinned Ajv and JSON parser dependencies | 17 public-interface behavior tests and a fixed-response demo; no final ServiceNow runtime choice implied. |
| D17 | Coverage contract | Active draft 0.2.0 requires analysis-area coverage | Incomplete areas or provider-declared material limitations cannot retain a complete review status; the canonical first-draft note is informational. |
| D18 | Initial team app | User confirmed the teammate has not started anything | Plan one new shared scoped app; capture the app ID after creation rather than requesting a nonexistent existing app. |
| D19 | Local Gemini configuration | Key in local `.env.local` | Model lookup and one generated library review succeeded. |
| D20 | Project name | Suiko AI | Backyardigans is the team name. |
| D21 | Editorial routing | One everyday Editor can submit, review, and sign off. A legal reviewer receives a task when an editor escalates. Escalated revisions need fresh clearance from legal before editor sign-off. Confirmed 12 November 2026. | [Sign-off decision](adr/0001-bind-sign-off-to-the-submitted-revision.md) · Verify the roles and task in AI-13. |
| D22 | Review trigger | The editor clicks **Review this version** and can retry on that saved copy. Confirmed 12 November 2026. | Deon builds the action and panel. The backend connects it to the server-side run. |
| D23 | Comparison | The first draft is reviewed by itself. Later reviews use the previous submitted revision of the same story. Confirmed 12 November 2026. | Test an unrelated first draft and a real revision in AI-05 and AI-11. |
| D24 | Review findings | Every successful review has a short internal overview. **Needs attention** shows findings linked to a shared rule and a specific passage. Confirmed 12 November 2026. | Validate grounded findings and a useful zero-findings review. |
| D25 | Metadata choice | An editor can accept or edit suggested metadata and save that choice with the review. Confirmed 12 November 2026. | Preserve the original suggestion and link the choice to the reviewed revision. |
| D26 | Shared app and development route | Suiko AI is installed as `x_2236136_suiko_ai`, app ID `b47095969f3848a7bdf385b3650b68c2`. SDK 4.14.0 builds and updates the app from `servicenow-app/`. Authorized and verified 12 November 2026. | Keep the app ID and generated record identities. [Working project](../servicenow-app/README.md) |
| D27 | Review provider | ServiceNow calls Gemini directly with an encrypted server-side key. Default 3.5 Flash-Lite; one attempt on 3.1 Flash-Lite when 3.5 returns HTTP 503. Each review records the actual model and any fallback. | Both river reviews completed on 3.5. The library first draft completed through the recorded 3.1 fallback. |
| D28 | Repeatable deployment | Deon runs the install and PDI checks from his local clone after reviewing and merging changes. | GitHub tests and builds on relevant pull requests and pushes to `main`. [Pipeline guide](13-servicenow-development-and-cicd.md) |
| D29 | Team UI proposal | Use native ServiceNow lists and forms for the Inbox and Legal Review. Extend the existing custom Story screen and AI panel. | Confirm any additional UI requirement when the instructor shares the rubric. [Team tasks](../TEAM-TASKS.md) |

## Additional planning references

See [PDI connection research](09-servicenow-connection-research.md) for the official SDK/Studio/integration sources and future commands, and [workflow selection](08-workflow-and-plan-maintenance.md) for the skills actually read. Local checks found Node `v24.14.1` and npm `11.16.0`; selected-SDK compatibility is not yet established. A later read-only browser attempt reached the ServiceNow navigation title but remained visually blank, so no release, plugin, or app identity was verified.

## Work completed in this pass

Created a documentation baseline, drafted AI behavior and UI requirements, inspected relevant local source/test files, and consulted official ServiceNow/Google references. A separate reader review checked ownership and contract consistency. Offline checks validated the draft assessment schema, synthetic response, correlation/rule IDs, all 11 quoted source references, taxonomy membership, and local document links. These checks do not establish live model quality or ServiceNow integration.

No frontend/backend implementation was performed. Existing project files and the ServiceNow application were not changed. Credential material supplied in the conversation was not copied into these artifacts.

### Subsequent local implementation

After the user requested a start, AI-04 began against draft 0.1.0 and was revised to active draft 0.2.0 after review. The current checks pass 17 behavior tests and the fixed-response demo runs. The new input schema and Node validation module do not establish Gemini quality, final team agreement, or a PDI deployment. WildTrack and ServiceNow were not modified. Earlier paragraphs above describe their respective documentation/research passes, not this subsequent local slice.
