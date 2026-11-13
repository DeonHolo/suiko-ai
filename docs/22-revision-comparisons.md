# Compare two saved versions

Open **What changed** after reviewing a revised story. Each summary has quotes from the earlier and current drafts. **See literal edits** shows the words added or removed. The comparison uses the previous submitted version of the same story.

A first draft gets an overview and applicable editorial checks. When the saved text is unchanged, the comparison says so. Review context and source URLs are saved with each version. A changed URL can appear as a literal edit even when the public text is unchanged.

## ServiceNow results

Expectations were recorded before the review runs. The examples are fictional.

| Example | Expected | Observed |
| --- | --- | --- |
| Library, version 1 | Review the first draft by itself. | Gemini 3.1 Flash-Lite gave an overview and no comparison. It treated the generic attribution “Organizers” as too vague and asked for a more specific source. |
| Library, version 2 | Group December 5 → December 12, identify the changed estimate and dropped attribution, and omit the estimate from the description. | Gemini 3.5 Flash-Lite returned two changes with exact passages. The single date entry cited both the title and body. The description read “A new community library is scheduled to open on December 12.” |
| Sponsored caption, versions 1 → 2 | Show only the deleted sponsor disclosure and Friday → Saturday. Keep the cast-interview line. | Gemini 3.5 Flash-Lite reported both edits and flagged the missing disclosure. The description used the retained cast-interview line. The concern-passage diagnostic remained visible because the model did not separate the concern from its context. |
| Caption, versions 2 → 3 | Save the newly supplied URL as an internal edit. | The literal comparison retained the link addition. Gemini omitted it from its summary, so the comparison showed a gap. |
| Caption, versions 3 → 4 | Changing only the content kind leaves the text unchanged. | The panel said “The saved text is unchanged.” The overview and saved rule scope remained available. |

The tests cover literal changes and evidence references. An accurate quotation establishes where a change occurred. The editor still reads the explanation and decides how to act.

CodeRabbit's follow-up found that a whole caption could pass as a deletion even when some of it remained. The one-sided check now preserves matched text, including shared words that can align with another occurrence. It also found that different facts could share the same date replacement. Gemini handles the editorial grouping, and the checker preserves the independent summaries. Installed suite `9aafcf458328db106fffc629feaad371` passed the caption and independent-date regressions.

- Library story `65b2cf4983a4db106fffc629feaad359`, reviewed comparison `35d2c38983a4db106fffc629feaad334`.
- Caption story `4ff2c78983a4db106fffc629feaad3e9`, shortened-caption review `a5338f8983a4db106fffc629feaad382` and unchanged-text review `2e244b0d83a4db106fffc629feaad31c`.
- Pre-run expectations, saved inputs and outputs, and screenshots are in the owner's local `ai-review/output/ai-22-2026-11-13/` folder.
