# AI-15 · Push and check the shared ServiceNow app

**Status** in-progress · local push verified, manual GitHub deployment pending  
**Owner** Deon with the integration teammates  
**Depends on** AI-03

## What to build

Use the same local source, app ID, and record identities for each update to the PDI. Run the quote checks, build the app, install its package, and check the page and API with one command.

## Completion checks

- [x] Pin the SDK and package dependencies, retain the generated record identities, and authenticate the local SDK profile.
- [x] Run the local push sequence and verify the same app ID after an update.
- [x] Check that saved drafts, reviews, the encrypted provider configuration, and an editor's changed rule persist across app updates.
- [x] Prepare GitHub checks for pull requests and relevant pushes to main, with manual deployment from main.
- [ ] Configure the two PDI deployment secrets in the team repository.
- [ ] Run a manual GitHub deployment and retain the result link.

## Evidence

The app and API were installed and checked on 12 November 2026 using SDK 4.14.0. The single push passed all 23 tests and its page and API checks. The outside-media rule remained version 2 after the update and after provider setup ran again. Earlier river reviews retained version 1 snapshots. The saved metadata choice and two river versions also survived. The workflow YAML parses locally, and the SDK build passed with `--frozenKeys`.

The local preview is verified at `http://127.0.0.1:13542`. Saved PDI inputs, results, and rule snapshots are in the ignored review evidence file (local file `ai-review/output/pdi-review-evidence-2026-11-12.json`). River screenshot (local file `ai-review/output/pdi-river-review.jpg`) · Library screenshot (local file `ai-review/output/pdi-library-review.jpg`)

[Development and pipeline guide](../../../docs/13-servicenow-development-and-cicd.md) · [Build plan](../../../PLAN.md)
