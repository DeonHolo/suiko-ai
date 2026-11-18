# FE-02 archive, restore and guarded deletion

Implementation record for [FE-02 (#2)](../TEAM-TASKS.md#fe-02-archive-restore-and-safe-deletion). Scope stays inside the existing `x_2236136_suiko_ai` app; the custom Archive screen, Rules screen and workspace client already prepared by Deon are unchanged. [Contract section](25-workspace-service-contract.md#fe-02-archive).

The review candidate prepares archive and restore. The Archive screen capability and permanent deletion stay off pending the installed guard tests. Keep issue #2 open until both are verified.

## What was built

- **Archive fields** on both `x_2236136_suiko_ai_story` and `x_2236136_suiko_ai_rule`: `archived`, `archived_at`, `archived_by`, plus the admin-controlled `disposable` and `protected_evidence` markers. The markers are not on any form; the tables' existing admin-only write ACLs keep them off ordinary editors. Ordinary records are not disposable by default.
- **GET `/api/x_2236136_suiko_ai/v1/workbench/archive?kind=story|rule&cursor=...`** returns archived items with `id, title, modified, archived_at`, `can_restore`, `can_delete: false` and a retention reason. Pages of 50 use a kind-bound cursor from the last returned row. Timestamp and ID sort in descending order. The ID bound applies only on a tied timestamp.
- **POST `workbench/archive`** checks the actor before looking up the item. Archive and restore use `expected_modified` with a unique write identity to distinguish a winning update from a concurrent duplicate.
- **Daily lists:** `GET workbench/state` omits archived stories and reports `story.archived`/`story.can_archive`. The rules view reports `archived`/`can_archive` per rule. The workspace hides archived rules. The capability stays off pending acceptance.
- **Guards:** archived stories reject new saved versions (`saveRevision`, 409) and new reviews (`reviewSavedVersion` checks the story before the provider is created, so no model call is made). Archived rules keep their earlier snapshots readable but are excluded from new review packs (`policy_pack.rules` and `source_rule_ids`).
- **Restore of a rule returns it off**, so it stays out of reviews until an editor turns it on; the saved approval record is untouched.
- **Permanent deletion is held on the server.** Admin role, archived state, modification count, the protected marker, fixed capstone examples and retained AI reviews are checked before returning a refusal. The original child-first deletion loop could leave a partial record set or remove a record concurrently restored. Reintroduce deletion only with proven all-or-nothing removal and a guard against references from legal tasks and the shared human decision log. Use separate throwaway records for delete tests.

Changed app files: `src/server/archive.ts` (new), `src/server/archive-test.ts` (new), `src/server/workbench.ts`, `src/server/editorial-rules.ts`, `src/fluent/review.now.ts` (columns + two REST routes), `src/fluent/review-tests.now.ts`, `src/fluent/tests/archive-guard.script.js` (new). No record IDs of existing artifacts changed; the SDK build uses frozen keys.

## Checks run so far

- Workspace screen checks (`npm --prefix servicenow-app run test:ui`), including the prepared Archive screen behaviour.
- Offline review checks (`npm --prefix ai-review test`) and the frozen-key app build (`npm --prefix servicenow-app run build -- --frozenKeys`).
- The FE-02 ATF section prepares checks for Editor, Rules Editor, outsider and admin fixtures. The assertions cover role denials, pagination across 52 fictional rows, retention markers, removal of a rule from subsequent reviews and restoration with the rule off. The suite uses fictional fixtures for all writes. Installed results are pending.

## Still needed in the shared ServiceNow instance (dev309702)

1. Resolve permanent deletion with the platform owner. Show that a failed child or parent deletion and a concurrent restore preserve the complete record set. Guard native delete access too. Cover references introduced by FE-03, BE-02 and BE-03.
2. After Deon reviews the update, install in a safe test environment, run the FE-02 suite and record its result. Test actual HTTP routes as Editor, Rules Editor, outsider and admin. Include simultaneous archive requests and archive versus a save/review. The current tests exercise the handlers and sequential stale checks.
3. Read the protected capstone records before and after. Use a newly made protected fixture to exercise refusal, and a separate disposable fixture for the successful delete check once that action is available.
4. Enable `capabilities.archive` after the checks pass and exercise the prepared screen as the respective roles. Leave #2 open while any required guard or screen check is pending.
