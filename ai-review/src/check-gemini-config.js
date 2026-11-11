const keyConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
const defaultModel = 'gemini-3.5-flash-lite';
const model = process.env.GEMINI_MODEL?.trim() || defaultModel;
const modelValid = /^gemini-[a-z0-9][a-z0-9.-]*$/.test(model);

process.stdout.write(`Gemini key: ${keyConfigured ? 'configured (value hidden)' : 'not configured'}\n`);
process.stdout.write(`Gemini model: ${modelValid ? (model === defaultModel ? defaultModel : 'custom model configured') : 'invalid model identifier'}\n`);
process.stdout.write('Configuration check only; no API request was made.\n');
if (!keyConfigured) process.stdout.write('Add the key to GEMINI_API_KEY in ai-review/.env.local.\n');
if (!modelValid) process.stdout.write('Set GEMINI_MODEL to a Gemini model identifier.\n');
process.exitCode = keyConfigured && modelValid ? 0 : 1;
