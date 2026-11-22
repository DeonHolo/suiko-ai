# FE-02 archive, restore and guarded deletion

Implementation record for [FE-02 (#2)](../TEAM-TASKS.md#fe-02-archive-restore-and-safe-deletion). Scope stays inside the existing `x_2236136_suiko_ai` app; the custom Archive screen, Rules screen and workspace client already prepared by Deon are unchanged. [Contract section](25-workspace-service-contract.md#fe-02-archive).

The first release delivered archive and restore. Permanent deletion has a separate server switch, `x_2236136_suiko_ai.archive_delete_enabled`, which defaults off. Enable it only after the installed checks pass on disposable fixtures.

## What was built

- **Archive fields** on both `x_2236136_suiko_ai_story` and `x_2236136_suiko_ai_rule`: `archived`, `archived_at`, `archived_by`, plus the admin-controlled `disposable` and `protected_evidence` markers. The markers are not on any form; the tables' existing admin-only write ACLs keep them off ordinary editors. Ordinary records are not disposable by default.
- **GET `/api/x_2236136_suiko_ai/v1/workbench/archive?kind=story|rule&cursor=...`** returns archived items with `id, title, modified, archived_at`, `can_restore`, server-calculated `can_delete`, a retention reason or a delete summary. Pages of 50 use a kind-bound cursor from the last returned row. Timestamp and ID sort in descending order. The ID bound applies only on a tied timestamp.
- **POST `workbench/archive`** checks the actor before looking up the item. Archive and restore use `expected_modified` with a unique write identity to distinguish a winning update from a concurrent duplicate.
- **Daily lists:** `GET workbench/state` omits archived stories and reports `story.archived`/`story.can_archive`. The rules view reports `archived`/`can_archive` per rule. The workspace hides archived rules. Enable the Archive screen after archive and restore pass installed checks.
- **Guards:** archived stories reject new saved versions (`saveRevision`, 409) and new reviews (`reviewSavedVersion` checks the story before the provider is created, so no model call is made). Archived rules keep their earlier snapshots readable but are excluded from new review packs (`policy_pack.rules` and `source_rule_ids`).
- **Restore of a rule returns it off**, so it stays out of reviews until an editor turns it on; the saved approval record is untouched.
- **Permanent deletion is admin-only.** Archived disposable stories and archived rules that were never approved may qualify. Protected examples, retained reviews, decisions and legal tasks stay archived. An original copy stays protected even if a related record also points to a different parent.
- Archive reserves the archived record using the supplied modification count. A conflicting restore cannot take the reservation. A write that can add a version, review or decision reserves the active parent while it inserts the child.
- The server checks the installed cascade settings, business rules and retention references before removal. It refuses an unfamiliar relationship or a separate delete rule that could leave a partially removed set. Only owned story or rule versions cascade from a parent. Ordinary native delete access is blocked.

Changed app files: `src/server/archive.ts` (new), `src/server/archive-test.ts` (new), `src/server/workbench.ts`, `src/server/editorial-rules.ts`, `src/fluent/review.now.ts` (columns + two REST routes), `src/fluent/review-tests.now.ts`, `src/fluent/tests/archive-guard.script.js` (new). No record IDs of existing artifacts changed; the SDK build uses frozen keys.

## Checks run so far

- Workspace screen checks (`npm --prefix servicenow-app run test:ui`), including the prepared Archive screen behaviour.
- Offline review checks (`npm --prefix ai-review test`) and the frozen-key app build (`npm --prefix servicenow-app run build -- --frozenKeys`).
- The FE-02 ATF section prepares checks for Editor, Rules Editor, outsider and admin fixtures. The assertions cover role denials, pagination across 52 fictional rows, retention markers, removal of a rule from subsequent reviews and restoration with the rule off. The suite uses fictional fixtures for all writes. Installed results are pending.

## Still needed in the shared ServiceNow instance (dev309702)

1. Use fictional records. Verify the selected record and every saved copy remain when a reference or configured delete rule blocks removal. Verify a stale confirmation after restore or rearchive is refused. Verify direct native deletion is blocked.
2. After Deon reviews the update, install in a safe test environment, run the FE-02 suite and record its result. Test actual HTTP routes as Editor, Rules Editor, outsider and admin. Include simultaneous archive requests and archive versus a save/review. The current tests exercise the handlers and sequential stale checks.
3. Read the protected capstone records before and after. Use a newly made protected fixture to exercise refusal, and a separate disposable fixture for the successful delete check once that action is available.
4. After verifying the installed candidate, enable permanent deletion. Record successful deletion of a disposable story with multiple versions and an unused rule with its proposal. Verify the protected capstone and existing decision evidence before and after.
