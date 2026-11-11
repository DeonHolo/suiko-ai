# Grounded research and WildTrack reuse

**Reviewed:** 11 November 2026 · **Scope:** documentation and read-only source inspection

## What the platform documentation establishes

ServiceNow App Engine Studio supports building an application's data, experience, automation, and security. That fits the overall team project. Your AI module is one component within that application. [ServiceNow: Create your app](https://www.servicenow.com/docs/r/application-development/app-engine-studio/create-application.html)

The provided MCP Client page describes ServiceNow AI Agent Studio accessing tools hosted on external MCP servers. MCP Server Console describes exposing ServiceNow capabilities to external MCP clients. These are different directions of integration. Neither page proves that a compatible connection is installed in this chat or enabled on the team's instance. [MCP Client](https://www.servicenow.com/docs/r/intelligent-experiences/mcp-client.html), [MCP Server Console](https://www.servicenow.com/docs/r/zurich/intelligent-experiences/mcp-platform-manager-landing.html)

Build Agent is a development aid with its own installation, plugin, and entitlement prerequisites. Seeing its banner or chat does not establish runtime access to every Now Assist feature. Treat development assistance and the application's actual Gemini review integration as separate capabilities. [Build Agent configuration](https://www.servicenow.com/docs/r/application-development/configure-build-agent.html)

For outbound integration, ServiceNow documents the server-side RESTMessageV2 API. Its visual Workflow Studio REST step specifically requires Integration Hub. The backend team should verify the actual available route and entitlements before choosing one; this proposal does not claim a subscription-free workaround or that any route has been tested on the instance. [RESTMessageV2](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_RESTMessageV2API.html), [REST step](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/rest-request-action-designer.html)

ServiceNow also provides human-approval actions and configurable table auditing. They support the wider workflow, but need application-specific configuration. An audit trail does not replace storing the exact article and policy snapshots used by AI. The backend team owns these parts. [Ask for Approval](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/ask-approval-action-designer.html), [Exploring Auditing](https://www.servicenow.com/docs/r/platform-security/exploring-auditing.html)

The documentation URLs can resolve to different releases; the supplied MCP page currently identifies Brazil, while some other retrieved material identifies Australia or Zurich. The instance's actual release and installed features were not verified. Pin implementation instructions to that release before development.

## What Google's documentation establishes

Google documents `gemini-3.5-flash-lite`, including text/PDF input and structured output support. That corroborates the model identifier in the local WildTrack provider. Model support does not establish the team's current API-project access or a successful live request. [Gemini 3.5 Flash-Lite](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite)

Gemini structured output supports a subset of JSON Schema. A schema can constrain result shape; it does not establish that a quotation, interpretation, or policy claim is correct. The application still needs semantic and evidence validation. [Structured outputs](https://aistudio.google.com/docs/structured-output)

Quota depends on the model and API project. WildTrack's local 15-second interval is an application default, not a guarantee of free-tier capacity or of the quota remaining available to this project. [Rate limits](https://aistudio.google.com/docs/rate-limits)

## WildTrack inspection baseline

Local path:

`CapVaultV2`

Repository: [DeonHolo/WildTrack](https://github.com/DeonHolo/WildTrack)

The local branch was `wildtrack-dev`, HEAD `a84ead1` dated 9 November 2026, with substantial staged, unstaged, and untracked changes. This assessment uses the working tree. It must not be presented as an audit of published `main` or a running deployment.

The `backend/src/main/java/com/capvault/backend/aireview/GeminiAiReviewProvider.java:26` sets `gemini-3.5-flash-lite`. The `backend/src/main/java/com/capvault/backend/aireview/AiReviewConfiguration.java:20` uses a 15-second default interval and configures the normal first review with MINIMAL thinking and 8,192 output tokens. Other review/template/comparison paths use different budgets. These are source settings, not a newly measured recommendation for newsroom content.

The public README describes `gemini-3.1-flash-lite` and a smaller output budget. Prefer the inspected local code for this adaptation assessment, while recording that the versions differ.

## Reuse map

Paths below are relative to the WildTrack root. The evidence index provides exact locations.

| Existing capability | Evidence | Reuse decision |
| --- | --- | --- |
| Evidence-linked findings and manual-verification outcomes | `AiReviewReport.jsx`; `AiReviewProvider.java` | Adapt the result concepts and evidence-first presentation. |
| Stable checklist IDs and rejection of missing/unknown/duplicate IDs | `AiReviewInstructionProtocol.java` | Preserve the principle in the newsroom validator. |
| Human-approved checklist snapshot and fingerprint | `TemplateChecklistService.java` | Adapt to versioned editorial policies; policy approval remains distinct from article approval. |
| Advisory review and treatment of document instructions as untrusted content | `AiReviewService.java` | Reword for newsroom authority: no approval, publication, or legal clearance. |
| Strict JSON/envelope validation and rejection of unsupported claims | `GeminiAiReviewProvider.java`; `AiReviewService.java` | Reuse validator requirements and offline fixture patterns. |
| Cache identity, duplicate-request handling, stale-source detection, explicit uncertain retry | `AiReviewService.java`; `AiReviewStore.java` | Specify as backend handoff requirements; teammates own runtime infrastructure. |
| PDF evidence page/section display | `AiReviewReport.jsx` | Adapt to revision and segment references for the text-first pilot. |

## What must be added or changed

**True revision comparison is new.** The current provider input contains one PDF and its academic instructions/template. The existing `AiReviewComparison` checks internal consistency across assertions inside that PDF. It does not accept an older and newer editorial revision. A new two-revision contract is required.

**Newsroom metadata is new.** No section/tag/short-description suggestion contract was found in the inspected AI result and report. File metadata and academic project metadata are different concerns.

**The domain must change.** Deliverable/template criteria become approved newsroom checklist rules. Academic acceptance and administrator/adviser roles do not supply editor/legal/publisher workflows. Those workflows belong to the other teammates.

**Existing history is not enough by itself.** Form answer/link history and observed Drive file changes do not guarantee immutable article bytes for every older revision. The backend must supply the exact old/new text snapshots to the AI boundary.

**Existing endpoints are not generic adapters.** The inspected AI controller/service is tied to WildTrack sessions, workspaces, existing responses, and PDF deliverables. It should not be described as ready to accept arbitrary newsroom records unchanged.

## Recommended adaptation strategy

Reuse the review behavior, validator ideas, UI patterns, and useful test cases. Create a newsroom-specific contract and prompt. Do not move the academic application or assume Java classes can execute inside ServiceNow server scripts.

The backend team can choose between a direct ServiceNow-to-Gemini adapter and a small external service that reuses relevant Java logic. Your AI contract should work with either. A direct adapter has fewer hosted components; an extracted service can preserve more existing validation code but adds deployment and authentication work. Compare a small integration spike before committing to the transport. Whole-application embedding would leave the ServiceNow ownership and review-record requirements unclear.

No live Gemini call, key inspection, test execution, or source modification was performed for this assessment. Existing code is evidence of implementation, not evidence that the new newsroom behavior already works.
