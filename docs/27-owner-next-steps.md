# Deon's next steps

You own the custom screens and AI feature. Teammates supply the ServiceNow data and actions. You can design, build and preview a screen before its API is finished. The prepared controls become usable when their real actions and permissions are connected.

For example, the archive/delete buttons already exist in the frontend. **Ticket #2 (Romeo) supplies their ServiceNow actions.** After review and integration, the editor can archive an item; an eligible admin can delete it from Archive. The backend checks eligibility even if someone bypasses the button.

## Work you can do without waiting

Recommended order:

1. **Check the existing screens as ordinary users.** Use an Editor and a Rules Editor, rather than only admin. Check story entry, save/review, source passages, publishing choices, rule setup and plain error messages. The live redesign was inspected as admin; these account checks remain useful independent work.
2. **Improve the AI's useful mistakes.** Start with the recorded outside-photo example: it asked the right permission question but called missing information a conflict. Write the expected outcome first, refine the instructions, and compare the same case plus unrelated examples. Keep source passages and confidence visible for the editor to interpret.
3. **Prepare a small media review pack.** Include an article, unrelated script, caption and revision. Cover a supported claim, conflicting source, missing information, paid relationship and outside-media permission. State what should be flagged before running AI. Reuse the existing evaluation fixtures and preserve actual misses.
4. **Finish the interaction details.** Check empty/loading/partial/failed states, keyboard use, long titles, long policy text, narrow screens and repeated feedback. Prioritize issues that make the next action hard to find. The dropdown inset and direct Priority field are examples.
5. **Preview the prepared workflow screens with sample responses.** Archive, Legal Review and decision controls can be inspected locally using the agreed contract. Keep a local demo clearly identified and separate from the live instance; a simulated success does not complete a platform ticket.
6. **Prepare the demo explanation and evidence.** Show one story moving from first draft to revision, explain the source check and optional second opinion, and capture the saved history. Leave the human sign-off segment marked pending until its actions exist.

The strongest next step after the current UI fixes is **ordinary-account checks on the existing AI flow**, followed by the recorded permission-label improvement. Both improve the working feature immediately.

These are proposed next actions. This document does not create new GitHub tickets or claim that these checks have been run.

## Which skills fit the checks

Use the skills already installed on Deon's machine. Teammates do not need to install them to follow the task steps.

| Order | Skill | What to ask it to check |
| --- | --- | --- |
| 1. Ordinary accounts | `e2e-testing` | Follow the existing save → review → open evidence flow as Editor and Rules Editor. Include a direct unauthorized request: hiding a button alone does not prove access is protected. Record what works and what fails. |
| 2. Known AI mistakes | `evaluation` | Write expected observations before calling Gemini. Compare the permission case and unrelated examples. Score useful concerns, missed concerns, needless warnings and matching evidence. Do not require identical wording or claim that confidence proves truth. |
| 3. Media example pack | `evaluation` | Keep a small repeatable article, script, caption and revision pack, plus examples not used while tuning the prompt. Compare Flash-Lite and the optional Decision 1 source check using the same retrieved passages. Keep disagreements and misses in the report. |
| 4. Interaction details | `accessibility-compliance-accessibility-audit` plus `e2e-testing` | Check keyboard access, visible focus, clear labels and useful messages, then the empty, loading, failed and partly completed states. Inspect narrow screens and long story/rule names. An automated scan does not replace the walkthrough. |
| 5. Pending workflow screens | `e2e-testing` | Exercise the prepared Archive and Legal screens locally with example API responses. Label these as simulations. Repeat against real ServiceNow actions after the teammate's work is integrated. |
| 6. Review and handoff | `code-review` | Compare the PR against both the agreed requirements and repository standards, then assess CodeRabbit's findings. After installation, repeat the relevant editor journey and record evidence. Code review cannot prove the deployed app works. |

For a reproduced software bug, use `diagnosing-bugs` to investigate it, then add a focused regression check at the existing public interface. Use `tdd` for new behavior when the interface and test boundary have been agreed. We already have component tests, AI checks and a working browser; reuse those before adding another testing service.

Start with the ordinary-account walkthrough. The review-history fixes are a separate focused check; they do not complete the account and access checks above.

## The handoff loop for each teammate PR

1. Ask for the issue number, changed Studio app-file IDs, exported configuration/source, stable record IDs and expected/actual test evidence. A live Studio change also needs its export in the PR so a later install preserves it.
2. Review against that ticket and the [screen/API contract](25-workspace-service-contract.md). Read CodeRabbit's findings, verify them against the actual change and fix the valid ones. Confirm exports contain no credentials/provider data or unrelated teammate changes.
3. Check field names, response shape, allowed actions, modification guards and useful error messages. Backend actions derive the actor and permissions from the signed-in account.
4. Test the actual actions using the relevant ordinary accounts. Include the failure cases below. A button being hidden is not proof that the server rejects an unauthorized request.
5. Deon decides whether to merge a teammate PR. The assistant can review and prepare integration fixes; it does not automatically merge teammate work. Use a reference instead of closing the issue if its integrated Done when check is still pending.
6. Connect or adjust the prepared frontend. Put any source changes through Deon's own PR/review loop. Keep the feature gated until its real actions and dependencies work; a compatible response may need no frontend code changes.
7. Inspect newer shared Studio changes, then build and install the complete reviewed platform and frontend changes from Deon's local clone. Test the integrated screens in that installed app with the relevant ordinary accounts. Enable the feature only once its dependencies pass, record the result and close the ticket after its Done when check passes.

## What you do after each ticket

| Ticket | What the teammate supplies | Your next step | Prove it works |
| --- | --- | --- | --- |
| **#1 / FE-01 — Story list data** | Story search, status filters and pagination | Connect the Stories list to the real API; check its response against the existing adapter. Enable all-story search once ready. Status filters also need #4's status data. | Find a story beyond the current recent-50 fallback, filter by status, load another page and open the correct saved version. An old search reply must not replace a newer search. |
| **#2 / FE-02 — Archive and delete** | Archive/restore, eligibility checks and guarded deletion | Connect the prepared Archive screen and story/rule buttons. Check confirmations, Restore, optional Undo and the returned permission flags. Enable Archive only after real actions pass. | Archive removes an item from daily lists; restore brings it back. A restored rule stays off. Only an eligible archived unused item/disposable demo can be deleted by admin. Protected evidence, retained reviews and human/legal history stay protected. Stale and unauthorized direct requests fail. |
| **#3 / FE-03 — Legal records and read access** | Assigned tasks, frozen draft and legal-only access | Connect the prepared Legal Review list/detail screen. Verify the submitted headline, body, notes and reason. Legal decisions also need #5. | The assignee sees the submitted copy even after a newer draft exists. An unassigned account cannot fetch its text. A legal-only account can use its task without Editor access. |
| **#4 / BE-01 — Editor decisions** | Current revision, story status, request changes and sign-off | Connect status/actions to the Story screen and return the result to Stories. Check required notes, refreshed history and the story modification guard. Legal routing/clearance depends on #5. | Decide on the current version. An old tab gets a useful conflict message. A changed save resets the version's status; an identical save preserves it. AI failure/retry cannot change human status or block a permitted manual decision. |
| **#5 / BE-02 — Legal routing and decisions** | Send-to-legal, clear/request changes and fresh-clearance guard | Connect the prepared legal dialog and task response buttons. Refresh the editor's status after legal responds. Check the sequence across both screens. | Clear Version 1, save Version 2, and show that Version 2 needs new clearance. After fresh clearance, the Editor can sign off that same copy. Old-task decisions do not change a newer draft's status. Duplicate requests do not create duplicate tasks/decisions. |
| **#6 / BE-03 — Human history and access** | Read-only human decision log and server permission checks | Connect Team decisions to the Story screen, with person, local time, note and exact version. Check every action against the role matrix. | Earlier human decisions and AI evidence survive revisions and rule edits. Editor, Rules Editor, assigned/unassigned legal and outsider requests behave as intended. Provider configuration stays admin-only. |
| **#7 / QA-01 — Whole-app rehearsal** | A teammate's recorded ordinary-account walkthrough | Review the evidence, fix integration/UX gaps, update docs/screenshots and repeat affected steps. Prepare the final presentation. | Another person can follow first draft → AI review → changes → legal when needed → editor sign-off, then reopen the evidence for each version. |

## Dependencies to expect

- **#1 + #4:** list filters need the real status/current-version fields.
- **#2 + #6:** deletion guards need a shared understanding of retained evidence and human/legal history.
- **#3 + #5:** legal read access and legal decision actions must agree on one task schema.
- **#4 + #5 + #6:** sign-off, clearance and history must refer to the same frozen revision.
- **#7:** run the combined rehearsal once the installed parts work together.

If one half is ready, test that half and keep the remaining integration check visible. Do not turn on every capability because one endpoint exists.

[Detailed teammate steps](../TEAM-TASKS.md) · [Current AI handoff](26-ai-review-handoff.md) · [Screen results](24-newsroom-workspace.md)
