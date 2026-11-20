# BE-03 decision history and permissions

Evidence record for [BE-03 (#6)](../TEAM-TASKS.md#be-03-history-and-permissions). The shared decision log and `workflow.history` were already delivered on `main` by [PR #36](https://github.com/DeonHolo/suiko-ai/pull/36) and [PR #37](https://github.com/DeonHolo/suiko-ai/pull/37). This change does **not** add a second table, writer, route, ACL or screen. It adds the missing BE-03 evidence: the combined role regression, the role matrix, the exact direct-API checks, the Studio verification steps and the exported app-file list. [Contract section](25-workspace-service-contract.md#be-03-and-acceptance). Legal rollout detail stays in [docs/32](32-legal-review-rollout.md).

## What already exists on `main`

- **`x_2236136_suiko_ai_decision`** (audited, `allowWebServiceAccess: false`): `story`, `revision`, `previous`, `version`, `action` (`request_changes` or `sign_off`), `actor` (`sys_user` reference), `actor_name`, `decided_at` (UTC), `note` (up to 1000 characters). The unique chain is reached from `story.editor_decision_head` through `previous`.
- **One editor writer**, `prepareEditorDecision` in `src/server/story-workflow.ts`. It takes the actor and time from the session, copies the revision/version from the saved copy and inserts one decision. It is called only by the guarded `workflowAction` handler after role, current-revision, archived-state and `expected_modified` checks.
- **One legal writer**, the legal task decision in `workbench.ts`. The task is the source of truth for the exact revision; its request and decision are appended to the same history response.
- **`workflow.history`** from `GET workbench/state?story=...`: `{ status, modified, current_revision_id, actions, reviewers, history }`. Each entry has `id, revision_id, version, action, label, actor, actor_id, decided_at, note`. Editor decisions are reachable from the accepted head; legal entries use `send_to_legal`, `legal_clear` and `legal_request_changes`. The server sorts newest first (`decided_at` descending, then `id` descending) and returns stored UTC values; the client formats them.
- **Access limits:** all four decision record ACLs are `admin` only with `adminOverrides: true`. The Editor API ACL requires the Editor role; the legal API ACL requires the legal reviewer role. `workflow.history` is built after the story read check, so an account without Editor access gets no story, revision or history values.
- **Deletion guard:** FE-02's `retentionReason` in `src/server/archive.ts` already returns "Retained editor decision history depends on this story." while `story.editor_decision_head` is set, and "Retained legal review history depends on this story." while a legal task exists.
- **AI evidence:** decisions, reviews, sources, rule versions and saved metadata are separate records. Recording a human decision does not write to an AI request/result or an editor metadata choice.

## What this change adds

- `src/server/decision-history-test.ts`: five combined regressions for the existing log.
- The **Suiko BE-03: decision history and permissions** section in `src/fluent/review-tests.now.ts`, added to the existing server suite.
- This document, one CHANGELOG row and the regenerated SDK keys.

No runtime file, schema, ACL, REST route or custom screen changed.

## Shared record shape

| Field | Set by | Meaning |
| --- | --- | --- |
| `story` | server | Derived from the saved revision; the history is read from this story. |
| `revision` | caller | The exact saved copy the human reviewed. |
| `version` | server | Copied from that revision, so the reader sees the copy number. |
| `action` | caller | `request_changes` or `sign_off` for editors; legal outcomes live on the legal task. |
| `actor` | server | Session user sys_id. Never accepted from the body. |
| `actor_name` | server | Display name at the time of the decision. |
| `decided_at` | server | Stored UTC time from `GlideDateTime`. |
| `note` | caller | Reviewer note, at most 1000 characters. |
| `previous` | server | The prior accepted decision, forming the append-only chain. |

BE-01 and BE-02 share the response shape and this storage; neither has a competing writer.

## Role matrix

| Capability | Editor | Rules Editor (contains Editor) | Legal reviewer | Admin | No role |
| --- | --- | --- | --- | --- | --- |
| `GET workbench/state?story=...` and `workflow.history` | Yes | Yes | **403** (the legal API serves its own tasks) | Yes | **403** |
| Record `request_changes` / `sign_off` through `POST workbench/workflow/actions` | Yes, when the status and current revision allow it | Yes, same checks | **403** | Yes | **403** |
| Read decision rows in the native list | **No** (record ACL is admin only) | **No** | **No** | Yes | **No** |
| Write decision rows directly | Denied | Denied | Denied | Native administrator access is audited | Denied |
| Change rules | **403** (`can_manage_rules: false`) | Yes (`can_manage_rules: true`) | **403** | Yes | **403** |
| Read/respond to an assigned legal task | **403** (legal API) | **403** | Assigned task only; unassigned sees no task and gets 404 on detail | Yes | **403** |
| `POST workbench/provider` | **403** | **403** | **403** | Yes | **403** |
| Read `provider` in state | `{ configured, model }` only | `{ configured, model }` only | **403** (no state access) | `{ configured, model }` only | **403** |
| Archive/restore a story | Yes | Yes | **403** | Yes | **403** |
| Permanently delete an archived story with decisions | **403** (admin-only action) | **403** | **403** | **409** while the decision is retained | **403** |

Legal note visibility is narrower than history visibility: an admin, the requesting Editor or the assigned reviewer sees the legal note; another Editor sees the legal event with an empty note.

## Direct-API tests

Use five dedicated accounts and one admin. Use distinct assigned and unassigned legal reviewers for the same test task. Use a newly saved fictional story, rule and decision for every write. The capstone IDs below are for readback only. The table disables web-service access. The installed check observed that the signed-in administrator could read a decision through the Table API using the SDK session. Ordinary access depends on the record ACLs and must be checked independently.

```powershell
# One-time per shell. Read these from your password store, not from a repository file.
$env:SUIKO_HOST          = 'https://dev309702.service-now.com'
$env:SUIKO_EDITOR        = '<editor account>'
$env:SUIKO_EDITOR_PASS   = '<from store>'
$env:SUIKO_RULES         = '<rules editor account>'
$env:SUIKO_RULES_PASS    = '<from store>'
$env:SUIKO_LEGAL         = '<assigned legal reviewer account>'
$env:SUIKO_LEGAL_PASS    = '<from store>'
$env:SUIKO_UNASSIGNED    = '<different legal reviewer account>'
$env:SUIKO_UNASSIGNED_PASS = '<from store>'
$env:SUIKO_OUTSIDER      = '<no-role account>'
$env:SUIKO_OUTSIDER_PASS = '<from store>'
$env:SUIKO_ADMIN         = '<admin account>'
$env:SUIKO_ADMIN_PASS    = '<from store>'
$env:SUIKO_STORY         = '<new fictional story created for these checks>'
$env:SUIKO_DECISION      = '<a disposable test decision from the admin native list>'

function Invoke-Suiko {
    param(
        [Parameter(Mandatory)][string]$User,
        [Parameter(Mandatory)][string]$Pass,
        [Parameter(Mandatory)][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        [string]$Body = ''
    )
    $out = Join-Path $env:TEMP 'suiko-be03.json'
    if ($Body) {
        $code = & curl.exe -sS -o $out -w '%{http_code}' -u "${User}:${Pass}" -X $Method `
            -H 'Content-Type: application/json' -H 'Accept: application/json' `
            --data-binary $Body "$env:SUIKO_HOST$Path"
    } else {
        $code = & curl.exe -sS -o $out -w '%{http_code}' -u "${User}:${Pass}" -X $Method `
            -H 'Accept: application/json' "$env:SUIKO_HOST$Path"
    }
    [pscustomobject]@{ Status = [int]$code; Body = (Get-Content $out -Raw) }
}
```

Read the current revision and modification count before the action checks:

```powershell
$state = Invoke-Suiko -User $env:SUIKO_EDITOR -Pass $env:SUIKO_EDITOR_PASS `
    -Method GET -Path "/api/x_2236136_suiko_ai/v1/workbench/state?story=$env:SUIKO_STORY"
$result = ($state.Body | ConvertFrom-Json).result
$revisionId = $result.workflow.current_revision_id
$modified = $result.workflow.modified
```

| # | Request | Account | Expected | Evidence to keep |
| --- | --- | --- | --- | --- |
| 1 | `GET /api/x_2236136_suiko_ai/v1/workbench/state?story=$env:SUIKO_STORY` | Editor | **200** | `result.workflow.modified` equals `result.story.modified`; `history` is an array with `id, revision_id, version, action, label, actor, actor_id, decided_at, note` |
| 2 | Same request | Rules Editor | **200** | Same shape and same decisions as the Editor |
| 3 | Same request | Admin | **200** | Same shape |
| 4 | Same request | Legal reviewer | **403** | Error body only; no story, revision or history values |
| 5 | Same request | No role | **403** | Error body only |
| 6 | `POST /api/x_2236136_suiko_ai/v1/workbench/workflow/actions` with `{"action":"request_changes","revision_id":"<current>","expected_modified":"<modified>","note":"Direct API check."}` | Editor | **200** | `result.workflow.history` gained exactly one entry with the session actor, version and UTC time |
| 7 | Repeat request 6 with the latest modification count from state | Editor | **409** | Current count passes the stale guard. The already-requested status rejects a second decision. |
| 8 | On a separate fictional story in Needs review, submit request 6 with its current revision and an older modification count | Editor | **409** | Request changes is otherwise available. The stale count rejects the write and history stays empty. |
| 8a | Save version 2 of an untouched fictional story. Submit request 6 using version 1 and version 2's current modification count. | Editor | **409** | The fresh count passes the stale guard. The old saved revision is rejected and history stays empty. |
| 9 | Request 6 | Legal reviewer | **403** | No decision, no story detail |
| 10 | Request 6 | No role | **403** | No decision, no story detail |
| 11 | `GET /api/now/table/x_2236136_suiko_ai_decision/$env:SUIKO_DECISION` | Editor | **403 or 404** | This account cannot read the native decision through the API |
| 12 | Same request | Admin | Record observed status | Record which authentication method was used. The SDK session returned 200 on the shared instance. |
| 13 | `POST /api/now/table/x_2236136_suiko_ai_decision` with `{"story":"<id>","revision":"<id>","version":1,"action":"sign_off","actor":"<id>","decided_at":"2026-11-19 00:00:00"}` | Editor | **403** | No forged decision exists |
| 14 | Read the fixture through the native list | Admin | Readable | The actor and revision match the accepted entry. Leave the audit row intact. |
| 15 | `PATCH /api/now/table/x_2236136_suiko_ai_decision/$env:SUIKO_DECISION` with `{"note":"rewritten"}` | Editor | **403 or 404** | Reopened row still has its original note, actor and time |
| 16 | Check the fixture's native delete access with `canDelete()` | Editor and Rules Editor | Denied | The ATF check tests the ACL without attempting to remove a saved decision |
| 17 | `POST /api/x_2236136_suiko_ai/v1/workbench/rules` with a valid saved-rule body | Editor | **403** | An everyday Editor cannot change rules |
| 18 | Same request | Rules Editor | **200** | The designated Rules Editor can change rules |
| 19 | Same request | No role | **403** | No rule access |
| 20 | `POST /api/x_2236136_suiko_ai/v1/workbench/provider` with `{"model":"not-a-supported-model"}` | Admin | **400** | `GET state` still reports the previous `provider.model`; no key is returned |
| 21 | `POST /api/x_2236136_suiko_ai/v1/workbench/provider` with any body | Editor | **403** | Provider configuration stays admin-only |
| 22 | `POST /api/x_2236136_suiko_ai/v1/workbench/archive` with `{"action":"delete","kind":"story","id":"<archived story with a decision>","expected_modified":"<count>"}` | Admin | **409** | Body contains `Retained editor decision history depends on this story.`; the story stays archived |
| 23 | `GET /api/x_2236136_suiko_ai/v1/legal/tasks?task=<assigned task>` | Assigned legal reviewer | **200** | The task shows the frozen revision, status, action list and decision |
| 24 | Same request | Unassigned legal reviewer | **404** | No task text, assignee or reason |
| 25 | `GET /api/x_2236136_suiko_ai/v1/legal/tasks` | Unassigned legal reviewer | **200** | The list omits the task assigned to someone else |
| 26 | `POST /api/x_2236136_suiko_ai/v1/legal/tasks/decision` with the task/revision and a stale count | Assigned legal reviewer | **409** | No second legal decision |
| 27 | Same request | Unassigned legal reviewer | **404** | No response reaches the task |
| 28 | Same request | No role | **403** | The legal API rejects the account |
| 29 | `GET /api/x_2236136_suiko_ai/v1/workbench/decisions` | Editor | **404** | There is no public decision endpoint; decisions are written only by the guarded workflow and legal actions |

Save each response body and status under the ignored local `ai-review/output/` folder. Keep credentials and provider data out of the captures.

## Studio steps

1. **Install the branch build** in `dev309702` through Deon's prepared install flow. No feature property needs to change for these checks; the ATF section sets its own role fixtures.
2. **Studio → Suiko AI → Data → Suiko editor decision** (`x_2236136_suiko_ai_decision`). Confirm the fields above, **Audit** on and **web service access** off. Confirm the table has no custom form or list added by BE-03; an admin inspects rows in the platform list, and an Editor has no native read access.
3. **Studio → Access Control.** Confirm the four decision record ACLs are `admin` with admin override, the Editor API ACL requires `x_2236136_suiko_ai.editor`, and the legal API ACL requires `x_2236136_suiko_ai.legal_reviewer`.
4. **Studio → Automated Test Framework → Suiko AI: server review regressions → Suiko BE-03: decision history and permissions.** Confirm the order: admin as suite runner first, then Editor, Rules Editor, legal-only and no-role users. Run the suite and record its result sys_id.
5. Open a test story, record a changes request, then reopen **GET workbench/state**. Confirm `workflow.modified` matches the story count and the history entry has the display name, version, note and UTC time. Refresh and confirm the order is unchanged.
6. The manual check requires a configured model provider. On a fictional fixture, save an AI review and an editor-chosen description. Record a human decision, save a newer copy and replace the approved test rule with revised wording. Reopen the older review and decision. Compare the original rule, quoted passage, chosen description, revision, actor, time and note.
7. Archive the story as an Editor, then attempt permanent deletion as an admin from the Archive. Confirm the item stays archived with the retained-decision reason. Restore it and confirm the history is still there.
8. Confirm the prepared workspace **Team decisions** panel renders the same payload. BE-03 adds no custom screen and changes no client code.
9. Before and after the run, reopen the capstone records listed below and confirm they are unchanged.

## Record IDs for the PR evidence

Use the fixtures created by the run (the ATF section generates them) and keep these fixed capstone IDs for the before/after check. They come from [the acceptance results](23-acceptance-results.md#saved-evidence).

- Stories: `89688f4583e4db106fffc629feaad327` (article), `eaa8c78583e4db106fffc629feaad33e` (script).
- Rule: `c1484b4583e4db106fffc629feaad326`.
- Reviews: `1a68438583e4db106fffc629feaad3e3`, `1a88078583e4db106fffc629feaad3e1`, `c3a84b8583e4db106fffc629feaad338`, `c20d0b018328db106fffc629feaad359`.

Do not write to these records. The deletion guard already refuses to remove the protected capstone items.

## Checks run so far

- `npm --prefix ai-review test` — **113** offline review checks pass.
- `npm --prefix servicenow-app run test:ui` — **25** screen checks pass (the prepared Team decisions panel is included; BE-03 changed no screen).
- `npm --prefix servicenow-app run build` and `npm --prefix servicenow-app run build -- --frozenKeys` — both pass. `src/fluent/generated/keys.ts` only gained the new ATF step, user and documentation identities; no existing record identity changed.
- The new ATF section runs as five fixtures:
  - **Admin (suite runner):** one decision, native row readable/writable with actor, action, time and exact revision; an unsupported provider model returns 400 without changing the saved provider; archive keeps the decision readable; deletion returns 409 with the retained-decision reason; restore succeeds.
  - **Editor:** two decisions on two exact copies with the full history shape and stable ordering; `can_manage_rules` false; provider 403; native decision row unreadable and unwritable.
  - **Rules Editor:** a decision on the exact copy, history readback and `can_manage_rules` true; native decision row unreadable and unwritable. ATF checks that twelve active rules reject an extra approval. It opens one slot and approves the fixture rule through the normal handler, then saves the fictional review with an injected source passage and provider reply. The earlier review and decision retain their exact evidence after a new draft and rule approval.
  - **Legal-only:** Editor state, Editor decision, story list and provider configuration all 403 before any record is read.
  - **No role:** the same four paths all 403.
- Run this suite on a development or test instance. The Rules Editor step uses fictional rules to fill free slots and briefly pauses one rule during the full-rulebook check. It prefers a fictional rule and excludes the protected capstone rule. ATF rolls back the test data. This automated check makes no live model call.

## Direct HTTP observations on the shared instance

Using the existing authenticated SDK session, ServiceNow impersonated five temporary users with only their test roles. Acting as the ordinary Editor, the two separate requests returned 409 for the intended guards. The repeat used the fresh count and the stale-count request used a different draft that was eligible for changes. The original decision reopened with the same actor, note, time and saved revision.

The Rules Editor could save a fictional rule draft. The ordinary Editor and outsider received 403. The assigned reviewer opened the exact legal copy and received 409 on a stale response. The unassigned reviewer received 404 and saw an empty queue for that task. A no-role account received 403. The Editor received 404 for a direct decision read or update and 403 for a direct insert. The signed-in administrator received 200 on the read. No native decision was changed by that read. Admin's attempt to delete the archived fictional story returned 409 with the retained-decision reason.

The local evidence folder is `ai-review/output/pr38-history-2026-11-21/`. `direct-http.json` preserves the 38 observations, including the administrator-read expectation that failed. The HTTP pass ran against the already installed workflow from #36 and #37. The new ATF section provides the separate installed regression for PR #38.

## Still needed in the shared instance

1. Install the branch build and run the installed suite; put the suite result sys_id here.
2. Compare the saved capstone stories, rule and reviews before and after installation.
3. Attach the installed suite and direct HTTP evidence summary to the PR before closing #6.

## Exported app files

New:

- `servicenow-app/src/server/decision-history-test.ts` — the five role regressions.
- `docs/33-decision-history-permissions.md` — this record.

Changed:

- `servicenow-app/src/fluent/review-tests.now.ts` — the BE-03 test and its suite registration.
- `servicenow-app/src/fluent/generated/keys.ts` — regenerated by the SDK build.
- `CHANGELOG.md` — one row.

Not changed by this PR: `src/server/story-workflow.ts`, `src/server/workbench.ts`, `src/server/archive.ts`, `src/fluent/review.now.ts`, the client and every existing table/ACL/route. The decision table, writer, history readback and deletion guard are the merged #36/#37/FE-02 implementation.

No secret, API key, password, provider value or instance export is part of these files.
