# AI review contract examples

**Draft 0.2.0.** These files are a proposed interface for team review. No endpoint is deployed by this pack.

- `ai-review.request.example.json`: a synthetic article revision pair, two example policy rules, and an allowed taxonomy.
- `ai-review.request.schema.json`: the draft input shape used by the local validator; identity uniqueness and total revision length also need behavioral checks.
- `ai-review.response.example.json`: a handcrafted successful result, including the backend-owned envelope. It is not a recorded Gemini response.
- `ai-assessment.schema.json`: a JSON Schema draft 2020-12 application validator for the model-owned `assessment` object only.

The model returns only the assessment object. The backend supplies correlation IDs, processing state, freshness, provenance, and any operational error. A failed or unknown attempt has `assessment: null`; it must not receive an empty successful assessment.

Draft 0.2.0 adds required `coverage` fields for revision comparison and metadata analysis. This is a breaking draft change: missing coverage is rejected, never assumed complete. Requested-but-incomplete areas and provider-declared material limitations prevent a `reviewed` status. A null baseline requires `revision_comparison: not_requested`; the module adds the canonical informational first-draft notice.

The policy approval reference and input fingerprint in the example are explicitly synthetic identifiers. The runtime backend must verify actual policy approval and define the real fingerprint/canonicalization algorithm before caching.

The schema establishes shape and bounds; it does not enforce exact rule-set equality, cross-revision evidence roles, unique change/rule IDs, exact quotations, allowed taxonomy membership, semantic relevance, currentness, or human authority. Implement those checks as specified in the AI review document. Parse raw provider JSON with duplicate-key detection before schema validation.

Accepted inputs contain 1–12 unique policy rules, rule/taxonomy IDs of 1–80 characters, and revision/segment IDs of 1–100 characters. For a first draft, request baseline and response baseline ID are null, and changes is empty. State that no comparison was performed; this alone does not make an otherwise complete candidate review partial.

For Gemini structured output, the adapter must use a model-supported schema projection with the same fields and enums. Verify support for schema keywords before sending the full application schema; retaining the application validator is mandatory. Provider compatibility has not been tested in this documentation pass.

Read [AI review specification](../docs/03-ai-review-specification.md) and [team handoff](../docs/05-team-handoff-and-delivery-plan.md) together with these examples. Resolve contract changes with frontend/backend teammates and update the prompt, schema, examples, and fixtures as one versioned change.

The [local AI-04 module](../ai-review/README.md) now exercises these drafts with a fixed-response adapter. That local implementation does not establish team policy approval, live Gemini quality, or a deployed PDI integration.
