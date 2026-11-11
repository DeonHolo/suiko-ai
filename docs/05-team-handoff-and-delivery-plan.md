# Team handoff and delivery plan

**Original planning notes · 11 November 2026**

The PDI workbench now saves versions and runs Gemini. Use [Team tasks](../TEAM-TASKS.md) for the current owners, steps, and screen plan. The milestones and ownership notes below describe the earlier proposal.

The [Suiko AI Build Guide](../Suiko%20AI%20Build%20Guide.md) has the first tasks and demo for the whole team.

Use [PLAN.md](../PLAN.md) as the canonical editable step order. This document retains the ownership, milestone, and evaluation detail; the linked step files hold current blockers and completion evidence. The [PDI integration guide](07-local-development-and-pdi-integration.md) explains the development and runtime connections.

## Handoff boundaries

| Area | You provide | Teammate provides | Joint acceptance check |
| --- | --- | --- | --- |
| AI input | Required fields, prompt context, limits, and fixtures | Authorized immutable revisions, applicable approved policy, taxonomy | The same frozen request reproduces the same review scope. |
| AI output | Assessment semantics, evidence/ID rules, and examples | Provider adapter, parser/validator runtime, trusted result envelope | Invalid or unsupported output cannot become a clean review. |
| Provider execution | Model/settings recommendation and evaluated quality | API access, secret storage, transport, quotas, timeout and retry behavior | No browser-visible key, hidden retries, or duplicate request from repeated clicks. |
| Review records | Required provenance and freshness meaning | ServiceNow records, jobs, cache identity, durable audit | A result identifies its revisions, policy, prompt, model, and attempt. |
| Review UX/UI | Deon designs and builds the AI panel | Wider navigation, story form, and authenticated data actions | Evidence links, states, and suggestion acceptance use the same contract. |
| Human decisions | AI authority boundary and UX semantics | Editor/legal roles, access checks, approvals, publication workflow | AI output alone cannot authorize publication. |

The backend owner must confirm the instance release, available outbound integration route, and relevant entitlements. The frontend owner must confirm the experience technology and where the AI panel lives. These checks are dependencies for integration, not reassigned work for you.

## What to give the backend teammate first

Share the request/response examples and AI specification. Agree that article text is frozen before review, policy IDs and versions come from approved records, and the AI output never includes a publishing action. Backend must retain source text so the evidence remains inspectable after edits.

For duplicate-request handling, fingerprint the complete canonical semantic request (all request fields except the correlation `request_id`), plus schema/prompt versions, model/settings, and authorization scope. This includes both source snapshots, content identity, language, exact policy inputs, taxonomy, and `current_metadata`. A request ID alone is not enough. The same raw text across two newsrooms must not bypass their authorization boundary.

Track article/policy currentness separately from per-field metadata acceptance. A human accepting one suggestion should not force a new article review. Check the expected current field value before applying any suggestion, and store the human decision separately. A new review after metadata changes must not reuse a whole result generated against the previous metadata.

The example fingerprint is an illustrative identifier, not an implementation of the team's hashing algorithm. The final algorithm and canonical serialization must be documented before cache reuse is enabled.

The backend-owned run envelope should expose a short operational error category, explicit attempt identity, and current/outdated state. Do not return raw provider diagnostics or keys to the review UI. Rate limits and token budgets remain configuration checked against the actual API project.

## What to give the frontend teammate first

Share the AI review UX/UI brief and a normal, partial, failed, unknown, and outdated response example during the design discussion. This pack includes one normal handcrafted response; the other envelopes are the next contract examples to add once the state names are agreed.

Save the editor's metadata choices with the review. Opening the evidence should simply show the cited text. Deon can build the panel locally from sample results while the frontend teammate prepares the story page.

## Suggested milestones

These dates use the current date, 11 November 2026, and the tentative December 9–12 presentation window. They are team planning targets and should change if the instructor confirms another schedule.

| Target | Your AI review work | Dependency / evidence |
| --- | --- | --- |
| Nov 11–13 | Share the confirmed workflow and agree one request and result with the team | Frontend/backend review of the sample. |
| Nov 14–18 | Adapt prompt, policy rules, evidence validation, and initial fixtures | Stable frozen-revision input from backend, or synthetic local examples. |
| Nov 19–24 | Evaluate and correct change summaries, metadata, and policy assessments | Offline validation first; bounded live Gemini pilot after API-project access is confirmed. |
| Nov 25–30 | Connect the reviewed contract and AI panel | Teammate-owned ServiceNow adapter and record access. |
| Dec 1–5 | Run end-to-end review scenarios, record evidence, prepare AI segment of presentation | Working team app and representative reviewer feedback. |
| Dec 6–8 | Fix material issues and rehearse normal/failure/outdated paths | Confirmed demo environment and repeatable synthetic dataset. |

Do not wait for the complete application to begin AI fixtures. Conversely, a successful isolated prompt is not proof of a working ServiceNow integration.

## Evaluation dataset

Start with at least 12 synthetic revision pairs and three first-draft cases. Give every case a case ID, frozen texts, policy pack version, expected atomic changes/concerns, prohibited claims, and an annotator's rationale. Keep a small held-out set that is not used while refining the prompt.

| Case family | Expected check |
| --- | --- |
| Unchanged text | No fabricated change summary. |
| Date/number changed | Exact old/new values; do not infer which one is true. |
| Attribution removed | Candidate concern tied to the relevant policy and revised passage. |
| Attribution added | A resolved baseline concern is not repeated as current. |
| Added/deleted paragraph | Evidence points to the revision where the text exists. |
| Reordered/repeated paragraphs | No fabricated new fact; evidence resolves to the correct segment. |
| Formatting only | No invented substantive change. |
| Conditional policy | No concern when the supplied condition does not apply. |
| Missing external context | Explicit manual verification; no invented source or consent. |
| Embedded reviewer instructions | Article cannot override the checklist or emit approval. |
| Sparse/truncated/over-limit input | Limited/error outcome; no complete-coverage claim. |
| Metadata unsupported by text | Empty suggestion rather than invented section, tag, or detail. |
| Provider malformed/truncated/timeout/quota response | Operational states remain distinct from article findings. |
| Stale result / changed policy | Historical result preserved and excluded from current suggestion acceptance. |

Use prepared failure and older-review results for the integration checks with backend. Deon tests keyboard access and a narrow layout in the panel.

## Proposed acceptance criteria

These are draft engineering targets. They are not measured results or production-quality claims.

| Measure | Initial target | How to assess |
| --- | --- | --- |
| Accepted contract validity | 100% of accepted responses satisfy structural and cross-field rules | Offline parser/validator fixtures, including adversarial responses. |
| Accepted evidence validity | 100% of retained references resolve to exact supplied text and valid rule IDs | Deterministic source/ID validation. |
| Authority boundary | Zero AI approvals, publications, invented citations, or automatic metadata writes | Prohibited-output and integration fixtures. |
| Policy coverage accounting | Every requested rule represented once, including unresolved rules | Set equality and uniqueness checks; do not count unresolved rules as cleared. |
| Change accuracy | At least 90% precision and recall on annotated atomic changes in the pilot | Human compare outputs to labeled revision pairs; report numerators and denominators. |
| Policy concern quality | At least 90% precision and recall on labeled, in-scope planted concerns | Human assessment; adjudicate conditional/ambiguous cases explicitly. |
| Metadata grounding | No fabricated factual details or IDs outside the allowed vocabulary | Human content check plus deterministic vocabulary validation. |
| Review usability | Test readers can find the changed fact, source evidence, and currentness without assistance | Short task-based review of the AI interface. |
| Latency and cost | Measure first; agree a budget before scaling | Record queue time, provider time, end-to-end time, token use, and cost separately. |

An exact quotation can still support a mistaken interpretation. Deterministic evidence validity and semantic review quality are separate measures. A small curated sample is a pilot, not a claim about all newsroom content. Repeat a few ambiguous cases to expose variability; record prompt/model/settings with every evaluation.

## Evidence to retain for your presentation

Keep the final prompt/contract versions, source fixture IDs, representative correct results, one limitation/failure example, and your evaluation table. Demonstrate the actual new AI behavior: before/after summary, evidence-linked checklist concern, metadata suggestion, and the human authority boundary. Clearly label handcrafted examples, simulated provider responses, live responses, and team application screenshots.

## Next concrete work

1. Review the shared request and result with the backend teammate and agree how Deon's panel will call the app actions.
2. Select the approved newsroom checklist and assemble the initial synthetic revision pairs.
3. Adapt WildTrack's evidence and stable-ID checks to the two-revision contract.
4. Evaluate the AI module before wiring its outputs into current review actions.
