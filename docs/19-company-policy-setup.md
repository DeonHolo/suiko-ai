# Turn a handbook into editorial checks

1. In **Editorial rules**, open **Company policy**. Give your policy a title and paste the text. Use a blank line between passages.
2. Choose **Save policy copy**. A saved copy keeps its original wording. Saving an edit creates a new copy.
3. Use **Suggest checks** for the whole copy. To work on a single passage, open **Use or refine a passage** and choose **Suggest a check for this passage**. **Use this wording** copies the passage into a proposal as written.
4. Read a suggestion beside the quoted policy. Check exceptions and applicability. Look at **Questions for the editor** and passages that received neither a question nor a suggestion.
5. Choose **Edit as proposal** for a check you want to keep. Edit the wording and choose which stories it applies to. Use **Discard suggestion** to remove a suggestion from this list.
6. Save the proposal and approve the exact saved rule version. Open a story and run a review. The rule settings and saved review let the designated editor reopen the original policy passage.

**Needs source material** identifies checks that benefit from reading a source. In this build, paste the relevant excerpt into **Review context**. Reading the public links themselves is AI-20.

## ServiceNow test on 12 November 2026

The fictional Juniper Cut Media handbook included a headline exception, contradictory sponsor instructions, an outside-footage exception, and a vague request about the audience. Expectations were written before the runs.

| Expected | Observed |
| --- | --- |
| Preserve the recorded-vote exception | Gemini suggested a check for News articles and kept the exception. The editor added a concrete action before saving and approving the rule. |
| Show the sponsor conflict for a person to resolve | Gemini asked whether sponsor names should be included or omitted. It cited both clauses. |
| Preserve the reuse-licence exception and human confirmation | The footage suggestion did both. Discarding it removed the suggestion and left the rule list alone. |
| Ask what “Make the audience feel good about the story” means | Gemini skipped this clause in the first successful response. Suiko now identifies passages absent from the suggestions and questions so the editor can act on them directly. |
| Preserve verbatim wording and require approval | The word-for-word path copied the first passage exactly and saved it as inactive. The separate edited proposal became active only after approval. |
| Keep the original copy after a revision | Saving a revised handbook created a second record. The approved rule still opened the original passage. |
| Apply the approved rule in a real review | “City approves a rehearsal space” claimed approval while its body said there had been no vote. The review cited the mismatch and asked for a headline that reflects the plan's pending status. This story review used Gemini 3.1 Flash-Lite after 3.5 returned HTTP 503. |

The first suggestion request returned HTTP 400. A direct Gemini 3.5 test isolated the request format. Simplifying the provider schema fixed it while the application kept its response limits and quotation checks. ServiceNow then returned the suggestions described above after one retry for a busy provider.

There are 78 passing local tests and a successful SDK build and install. The native regression verifies policy saves, reopening an earlier copy, repeat saves, forged passage rejection, and explicit approval. A dedicated everyday Editor could save a story and received 403 for the policy setup actions. Native regression result `94741d0d83689b106fffc629feaad3c7`.

The original policy copy is `8b84d94d83689b106fffc629feaad30f`. The revised copy is `46f5dd0183a89b106fffc629feaad302`. The saved story review is `0606514183a89b106fffc629feaad333`. Screenshots, the pre-run expectations and readback are in the ignored `ai-review/output/ai-19-2026-11-12/` folder.
