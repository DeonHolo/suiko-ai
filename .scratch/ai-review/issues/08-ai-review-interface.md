# AI-08 · Design and build the AI review panel

**Status:** in-progress · live panel built, final access and keyboard checks remain
**Owner** Deon, with the frontend teammate providing the surrounding story page  
**Depends on** saved revisions and the live review API established in AI-03 and AI-09.

The first panel is deployed in the shared app and also runs as a local preview against the PDI backend.

## Outcome

An editor can open the panel for a saved version, run the review, understand what needs attention, and save chosen metadata. Deon builds the panel locally and connects it to the shared story page.

## Steps

- [ ] Start in the local workbench with a clean first-draft result, a flagged draft, a comparison, and an invalid-evidence result.
- [x] Build **Review this version**, the overview, **Needs attention**, changes when an earlier submission exists, and suggested metadata.
- [x] Make each finding open its exact passage and rule. Show the earlier and current passages for a change.
- [x] Let the editor accept or edit a section, tags, or description and save that choice with this review. Keep the original suggestion visible in its result.
- [x] Include running, zero-findings, failed, and older-review states. Give a retry or manual review path with a plain-language reason when AI fails.
- [ ] Verify keyboard access and narrow layouts. Connect the panel to the backend's agreed actions and mount it in the shared story page with the frontend teammate.

## Done when

The first-draft and revision views can be tested locally with sample data. In the shared app, the editor can run the action, open the cited text, save a metadata choice, and understand a failed or older review.

## Evidence and current state

On 12 November the browser saved and reviewed both river drafts in ServiceNow, displayed their overviews and comparison, and saved the editor's metadata choice. A busy-provider failure remained in history and could be retried against the same version. The live page uses native labels and controls and adapts to the available narrow viewport. A complete keyboard pass, ordinary-account check, and mounting in the wider teammate story page remain. [Panel source](../../../servicenow-app/src/client/app.jsx)

## References

- [04-ai-review-ux-ui.md](../../../docs/04-ai-review-ux-ui.md)
- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [Main plan](../../../PLAN.md)

