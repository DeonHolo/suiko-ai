# AI-06: Run one bounded live Gemini review locally

**Status:** in-progress · library fixes verified on 3.5 and two media cases tried
**Owner:** You; backend/team owner supplies approved API access and budget
**Depends on** AI-05 for the revised review

The first trial ran on two saved drafts. The pilot runner now repeats the test for the library, video script, or sponsored caption.

## Outcome

The real model returns a usable assessment through the same validated boundary used by the offline fixtures.

## Steps

- [x] Prepare a local key-entry file and configuration check that never prints its value or calls Gemini.
- [x] Use the key for an authenticated lookup of `gemini-3.5-flash-lite`.
- [x] Use the recorded model, prompt, and generation settings with a Gemini-compatible projection of the output schema.
- [x] Submit one synthetic revision pair and validate the returned assessment.
- [x] Record latency, token use, and editorial findings for the first run.
- [x] Make the live pilot repeatable for the three fictional cases.
- [ ] Repeat the pilot on two unrelated first drafts with the same active rules and a later revision under the new AI-05 contract. Compare the findings, changes, and metadata with the saved input.
- [ ] Record the model version and available generation quota for repeat runs.
- [ ] If the request outcome is uncertain, record it and do not silently repeat the billable request.

## Done when

Actual Gemini results demonstrate the revised first-draft and comparison behaviors. Record any incorrect or unusable results with the saved text and rule input.

## Evidence and current state

On 11 November 2026, Deon saved the key in `ai-review/.env.local`. The offline check found it, and Google accepted it for a lookup of `gemini-3.5-flash-lite`. All 20 local tests passed.

On 12 November 2026, one live Gemini call reviewed `rev-002` against `rev-001` with prompt draft 0.2 and contract `0.2.0`. The result passed the local schema, evidence, checklist, and vocabulary checks. The request took 9.86 seconds and used 2,820 tokens. Saved Gemini result (local file `ai-review/output/gemini-library-review-2026-11-12.json`)

| What we checked | What we found |
| --- | --- |
| Opening date | December 5 became December 12. Gemini quoted both the title and body correctly and reported them as separate changes. An editor would benefit from one entry with both quotes. |
| Attendance and attribution | Gemini kept the change from 200 to more than 500 and correctly flagged the missing source in the checklist. The change summary can state explicitly that version 2 dropped “Organizers.” |
| Section, tags, and description | Community, Libraries, and Community events fit the draft. The description quotes the new date and attendance estimate accurately. A description that leads with the date and free admission would avoid carrying forward the estimate before an editor verifies it. |
| Checklist | `ATTR-001` correctly flagged the unsourced attendance estimate. `LANG-001` correctly found no unsupported promotional superlative. |

The prompt already uses “more than 500” as an example of preserving numerical qualifiers. This run checks the workflow on one known sample. AI-11 covers evaluation on additional cases.

### Library rerun with the revised prompt

The rerun used the same saved request and contract `0.2.0`. Gemini 3.5 Flash-Lite returned three temporary `503` errors. Gemini 3.1 Flash-Lite completed the draft 0.3 run. It grouped the date, but left out the removed attribution and reused the flagged estimate in the description. Draft 0.3 result (local file `ai-review/output/gemini-library-review-2026-11-12-prompt-0.3-flash-lite-3.1.json`)

Draft 0.4 writes checklist findings first, compares attribution explicitly, and uses other passages for the description. On Gemini 3.1 Flash-Lite, all five library checks passed. The model returned two changes, including the removed attribution to organizers. Its description used the date and free admission. The expected tags and both checklist outcomes also passed. Draft 0.4 result (local file `ai-review/output/gemini-library-review-2026-11-12-prompt-0.4.json`) · Progress page (local file `ai-review/output/library-review-progress.html`)

### Retest on 3.5 and media production examples

The library retest used the exact same draft file and prompt 0.4. Gemini 3.5 Flash-Lite returned one date change with quotes from the title and body, named the dropped attribution to organizers, and suggested a description with the date and free admission. The attendance estimate remained flagged. Library result (local file `ai-review/output/library-gemini-3.5-flash-lite-b82e4acb.json`)

The river video passed on 3.1 Flash-Lite after two 3.5 busy responses. It grouped the schedule change and asked the producer to verify permission to use the outside drone clip. The sponsored teaser run on 3.5 found the lost sponsor disclosure. The validator rejected it because a change labeled `removed` included an after quote. It also reused the flagged caption as the description's source. Video result (local file `ai-review/output/river-video-gemini-3.1-flash-lite-9f93347a.json`) · Rejected teaser result (local file `ai-review/output/sponsored-caption-gemini-3.5-flash-lite-5d643f29.json`) · Progress page (local file `ai-review/output/library-review-progress.html`)

Use these findings when building the app's comparison context in AI-05 and expand the evaluation set in AI-11.

## References

- [03-ai-review-specification.md](../../../docs/03-ai-review-specification.md)
- [05-team-handoff-and-delivery-plan.md](../../../docs/05-team-handoff-and-delivery-plan.md)
- [Main plan](../../../PLAN.md)

