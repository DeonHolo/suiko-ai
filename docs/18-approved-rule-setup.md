# Setting up editorial rules

Suiko now keeps a saved proposal separate from the rule an editor approved. A proposed edit cannot quietly change the instructions used by a review.

## Try it in ServiceNow

1. Open [Suiko AI](https://dev309702.service-now.com/x_2236136_suiko_ai_review.do) and choose **Editorial rules**. This tab is available to the designated editor.
2. Choose **Write my own rule**, or open **Optional starter rules** and pick a starting point. The five starters are suggestions; choosing one does not activate it.
3. Edit the instruction. Choose the formats and content kinds it applies to. Add optional conditions or things a person must confirm.
4. Click **Save proposal**. Read the saved wording, then click **Approve rule version …** when it is ready to use.
5. Open a story and click **Review this version**. **Rules and review details** shows the rule versions used and explains checks that do not apply.
6. To change a rule, save another proposal. The earlier approved wording stays active while that proposal awaits approval. **Turn rule off** removes it from future reviews. Earlier reviews keep their own copy.

Older rules without an approval record show **Approval not recorded**. Approve a saved proposal to use one in new reviews. This avoids inventing an approval for an earlier prototype rule.

The current build saves source links as references. It does not open those links yet. A permission note can inform a review, but the editor still checks the actual agreement. Public-source reading is AI-20.

## What was tested on 12 November 2026

Expected results were written before the live runs. The fictional article said the council was only considering a rehearsal hall, while its headline said the hall was approved.

| Check | Observed result |
| --- | --- |
| Manual rule, Article / News scope | Both live Gemini 3.5 Flash-Lite reviews flagged the overstated headline, quoted the title and body, and suggested changing the headline. The overview remained visible. |
| Sponsorship starter, Sponsored scope | Both reviews showed **Not applicable** for the News story and explained the saved format/kind scope. |
| Saved but unapproved replacement | A second live review still used approved rule version 1 while version 2 awaited approval. Saved request readback confirmed the original instruction. |
| Approve replacement and reopen history | The rule advanced to version 2. Both earlier reviews still displayed version 1 and its original wording. |
| Disable and enable again | The browser actions preserved the approved version and earlier reviews. |
| Missing footage permission record | On the first run Gemini 3.5 asked for the right record but called its absence a potential conflict. After a prompt clarification, Gemini 3.1 Flash-Lite returned **Needs confirmation**, quoted the footage and production note, and asked the editor to confirm permission. The second run used the saved fallback after a Gemini 3.5 HTTP 503. |
| Everyday Editor | An installed server test created a dedicated non-admin Editor: story save/reopen passed; all three rule-write actions returned 403. |
| Designated editor | A dedicated non-admin rules editor passed proposal, approval, pending replacement, stale edit/approval rejection, original-version preservation and disable/re-enable checks. An interrupted saved proposal did not block the next version. The test supplies controlled capacity to the approval service, verifies rejection at 12, and rejects a repeat approval even with the latest version token. |

There are **73 passing local checks**, a successful SDK build/install and a passing ServiceNow server regression suite. The browser checks used the existing admin session; the separate native tests establish the non-admin role boundary. These tests call installed workbench actions, not a mocked rule store. ATF rolls back its fixture users and records.

Both live reviews withheld an otherwise useful description because the cautious body passage was also cited in the headline-conflict finding. The useful overview, finding and tags remained. AI-21 records this overly broad metadata exclusion as follow-up work; it is not a failure of rule approval or version preservation.

### Saved evidence

- Story: `3bd8890583289b106fffc629feaad378` — **Council approves a new rehearsal hall**.
- Reviews: `01e80d0583289b106fffc629feaad35d` and `d049cd0583289b106fffc629feaad3df`.
- Headline rule: `c5a80dc183289b106fffc629feaad362`; approved version 1 was used by both reviews. Its replacement is now approved as version 2.
- Footage script `d1d0114583689b106fffc629feaad369`, initial review `15d0514583689b106fffc629feaad36d`, and updated review `17a191c583689b106fffc629feaad35b`.
- ServiceNow suite result after the CodeRabbit fixes: `217015c183689b106fffc629feaad395`. Rule and permission test result: `257015c183689b106fffc629feaad39f`.
- Local evidence folder: `ai-review/output/ai-18-2026-11-12/`, including the pre-run expectations, saved requests/results, ATF details and screenshots. This folder is excluded from GitHub.

The demo rules are off after testing. The saved reviews retain the rules and passages they used.
