# Local Gemini key setup

Use these steps for the local Gemini harness. The live ServiceNow app has its own provider configuration. [ServiceNow project](../servicenow-app/README.md#configure-gemini)

## Enter the key

1. Copy [the blank template](../ai-review/.env.example) to `ai-review/.env.local` if you need a local copy.
2. Paste the key immediately after `GEMINI_API_KEY=` and save.
3. Keep `GEMINI_MODEL=gemini-3.5-flash-lite` for the planned first pilot.
4. Run `npm --prefix ai-review run check:gemini` from the project folder, or ask the assistant to run the check after saving.

The file was created with an empty key field. An existing local file is preserved instead of overwritten. The root `.gitignore` covers it; [.env.example](../ai-review/.env.example) is the shareable blank template. No system-wide environment setting was changed.

## What the check means

“Configured” means a non-empty key is available to that process. The check does not reveal any part of the value, verify authentication, spend model tokens, or contact Gemini. It also avoids echoing an invalid model-field value. Missing configuration returns a non-success exit code so a later runner can stop before attempting model work.

Node's `--env-file` loads values for the command. Existing process environment variables take precedence; file changes take effect on the next command run. [Node CLI environment-file documentation](https://github.com/nodejs/node/blob/v24.22.2/doc/api/cli.md#--env-filefile)

The check uses the file when started through the package command; merely creating a file does not configure other programs or the ServiceNow PDI. A later live runner must explicitly use the same loading mechanism.

On 11 November 2026, the local check found the key and Gemini returned model details. On 12 November, `gemini-3.5-flash-lite` generated a valid review of the two fictional library drafts. [Gemini model lookup](https://aistudio.google.com/api-reference/models/get-model) · [Trial notes](../.scratch/ai-review/issues/06-local-gemini-pilot.md)

Use the [local review commands](../ai-review/README.md) to run the fictional fixtures after the configuration check passes.
