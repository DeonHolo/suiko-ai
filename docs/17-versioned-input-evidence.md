# AI-17: saved story inputs

**Owner:** Deon. **Date:** 12 November 2026.

An editor now chooses Article, Script or Caption and News, Opinion or Sponsored before saving. Source links and Review context have separate boxes. Each saved version keeps its own choices, links, text and notes. Earlier reviews keep opening their original inputs.

## What passed in ServiceNow

Expected outcomes were recorded before the UI checks. The fictional inputs were entered, saved and reopened in the in-app browser; API readback then checked the stored fields and review snapshots.

| Completion requirement | Example and observed result |
| --- | --- |
| Article and script retain separate inputs | **Paper Lantern Studio rehearses a puppet scene (AI-17)** saved as Article / News with one source link and rehearsal context. **Why quieter station announcements help (AI-17)** saved as Script / Opinion with separate context and no links. Switching between them restored their own values. |
| Older version keeps its inputs after an edit | The article's second version added an editor's request to shorten the opening exchange to Review context. Version 1 retained its original context; version 2 displayed the added sentence. Saved snapshots retained the corresponding inputs separately. |
| Saving a link does not imply reading it | The entered bare host was normalized to `https://example.com/ai17-brief#rehearsal`. The review source card said **Not read**. The form explicitly said links were only saved references. |

The article's second version was also reviewed with Gemini 3.5 Flash-Lite. The saved review retained an overview, identified the added context and kept its unread source status. Review ID: `ac5c24c983249b106fffc629feaad320`.

The existing radio story retained its unclassified legacy inputs and earlier history. The UI asks for explicit format/kind before saving a new classified version. It does not guess an old classification or rewrite historical review input.

## Repeatable checks

The combined branch has **64 passing local checks**: AI-16's 50 plus fourteen input/snapshot checks in [story-input.test.js](../ai-review/test/story-input.test.js). They cover explicit choices, missing/invalid types, URL normalization, deduplication, the five-source allowance, rejected private/credential-bearing addresses, text/storage limits, frozen classified versions, legacy snapshots and 0.2/0.3 contract compatibility.

An invalid `pdf` format was also rejected through the actual save API before creating its test story. SDK builds, installation on the existing app identity and page/API smoke checks passed. The later installed AI-16 server regression passed on the combined build as well.

## CodeRabbit follow-up

Both inline findings were valid. Source-link fragments now receive the same known-credential-parameter check as queries. The serialized source list is bounded to the column's 8,000-character capacity before saving, including JSON escaping.

Both new regression tests failed before the fix and passed afterward. The installed save API then rejected a synthetic access parameter in a fragment and an escaped five-link set exceeding the saved capacity. Stored article versions and review attempts were unchanged. No review action or Gemini call was made for those cases. The in-app form also displayed the private-link message without saving a story, and the original article was reopened afterward.

Ordinary section anchors remain accepted, including the original rehearsal source link. The local evidence is `link-validation.json` beside the earlier snapshots and screenshots.

## Development details for the next ticket

Request version 0.3 includes the classified inputs. Existing 0.2 reviews and legacy baselines remain readable. The model receives short identifiers such as `draft-1` and `draft-2`; the saved request separately maps them to actual ServiceNow revision records. This reduces long-ID copying errors while keeping provenance inspectable.

This slice saves source references. Actual page retrieval belongs to AI-20; the confidence-producing Decision 1 trial belongs to AI-21. Neither has been represented as already running.

Private full inputs, API assertions and screenshots are stored locally in `ai-review/output/ai-17-2026-11-12/`. See [AI-17](../.scratch/ai-review/issues/17-story-inputs-and-context.md) and the [implementation log](../.scratch/ai-review/implementation-log.md).
