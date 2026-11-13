# Connecting the screens to ServiceNow

This is the implementation agreement for the seven [team tickets](../TEAM-TASKS.md). Deon owns the custom frontend. Teammates implement these ServiceNow resources and guards. Existing save/review/rules/policy APIs remain compatible.

**Status:** the workspace client is prepared for these responses. The new Inbox, archive and human/legal workflow APIs are not implemented by the UI change. Enable a capability only after its complete real API passes role-based tests.

## Shared conventions

- Existing scope: `x_2236136_suiko_ai`. Editor API base: `/api/x_2236136_suiko_ai/v1/workbench`.
- Separate legal API base: `/api/x_2236136_suiko_ai/v1/legal`. A legal-only user must not need Editor access to get an assigned task.
- Responses use ServiceNow's `{ "result": ... }` wrapper. Errors use an appropriate HTTP status and `result.message` (or the native error message). Messages tell a person what happened and what to do next.
- Send stored UTC timestamps. The client converts them to local 12-hour time without seconds. Send human display names separately from IDs.
- `modified` is the record's `sys_mod_count`, represented as a string. Mutations compare `expected_modified` to it. Current-version checks are also required for human decisions.
- Lists return `{ items: [...], next_cursor: null | "opaque-token" }`. A cursor belongs to its search/filter/kind. Validate it and keep page order stable.
- Actors and permissions come from the session. Never trust a supplied actor, boolean permission, status or disposable marker.
- Existing roles: `x_2236136_suiko_ai.editor`, `x_2236136_suiko_ai.rules_editor`. Add a legal role through FE-03. Keep provider configuration admin-only.

## GET workbench/state

Keep existing fields. The UI change adds `viewer_id`, recent stories' `updated_at`, and selected `story` metadata even when no revision exists.

Teammates add these fields as their features become ready:

```json
{
  "capabilities": {
    "source_reading": true,
    "inbox": true,
    "archive": true,
    "workflow": true,
    "legal_review": true
  },
  "story": {
    "id": "story-id",
    "title": "Story title",
    "modified": "4",
    "archived": false,
    "can_archive": true
  },
  "workflow": {
    "status": "needs_review",
    "modified": "4",
    "actions": ["request_changes", "send_to_legal", "sign_off"],
    "reviewers": [{"id": "user-id", "name": "Reviewer name"}],
    "history": [{
      "id": "decision-id",
      "action": "request_changes",
      "label": "Changes requested",
      "actor": "Editor name",
      "version": 1,
      "decided_at": "2026-11-13 02:15:00",
      "note": "Confirm the opening time."
    }]
  }
}
```

This is an example of the finished contract, not a response currently promised by the PDI. Omit or set false any unfinished capability. Missing workflow means no decision controls. Return actions allowed for that account and current state, not the full example array for every story.

## FE-01: GET workbench/stories

Query: `q` (title search), `status` (optional known value), `cursor` (empty for first page).

Each item: `id, title, version, content_format, status, updated_at`. Sort by last activity descending, then ID. Limit 50. Exclude archived/inaccessible stories. An empty search returns the first page, not every record in one response.

Workflow values:

| Stored value | Screen label |
| --- | --- |
| needs_review | Needs review |
| changes_requested | Changes requested |
| signed_off | Signed off |
| waiting_for_legal | With legal |
| ready_for_sign_off | Ready for sign-off |

Until this API is ready, the custom list searches only the existing state's recent 50 stories and has no workflow filters.

## FE-02: Archive

GET `workbench/archive?kind=story|rule&cursor=...`.

Each item: `id, title, modified, archived_at, can_restore, can_delete`. Optional `retention_reason` explains why it stays; `delete_summary` names what an eligible deletion removes. For example: “Removes this disposable story, two saved versions and two AI reviews.”

POST `workbench/archive`:

```json
{"action":"archive","kind":"story","id":"story-id","expected_modified":"4"}
```

Action is `archive`, `restore` or `delete`. Return `{ item: updatedItem }` for archive/restore, and `{ deleted: true, id, kind }` for delete. The returned archive item may include `can_restore: true` so Undo can restore using its new modification count.

Archive preserves drafts, reviews and decisions. Restore of a rule leaves it off. An archived story cannot receive new versions/reviews or human decisions; its saved history remains readable by authorized accounts.

**Deletion policy:** only admins, only already-archived items, only unused records or explicitly marked disposable demos. Protected capstone evidence, retained reviews, human/legal decisions and references from retained records block deletion. A rule used by a retained review cannot be deleted. Demo marking never overrides protected evidence or retained human decisions.

Check all affected children/references and modification guards before mutation. Do not delete a parent while leaving orphaned evidence. If full safe removal cannot be guaranteed, reject deletion with a reason and leave it archived. Do not delete native audit logs to tidy the app.

Editor may archive/restore stories. Rules Editor may archive/restore rules. Admin-only disposable/protected markers are not ordinary editable form fields. Every action recomputes permission; `can_delete` in a previous response is not authorization.

## BE-01/BE-02: POST workbench/workflow/actions

```json
{"revision_id":"revision-id","expected_modified":"4","action":"request_changes","note":"Confirm the opening time."}
```

Actions: `request_changes`, `sign_off`, `send_to_legal`. The latter also requires `reviewer_id` and a reason in `note`. Validate reviewer eligibility. Obtain actor from the session and check Editor authority plus access to the story owning that revision. Reject inaccessible targets without revealing their details. Reject archived/noncurrent drafts. Compare `expected_modified` with the story's current `sys_mod_count`; `workflow.modified` exposes that value. The revision is immutable, so its modification count cannot guard changes to human workflow state.

Return `{ workflow: updatedWorkflow }`; the current screen then reloads state. Required notes: changes request and legal routing. Sign-off note is optional.

Identical saves keep the current revision/status. Changed submissions create a new revision and Needs review. AI activity cannot mutate human status. Once a story was escalated to legal, each current revision needs its own clearance before sign-off. Old-task decisions must not change a newer revision's status. Prevent duplicate pending tasks and duplicate human decisions.

## FE-03: GET legal/tasks

Without `task`: return `{ tasks: [...] }`. Each item: `id, title, version, status, requested_at`. Only permitted assigned tasks.

With `?task=ID`: return:

```json
{
  "task": {
    "id":"task-id",
    "title":"Story title",
    "modified":"2",
    "status":"pending",
    "reason":"Check permission for the outside clip.",
    "requested_by":"Editor name",
    "requested_at":"2026-11-13 02:15:00",
    "revision":{"id":"revision-id","version":1,"title":"Story title","text":"Frozen story text","notes":"Saved notes"},
    "actions":["clear","request_changes"]
  }
}
```

States: `pending`, `cleared`, `changes_requested`. Return an empty action array when no response is permitted. A completed task may include `decision: { note, actor, decided_at }`.

The revision must be the task's referenced saved copy, not whatever is current today. An inaccessible task must not reveal its text, assignee or reason. Legal-only page access is separate from Editor API access.

## BE-02: POST legal/tasks/decision

```json
{"task_id":"task-id","revision_id":"revision-id","expected_modified":"2","action":"clear","note":""}
```

Return `{ task: updatedTask }` with fresh modification count, state, decision and allowed actions. Require a note for request_changes. Check assigned reviewer/admin authority, matching task/revision, pending state and modification count. Record actor/time server-side. Reject repeats/stale requests without duplicating decisions.

## BE-03 and acceptance

History records every accepted human action once against its exact revision. It is read-only for ordinary accounts. Keep source/rule snapshots and saved metadata choices unchanged.

Verify all endpoints through direct requests as Editor, Rules Editor, assigned legal-only user, unassigned legal user and outsider. Include stale tabs, newer revisions, protected archive items and AI failure. Keep the evidence and exported metadata with the PR. [Complete demo checklist](../TEAM-TASKS.md#qa-01-rehearse-the-whole-flow)
