# Gemini Decision 1 and Suiko AI

Checked 12 November 2026. Deon approved a trial during AI-21; not yet installed in the review flow.

## Recommendation

Trial it during AI-21 as a second opinion on claim/source support. Keep Flash-Lite for the editor's explanation, overview, change summary and proposed wording. Adopt the extra checker when it makes the review more useful and easier to act on. Confidence is valid advisory information; proving absolute truth is not a product requirement. Editors and legal reviewers retain publishing authority.

## What Google offers

The API answers fixed questions with yes/no probabilities, a choice or a rubric score. It produces no generated prose. REST uses `POST /v1beta/decisions` with `gemini-decision-1` and an API key. [Decisions API](https://aistudio.google.com/docs/decisions-api).

Google lists free input and no output-token charge. The paid price is $0.10 per million input tokens. Shared input is counted once within a request; question wording adds input tokens. Free-tier content may be used to improve Google's products. [Pricing](https://aistudio.google.com/docs/pricing#gemini-decision).

The published free-tier limits are 200 requests/minute, 50,000 input tokens/minute and 10,000 requests/day. These match Deon's screenshot. Limits apply per project, not per key. At an assumed 5,000 tokens per call, the token allowance permits about 10 calls/minute; at 10,000 tokens, about five. These estimates include the need to budget question text. [Rate limits](https://aistudio.google.com/docs/rate-limits#gemini-decision).

## Proposed trial, not yet an implementation decision

1. Write human-labelled cases before making calls: direct support, contradiction, unrelated source, missing source, partial support, outdated dates and source text that tries to instruct the reviewer.
2. Retrieve and freeze source text through AI-20 first. Pass actual passages, not a bare URL or an editor's assurance.
3. Give Decision 1 one claim, the relevant approved rule and candidate source passages. Ask a closed question with explicit outcomes: supported, contradicted, insufficient information or not applicable. Include the full context needed for that question.
4. Keep each claim separate and preserve its source passage IDs. Score candidate passages separately when choosing among sources; this prevents a general document score from hiding a missing source for one claim.
5. Save the answer distribution, model, question version, timing and input identities beside the review evidence. Treat low confidence, an API error or disagreement with the main review as an unresolved check.
6. Compare misses, false concerns, latency and token use against Flash-Lite alone. Choose any threshold from those labelled results, not a guessed percentage. A high score is not proof of real-world truth.
7. If it helps, add an optional server-side REST call using the existing protected Gemini configuration. Keep credentials out of the browser and repository. If it fails, retain useful review sections and explain that the extra check was unavailable.

This would support the assignment's “AI comparison and classification” and “flag potential checklist conflicts.” It would not replace retrieved evidence, mechanical quote checks or the editor's publishing decision. It does not settle the source-reading work in AI-20.

## Status

No Decision API requests have been sent. Access is visible in the account screenshot, but compatibility, response quality and observed quota usage still need a bounded trial. The current SDK search did not return Decisions-specific examples; use Google's direct REST reference for that trial rather than guessing an SDK method.
