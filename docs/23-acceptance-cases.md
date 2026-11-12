# AI-23 ServiceNow acceptance cases

These are fictional examples for a made-up regional publisher. Write the expected results before submitting the stories to Gemini.

## Publish the first brief

1. Use a test branch in a public fork or repository you can push to. Set `ai-review/fixtures/public/listening-room-brief.txt` to say “16 January at 11 a.m.”, then commit and push it. The original 11 a.m. fixture is preserved in commit `58e5da9`; the later noon fixture is in `13efbd2`.
2. Copy the raw file URL for that branch into the first article's Sources field. Keep the branch name in the URL so that the history step can read changed text from the same address.
3. Check the saved source card after the first review. It should contain 11 a.m. before you assess the model's time finding. For the history step, change the same file to noon and push the update. If a new attempt still reads a cached 11 a.m. copy, retain that attempt and retry when the updated brief is available.

## Halyard Desk policy

For News articles, the public headline should say that a launch is proposed until the story says it has been approved. Ask the editor to restore the uncertainty when the headline is firmer than the article.

For Scripts, if the production notes identify a photograph, clip, or audio recording from outside the team, ask the editor to confirm permission when no licence or written release is supplied. An absent record needs confirmation.

Save the policy. Ask Suiko for checks, review its quotes and applicability, then approve a proposal based on the headline paragraph. Approve the source rule separately as editor-written wording. Approve a script-only rights check based on the second policy paragraph. Treat a missing record as Needs confirmation. If the proposed rules differ, record that and correct the wording before approval.

## First story

Format Article, kind News.

Title: Harbor radio archive opens in January (AI-23 demo)

Public text:

Halyard Desk is planning a public listening room for its community radio archive. The project is still a proposal and has no launch approval.

The listening room is proposed to open on 16 January at 10 a.m.

The proposed room has 40 seats. Entry will cost three dollars.

Supply the public project brief and a deliberately missing page, with no claim mapping. The first brief has 16 January at 11 a.m., 40 seats, and says admission has not been announced. Expect a headline/body conflict, a time conflict, support for 40 seats, and confirmation needed for price. Date support can be shown separately from the time. Expect the missing link to have its own status. The first draft gets an overview without comparison. Script rights is outside scope. Prefer Local news or Arts and culture, plus a suitable available tag if useful. Describe the proposed listening room without the disputed time or fee.

Save an editor-chosen description: A proposed listening room would let visitors explore recordings from the community radio archive.

## Revised story

Format Article, kind News.

Title: Halyard Desk proposes a listening room for its radio archive (AI-23 demo)

Public text:

Halyard Desk is planning a public listening room for its community radio archive. The project is still a proposal and has no launch approval.

The listening room is proposed to open on 16 January at 11 a.m.

The proposed room has 40 seats. Admission details are pending.

Expect the headline to reflect the proposal. Compare against the immediately preceding saved draft. Show the changed headline, corrected opening time and replacement of the $3 claim. The first source still supports the 40 seats and 11 a.m. and says admission is pending. The script-only rule stays outside scope.

## Unrelated script

Format Script, kind News.

Title: Behind the scenes at Cedar Frame's sound workshop (AI-23 demo)

Public text:

VOICEOVER: The Cedar Frame crew records footsteps for a short film.

SHOT LIST: Open with the street photograph credited to Sable Street Images. Cut to the team recording sound in the studio.

Review context: The opening image came from Sable Street Images. We haven't received written permission yet.

Expect an overview about the sound workshop and a permission follow-up for the outside photograph. Keep the specific photo and the editor's next action visible. Article-only rules stay out of scope. No source reading is required for this script. The rights rule's expected status is Needs confirmation.

## History and stale approval

After both article reviews, approve a replacement headline check that extends the uncertainty rule to the body and change the same brief URL from 11 a.m. to noon. Review the unchanged second saved draft again. Expect the new rule version and noon evidence, and a new time conflict. If the source reader reports its cached copy, record the attempt and retry after it reads the updated brief. Reopen the original first and second reviews. Expect the earlier rule wording, 11 a.m. snapshot, original findings, and the first review's saved editor choice.

Use two open editor views to keep proposal A available while a separate view saves B. Attempt to approve A. Expect a stale-change message and a pending B. Then approve the intended current version explicitly.
