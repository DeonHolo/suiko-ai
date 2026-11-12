# Review claims with their sources

When an approved rule asks for source material, Suiko checks important claims in the saved story. Open **Claim and source checks** to compare the draft quote with a retrieved passage, read the suggested next step, and see which claims need confirmation. Editor notes appear as **Editor-supplied review context**.

Choose **Add a Decision 1 confidence check** before starting a review to get an additional judgment on claims with retrieved passages. Open its result to see the confidence for each answer. If the two models disagree, the card shows that disagreement alongside the source. The editor chooses what to do with the information.

## Live Makers’ Night example

The article said the screening starts at 6 p.m. and has 120 seats. It also gave a price and an exhibition opening time. The links contained a brief, an unrelated PDF and a missing page. The editor provided a note about how the price was heard. Expectations were written before the runs.

| Claim | Saved evidence | Observed review |
| --- | --- | --- |
| Screening starts at 6 p.m. on 17 May | The brief says 7 p.m. on the same date | Both models identified the conflict. Decision 1 showed about 99% confidence on the rerun. |
| The room has 120 seats | The brief gives 120 seats | Both found support. |
| Tickets cost five dollars | Hallway conversation in editor context, no ticket notice | Flash-Lite requested confirmation. The note was labelled as context. |
| The exhibition opens at 6 p.m. | No opening time was announced | Flash-Lite called this a conflict in both runs. Decision 1 agreed weakly on the first run. With a revised question, Decision 1 said **Needs confirmation** at 97%. The panel showed both judgments. |

The overview, section and tags survived a broken source link. The unrelated PDF was saved as retrieved material and neither live review cited it in a claim check. The first description was withheld because Gemini put an ellipsis in the evidence quote. The rerun kept a description about the viewing guide and seating capacity, without the disputed times or unconfirmed price. An automated regression also verified that a cautious body passage can support metadata even when the same passage explains why a headline overstates the story.

The footage example located the outside clip and asked for the licence. The 3.5 review labelled the missing record a potential conflict. That status varied across runs and should be checked in AI-23. The clip, notes, and suggested action remained inspectable.

The initial nine-case API comparison matched 8 of 9 expected labels for each model. Decision 1 took 1.07 seconds for that batch, with 2,218 input tokens and zero output tokens. The live ServiceNow rerun's optional call took 237 ms for three questions and 1,081 input tokens. These are observed runs. [Decision 1 trial notes](../.scratch/ai-review/decisions-api-research.md)

- Story `b34e3a898364db106fffc629feaad35f`. Initial review `655e3e0183a4db106fffc629feaad372` and rerun `a0affac183a4db106fffc629feaad30c`.
- Footage review `3ecf320583a4db106fffc629feaad34e`.
- 91 local tests passed. The suite covers mixed outcomes, bad quotes, separate context, metadata exclusions, unmatched concerns, redirects, and Decision 1 coverage. The live reviews passed the SDK install and ServiceNow UI and API readback.
- Expectations, captured inputs, actual outcomes and screenshots are saved in `ai-review/output/ai-21-2026-11-12/`.
