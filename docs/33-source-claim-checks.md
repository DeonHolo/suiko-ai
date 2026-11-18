# When a source describes another project

On 18 November 2026 we replayed a saved fictional story about Orchard Screen. It says its auditorium will have 40 seats. The linked Halyard Desk brief says its own listening room will have 40 seats. The installed historical review identified the different projects in its explanation and still chose **Potential conflict**. The expected answer was **Needs confirmation**. An editor would need a passage about Orchard to check the number.

## Expected and actual claim results

We wrote down the draft passage, expected label and required source for every case before sending it to Gemini. The first comparison alternated the old prompt and a wording-only change over the same frozen inputs. Each case ran three times on Gemini 3.5 Flash-Lite. The five new drafts had empty production notes. Their fictional source passages were supplied directly. Orchard used the source text saved by the installed reader.

| Claim and source | Expected | Old | Wording only | Subject check | Final review |
| --- | --- | --- | --- | --- | --- |
| Orchard and Halyard both mention 40 seats | Needs confirmation | 1/3 | 3/3 | 3/3 | 3/3 |
| Same organizer, two concerts, both mention 84 seats | Needs confirmation | 1/3 | 0/3 | 3/3 | 3/3 |
| Two halls owned by the same cooperative, different counts | Needs confirmation | 1/3 | 3/3 | 3/3 | 3/3 |
| The same gallery has 55 seats in the draft and 72 in its register | Potential conflict | 3/3 | 3/3 | 3/3 | 2/3 |
| A municipal register confirms another organization's pavilion has 63 seats | Support found | 3/3 | 3/3 | 3/3 | 3/3 |
| Two sources, only the second covers the named theatre and its 46 seats | Support found from the second source | 3/3 | 3/3 | 2/3 | 3/3 |
| Friday's class schedule is offered for the Saturday session | Needs confirmation | — | — | 3/3 | 3/3 |
| Another publisher gives 8 p.m. for the exact performance the draft places at 6 p.m. | Potential conflict | — | — | 3/3 | 3/3 |
| The right club's notice confirms 7 p.m. and another club meets at 8 p.m. | Support found from the first source | — | — | — | 3/3 |
| The right studio's notice gives an opening date and another studio lists its seat count | Needs confirmation | — | — | — | 3/3 |

The old prompt matched 12 of 18 expected judgments. Wording alone matched 15 of 18. The subject check matched 23 of 24 scheduled judgments. One mixed-source review exhausted its two attempts with HTTP 503. A separately registered repeat produced the expected judgment and citation. The first comparison had two HTTP 503 responses and the subject-check batch had nine.

The final version checked both the subject and what each passage said about the fact. It matched 29 of 30 scheduled judgments. One gallery review returned the right raw claim label but misspelled a rule identifier. Suiko rejected the review. A separately registered repeat of the exact input returned a valid review, **Potential conflict**, and the 72-seat quote. Five temporary HTTP 503 responses in the final batch recovered on their scheduled retry. All trials used the same Gemini model.

On the third concert run Gemini marked the cited passage as describing another concert, then chose **Potential conflict**. Suiko recorded **Needs confirmation** and kept the quote available. The other two runs of that case came back correct directly from Gemini. The final batch also produced warnings about missing or mismatched quotes, a publishing suggestion that used private notes, and a finding with incomplete evidence. The table scores the named claims, their labels and the cited passage for each strong judgment. The recorded failures remain in their original batch denominators.

## How the editor's review works

The main Gemini call identifies the subject of each cited passage and whether the passage supports, contradicts or leaves the fact open. Suiko checks the quotation against the saved text. A source-backed **Potential conflict** needs a matching passage about the same subject that gives an incompatible fact. A source-backed **Support found** needs a matching passage that supports the fact. When the citations fail those checks, Suiko records **Needs confirmation**. A relevant source can come from another publisher. Editors can open other cited passages separately and see which notes came from their team.

Gemini still judges whether two descriptions refer to the same subject and whether the passage establishes the fact. Similar names, renamed projects, conflicting accounts about the same event and nonnumeric claims deserve further testing. The editor flow makes one review. [Decision 1 history](30-decision-1-retirement.md)

## Repeat the comparison

Start from the generated review data for baseline commit `8dcb9a8`. In a checkout of that commit with its Node dependencies installed, run `node servicenow-app/scripts/prepare-review.mjs`. Export the generated module to a JSON file from that checkout's root.

```sh
node --input-type=module -e "import data from './servicenow-app/src/server/generated/review-data.js'; import {writeFileSync} from 'node:fs'; writeFileSync('baseline.json', JSON.stringify(data))"
```

In the current checkout, prepare the generated modules again. Run `node servicenow-app/scripts/evaluate-source-scope.mjs <path-to-baseline.json> --dry-run` to inspect the frozen expectations. Omit `--dry-run` for a live comparison using the existing local Gemini configuration. `--candidate-only`, `--case=06` and `--repetitions=1` select the narrow availability retest.

Local evidence is under `ai-review/output/`. The first comparison is in `source-scope-lshgI3`. The subject-check batch and its availability retest are in `source-scope-RJPOdp` and `source-scope-elpvm9`. The final batch and its gallery retest are in `source-scope-yX3JKC` and `source-scope-8DygRf`. Each directory contains its expectations, raw responses, checked answers and attempt history. The combined audit and release evidence are in `source-scope-2026-11-18`. [Case definitions](../ai-review/fixtures/source-scope-cases.json)
