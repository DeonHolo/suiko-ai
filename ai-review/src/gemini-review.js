import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { reviewArticle, ReviewValidationError } from './review.js';

const root = new URL('../../', import.meta.url);
const models = new Set(['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']);

export async function createGeminiReviewer(modelOverride) {
  const promptPath = 'prompts/editorial-review-v0.4.md';
  const [promptFile, schemaText, envText] = await Promise.all(
    [promptPath, 'contracts/ai-assessment.schema.json', 'ai-review/.env.local']
      .map(path => readFile(new URL(path, root), 'utf8')),
  );
  const prompt = promptFile.match(/^## System instruction\r?\n([\s\S]+?)^## Adapter notes/m)?.[1].trim();
  const config = parseEnv(envText);
  const key = config.GEMINI_API_KEY?.trim();
  const configuredModel = config.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  const model = modelOverride || configuredModel;
  if (!key || !prompt || !models.has(model)) {
    throw new Error('The test needs a local key, the review prompt, and a supported model.');
  }

  const localOnly = new Set(['$schema', 'minLength', 'maxLength', 'minItems', 'maxItems', 'uniqueItems']);
  const schema = JSON.parse(schemaText, (name, value) => localOnly.has(name) ? undefined : value);
  const fieldOrder = ['status', 'coverage', 'policy_assessments', 'changes', 'metadata_suggestions', 'limitations'];
  schema.properties = Object.fromEntries(fieldOrder.map(field => [field, schema.properties[field]]));
  schema.required = fieldOrder;
  schema.properties.changes.items.properties.summary.description = 'State the before and after facts. If attribution to a named source was removed, identify that source and explicitly state the removal here.';
  const description = schema.properties.metadata_suggestions.properties.short_description.properties;
  description.suggested_text.description = 'A short description from candidate passages not cited for potential_conflict. Omit flagged claims and figures.';
  description.evidence.description = 'Cite eligible candidate passages only. Exclude any segment cited for potential_conflict.';

  async function review(request) {
    const sha256 = text => createHash('sha256').update(text).digest('hex');
    const redact = text => text.replaceAll(key, '[redacted]');
    const record = {
      model,
      started_at: new Date().toISOString(),
      request: {
        request_id: request.request_id,
        payload_sha256: sha256(JSON.stringify(request)),
        baseline: request.baseline_revision?.revision_id ?? null,
        candidate: request.candidate_revision.revision_id,
      },
      prompt: { file: promptPath, version: '0.4', sha256: sha256(prompt) },
      contract_version: request.schema_version,
      settings: { max_output_tokens: 8192, thinking_level: 'MINIMAL', provider_field_order: fieldOrder },
    };

    const provider = {
      async generate(snapshot) {
        const started = performance.now();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
          redirect: 'error',
          signal: AbortSignal.timeout(40000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: prompt }] },
            contents: [{ role: 'user', parts: [{ text: JSON.stringify(snapshot) }] }],
            generationConfig: {
              maxOutputTokens: record.settings.max_output_tokens,
              thinkingConfig: { thinkingLevel: record.settings.thinking_level },
              responseMimeType: 'application/json',
              responseJsonSchema: schema,
            },
          }),
        });
        record.http_status = response.status;
        const payload = await response.json();
        record.request_duration_ms = Math.round(performance.now() - started);
        if (!response.ok) {
          const detail = typeof payload.error?.message === 'string' ? redact(payload.error.message).slice(0, 700) : '';
          throw new Error(`Gemini HTTP ${response.status}${detail ? `. ${detail}` : ''}`);
        }

        const candidate = payload.candidates?.[0];
        const usage = payload.usageMetadata;
        record.model_version = payload.modelVersion ?? null;
        record.finish_reason = candidate?.finishReason ?? payload.promptFeedback?.blockReason ?? null;
        record.token_usage = {
          input: usage?.promptTokenCount ?? null,
          output: usage?.candidatesTokenCount ?? null,
          thinking: usage?.thoughtsTokenCount ?? null,
          total: usage?.totalTokenCount ?? null,
        };
        const raw = candidate?.content?.parts
          ?.filter(part => part.thought !== true && typeof part.text === 'string')
          .map(part => part.text)
          .join('');
        if (raw) {
          try {
            record.model_response = JSON.parse(redact(raw));
          } catch {
            record.model_response_text = redact(raw);
          }
        }
        if (candidate?.finishReason !== 'STOP' || !raw?.trim()) {
          throw new Error(`Gemini ended without a complete assessment (${record.finish_reason ?? 'no finish reason'}).`);
        }
        return raw;
      },
    };

    try {
      const assessment = await reviewArticle(request, provider);
      record.validation = {
        passed: true, assessment_status: assessment.status,
        coverage: assessment.coverage, limitations: assessment.limitations,
      };
    } catch (error) {
      record.validation = error instanceof ReviewValidationError
        ? { passed: false, code: error.code, message: error.message, issues: error.issues }
        : { passed: false, message: error instanceof Error ? redact(error.message) : 'The request did not complete.' };
    }
    return record;
  }

  return { model, review };
}
