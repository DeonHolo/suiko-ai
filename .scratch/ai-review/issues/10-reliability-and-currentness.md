# AI-10: Handle failure, duplicate, and outdated reviews

**Status:** in-progress · live busy-provider retry proved, simulated cases remain
**Owner:** You specify and verify AI meaning; backend implements runtime controls
**Depends on** AI-08, AI-09

The PDI prototype has request identities, a per-revision running lock, saved input snapshots, and explicit retry behavior. The checklist below includes broader scenarios still to exercise.

## Outcome

An editor can distinguish a concern from a provider failure and cannot accidentally use an obsolete or duplicate review.

## Steps

- [ ] Verify a repeated click during a review cannot create duplicate work. A retry uses the same submitted revision.
- [ ] Exercise timeout, quota, malformed/truncated response, partial coverage, and explicit retry paths with simulated failures.
- [ ] Change source text or policy while a review runs and verify the saved result remains historical/outdated.
- [ ] Verify the editor's metadata choice is stored with the intended revision and review. Preserve the original suggestion and earlier sign-off.
- [ ] Verify a technical AI failure still leaves the editor able to inspect the draft and use the appropriate manual actions.
- [ ] Keep human decisions, processing state, assessment state, currentness, and provenance distinct.

## Done when

Joint integration fixtures demonstrate the specified states and authority boundaries without needing repeated live failure calls.

## Evidence and current state

On 12 November, a Gemini busy response left the draft saved, and retry created a new attempt on the same version. An initial lock-clearing issue was fixed and the retry then completed. The editor's metadata choice was saved separately from the AI suggestion and survived an app update. Quote and input checks pass in the 23-test local suite. Concurrent-user, timeout, quota, and changing-draft simulations remain. Wider manual sign-off actions belong to AI-13.

## Fixes deferred after the radio story test

Recorded on 12 November 2026 for a later implementation pass. The current discussion is about the product's editorial policy workflow.

- Make the sourcing status agree with the findings. The radio story retry reported two missing sources while marking the sourcing rule clear.
- Check how an outside-media rule reports an inapplicable case. Both radio replies used a clear status with an empty evidence array, which the shared validator rejected.
- Give missing evidence its own error message. The current screen calls an empty evidence array a quote mismatch and shows empty quote/source fields.
- After those fixes, rerun the exact radio story and retain both the earlier failures and the new result.

The pre-run scorecard, both rejected replies, screenshot, and analysis are in Deon's local `ai-review/output/ai-11-2026-11-12/radio-story-results.md`.

## References

- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [04-ai-review-ux-ui.md](../../../docs/04-ai-review-ux-ui.md)
- [Main plan](../../../PLAN.md)

