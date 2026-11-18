# Legal review rollout

18 November 2026. PR #28 covers the exact-version legal task, assignment and decision endpoints. It references FE-03 (#3) and BE-02 (#5). Editor sign-off and the unified human decision timeline are tracked in #4 and #6.

An editor sends the current saved version and a reason to an active legal reviewer. The task retains the exact version and a read-only native copy of its title, body and notes. A second identical send reuses the task. A different recipient or reason receives a conflict. Legal can clear that copy or request changes with a note. The assigned reviewer and an admin can read the task. Ordinary accounts use the legal API to decide. There is no native write permission for ordinary users.

The task is the source of truth for legal status. A legal decision commits to one task row. The story screen reads the task for its current revision, so a later decision on an older copy cannot mark the current version cleared. The submission identity is unique for the lifetime of the revision. After a decision, a new legal request needs a newer saved version. Archive retains legal tasks and their copies.

The `x_2236136_suiko_ai.legal_review_enabled` property starts off. Enable the screen after successful installed checks. The screen displays legal readiness and does not add an editor sign-off action. No new legal roles are assigned to regular accounts by installation.

## Verify the installed app

- Use separate Editor, assigned legal-only, unassigned legal-only and outsider personas. Check both the API and the native assigned copy. Check the newer version still needs review after someone clears the old task.
- Route the new copy, exercise a change request with its note, save a new copy and clear it against its own task. Reopen the old decisions and confirm the exact version and actor. Restore an archived fixture and check that retained legal decisions still display.
- Enable the legal feature after the suite passes. Use the in-app browser to check the Editor route button when eligible reviewers exist and the assigned review page as a legal-only account.

## Next integration steps

BE-01 should use the latest saved revision and the same legal task lookup. Add the editor’s Request changes and Sign off actions with a guarded version and status check. Once a story has a legal task, sign-off requires a cleared legal task for the exact current revision. Keep editor outcomes separate from AI review results. BE-03 should return the existing task's request and decision in human history and add append-only editor outcomes with actor, time, version and note. Avoid copying a legal decision into a competing write path.

FE-01 can build title search and pagination against current versions and the archive filter. Use the shared workflow status once BE-01 is in place. When editor sign-off and history are integrated, run QA-01 from save through sign-off, including the old clearance case and direct permission checks.
