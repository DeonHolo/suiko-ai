# Local AI review foundation

This package runs the offline tests and local Gemini experiments. The live ServiceNow app shares the schemas, prompt, and quote checks. [ServiceNow project](../servicenow-app/README.md)

The module's public interface is `reviewArticle(request, provider)`. The caller supplies the agreed frozen request and an adapter with `generate(request)` returning raw assessment JSON. The module returns a validated assessment or a structured validation error. It does not edit records or make publishing decisions.

Offline tests check the structure, quotes, rule IDs, and allowed labels with a fixed response. The local pilot runner sends a fictional case to Gemini and uses the same validator. The pilot notes also check the meaning of each result against the drafts.

## Add your Gemini key

Copy [.env.example](.env.example) to `.env.local` in this folder. Paste your API key after `GEMINI_API_KEY=` and save. Git ignores the local copy. The shared PDI has its own provider configuration.

From the workspace root, check configuration with:

```powershell
npm --prefix ai-review run check:gemini
```

The check loads the local file and reports only whether a key is present. It never prints the key or makes an API request; it does not prove that the key is valid or has model quota. Existing process environment variables take precedence over file values, following Node's normal `--env-file` behavior.

The local runner reads this key for live requests. [Trial notes](../.scratch/ai-review/issues/06-local-gemini-pilot.md) · [Local setup guide](../docs/11-local-gemini-setup.md)

JavaScript on Node is the local harness choice because Node is already available and it fits later SDK tooling. This does not establish that its Node-specific dependencies execute on ServiceNow; the final runtime remains a backend integration decision.

## Try it

Run these commands from the project folder.

```powershell
npm --prefix ai-review run demo
npm --prefix ai-review test
```

To save a readable result in this module's output folder:

```powershell
npm --prefix ai-review run demo -- --save
```

The generated demo report (local file `ai-review/output/demo-review.md`) is labeled **fixed example response**. It is not AI-generated evidence or a ServiceNow review record. From the workspace root, `node ai-review/src/demo.js --json` produces the JSON form; `--json --save` also saves the readable report.

On another machine, restore the pinned dependencies from the workspace root with `npm --prefix ai-review ci` first. Node 24 or later is required; the current checks ran on Node `v24.14.1`.

To send one live test using the current prompt, run one of these from the project folder. Each saves its result in `ai-review/output/`, including a provider error or a response the validator rejects.

```powershell
node ai-review/src/run-pilot.js library gemini-3.5-flash-lite
node ai-review/src/run-pilot.js river-video gemini-3.1-flash-lite
node ai-review/src/run-pilot.js sponsored-caption gemini-3.5-flash-lite
```

The progress page shows the saved runs from this test session. Progress page (local file `ai-review/output/library-review-progress.html`) · [Media case expectations](fixtures/README.md)

## Live draft review

Run `node ai-review/src/workbench-server.js` and open the local address it prints. The first river script is loaded in the text box. You can replace it with your own script. **Review** saves Version 1 and asks Gemini to check it. **Load revised script** fills the example edits. The next **Review** saves Version 2 and sends both saved versions for comparison. Reviewing the same text again keeps its version number.

Use **New story** when the text belongs to a different piece. Choose **Video script** or **News article** under **Review checklist**. Each reply records the exact rules that were used. These are sample checklists, and the team's approved policies should be saved as editable records in ServiceNow.

Open each reply under **AI reviews**. Accepted replies start with an overview. If a quote fails validation, the page shows the quote and the saved line beside it. The app saves the draft text, exact review input, and result to the session file printed at startup under `ai-review/output/river-live/`. To reopen that session, pass `--session <folder-id>` to the same command. The page uses Gemini 3.1 Flash-Lite by default.

## What is implemented

- Request/assessment schemas, bounded strict provider JSON parsing, and duplicate-key rejection.
- Complete checklist identity checks, exact quotations, and correct baseline/candidate evidence roles.
- Required evidence for asserted concerns, no-concern observations, and populated metadata.
- Allowed section/tag identities and change-packet consistency.
- Frozen input snapshots and explicit first-draft/unresolved-coverage handling.
- Required analysis-area coverage, baseline consistency, and conservative handling of provider-declared limitations.

Unsupported output is rejected as a whole in this first slice. Selective salvage of independently valid observations is not implemented. The 256 KiB raw response cap is a local harness limit. Request objects must already be canonical JSON data supplied by an authorized caller; syntactic policy approval references do not establish actual approval or access rights.

The result contains only assessment content. Run records, provider provenance, human decisions, currentness relative to later application edits, persistence, and retries belong to the future backend adapter.

## Limits

The fixed adapter does not generate comparisons, infer policy conflicts, or suggest metadata: it returns the existing handcrafted example so the validation path can be exercised. True newsroom comparison/metadata behavior is AI-05; live Gemini is AI-06; PDI transport is AI-07/AI-09. Semantic relevance, conditional applicability, unsupported factual claims, and legal/editorial wording still need model evaluation. An exact quote match alone does not prove a sound interpretation.

Validation errors expose `name`, `code`, `message`, and `issues`. Codes include `INVALID_REQUEST`, `INVALID_PROVIDER_JSON`, `INVALID_ASSESSMENT`, `CHECKLIST_MISMATCH`, `INVALID_CHANGES`, `INVALID_METADATA`, `INVALID_EVIDENCE`, and `INVALID_COVERAGE`. Provider exceptions are propagated without an automatic retry; the eventual backend adapter must classify uncertain execution appropriately.

Dependencies use [Ajv's JSON Schema validator](https://ajv.js.org/json-schema.html) and [Microsoft's JSON parser visitor](https://github.com/microsoft/node-jsonc-parser), with [Node's test runner](https://nodejs.org/docs/latest-v24.x/api/test.html). Versions are pinned in the package lock.

See [the plan](../PLAN.md), [the specification](../docs/03-ai-review-specification.md), and [the draft contracts](../contracts/README.md).
