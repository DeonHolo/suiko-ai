import { GlideRecord, GlideDateTime, gs } from '@servicenow/glide';
import { RESTMessageV2 } from '@servicenow/glide/sn_ws';
import { WorkbenchError } from './workbench-error.ts';
import { listEditorialRules as rulesView, saveRuleDraft, approveSavedRule, setSavedRuleActive, starterTemplates, supportedChecks } from './editorial-rules.ts';
import * as validators from './generated/validators.js';
import { ReviewValidationError } from './generated/assessment-checks.js';
import { normalizeStoryInput, storySnapshot } from './generated/story-input.js';
import { approvedRulesForReview } from './generated/editorial-rules.js';
import { persistReviewAttempt } from './generated/review-attempt.js';
import reviewData from './generated/review-data.js';

const tables = {
  story: 'x_2236136_suiko_ai_story',
  revision: 'x_2236136_suiko_ai_revision',
  review: 'x_2236136_suiko_ai_review',
  config: 'x_2236136_suiko_ai_config',
};
const parse = (text: string) => text ? JSON.parse(text) : null;
const id = (record: GlideRecord) => String(record.getUniqueValue());
const now = () => new GlideDateTime().getValue();

function respond(response, action) {
  try {
    response.setBody(action());
  } catch (error) {
    response.setStatus(error instanceof WorkbenchError ? error.status : error instanceof ReviewValidationError ? 400 : 500);
    response.setBody({ message: error instanceof WorkbenchError || error instanceof ReviewValidationError
      ? error.message : 'The workbench could not finish this action. Your saved versions are available in history.',
      details: error instanceof WorkbenchError ? error.details : error instanceof ReviewValidationError ? error.issues : null });
  }
}

function record(table: string, sysId: string) {
  if (!/^[a-f0-9]{32}$/.test(String(sysId))) throw new WorkbenchError('Choose a saved record.');
  const row = new GlideRecord(table);
  if (!row.get(sysId)) throw new WorkbenchError('This saved record could not be found.', 404);
  return row;
}

function find(table: string, field: string, value: string) {
  const row = new GlideRecord(table);
  row.addQuery(field, value);
  row.setLimit(1);
  row.query();
  return row.next() ? row : null;
}

function latestRevision(storyId: string) {
  const row = new GlideRecord(tables.revision);
  row.addQuery('story', storyId);
  row.orderByDesc('version');
  row.setLimit(1);
  row.query();
  return row.next() ? row : null;
}

function revisionView(row: GlideRecord) {
  return {
    id: id(row), story_id: row.getValue('story'), version: Number(row.getValue('version')),
    title: row.getValue('title') || '', text: row.getValue('body') || '',
    notes: row.getValue('notes') || '', saved_at: row.getValue('sys_created_on'),
    content_format: row.getValue('content_format') || '', content_kind: row.getValue('content_kind') || '',
    source_urls: parse(row.getValue('source_urls_json')) || [],
  };
}

function runView(row: GlideRecord) {
  return {
    id: id(row), revision_id: row.getValue('revision'), state: row.getValue('state'),
    model: row.getValue('model'), request: parse(row.getValue('request_json')),
    result: parse(row.getValue('response_json')), error: parse(row.getValue('error_json')),
    metadata: parse(row.getValue('metadata_json')), modified: row.getValue('sys_mod_count'),
    saved_at: row.getValue('sys_created_on'),
  };
}

function providerConfig() {
  return find(tables.config, 'name', 'gemini');
}

export function getState(request, response) {
  respond(response, () => {
    const stories = [];
    const row = new GlideRecord(tables.story);
    row.orderByDesc('sys_updated_on');
    row.setLimit(50);
    row.query();
    while (row.next()) stories.push({ id: id(row), title: row.getValue('title') });
    const storyId = String(request.queryParams.story || '');
    const revisions = [];
    const runs = [];
    if (storyId) {
      record(tables.story, storyId);
      const revision = new GlideRecord(tables.revision);
      revision.addQuery('story', storyId);
      revision.orderByDesc('version');
      revision.setLimit(50);
      revision.query();
      while (revision.next()) revisions.push(revisionView(revision));
      const review = new GlideRecord(tables.review);
      review.addQuery('revision.story', storyId);
      review.orderByDesc('sys_created_on');
      review.setLimit(50);
      review.query();
      while (review.next()) runs.push(runView(review));
    }
    const config = providerConfig();
    return {
      stories, revisions, runs, rules: rulesView(), starter_templates: starterTemplates, supported_checks: supportedChecks, taxonomy: reviewData.taxonomy,
      capabilities: { source_reading: false },
      can_manage_rules: gs.hasRole('admin') || gs.hasRole('x_2236136_suiko_ai.rules_editor'),
      provider: { configured: !!config?.getValue('api_key'), model: config?.getValue('model') || 'gemini-3.5-flash-lite' },
    };
  });
}

export function saveRevision(request, response) {
  respond(response, () => {
    const input = request.body.data;
    if (!input || typeof input.request_key !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(input.request_key)) {
      throw new WorkbenchError('The save action needs a request identity.');
    }
    const existing = find(tables.revision, 'request_key', input.request_key);
    if (existing) return revisionView(existing);
    const normalized = normalizeStoryInput(input);
    const { title, text, notes, content_format, content_kind, source_urls } = normalized;
    let story;
    let latest = null;
    if (input.story_id) {
      story = record(tables.story, input.story_id);
      latest = latestRevision(id(story));
      if ((latest ? id(latest) : null) !== (input.expected_revision_id || null)) {
        throw new WorkbenchError('A newer version was saved. Reload the story before saving your edit.', 409);
      }
      if (latest && latest.getValue('title') === title && latest.getValue('body') === text
        && (latest.getValue('notes') || '') === notes
        && latest.getValue('content_format') === content_format && latest.getValue('content_kind') === content_kind
        && JSON.stringify(parse(latest.getValue('source_urls_json')) || []) === JSON.stringify(source_urls)) return revisionView(latest);
    } else {
      story = new GlideRecord(tables.story);
      story.initialize();
      story.setValue('title', title);
      if (!story.insert()) throw new WorkbenchError('The story could not be saved. Try again.', 500);
    }
    const version = latest ? Number(latest.getValue('version')) + 1 : 1;
    const revision = new GlideRecord(tables.revision);
    revision.initialize();
    revision.setValue('story', id(story));
    revision.setValue('version', version);
    revision.setValue('version_key', id(story) + ':' + version);
    revision.setValue('request_key', input.request_key);
    revision.setValue('title', title);
    revision.setValue('body', text);
    revision.setValue('notes', notes);
    revision.setValue('content_format', content_format);
    revision.setValue('content_kind', content_kind);
    revision.setValue('source_urls_json', JSON.stringify(source_urls));
    if (!revision.insert()) throw new WorkbenchError('This version was saved elsewhere. Reload the story.', 409);
    story.setValue('title', title);
    story.update();
    return revisionView(revision);
  });
}

function snapshot(revision: GlideRecord | null) {
  return storySnapshot(revision ? revisionView(revision) : null);
}

function buildRequest(revision: GlideRecord, requestId: string) {
  const previous = new GlideRecord(tables.revision);
  previous.addQuery('story', revision.getValue('story'));
  previous.addQuery('version', Number(revision.getValue('version')) - 1);
  previous.setLimit(1);
  previous.query();
  const baseline = previous.next() ? previous : null;
  const candidate = snapshot(revision);
  const earlier = snapshot(baseline);
  if (!candidate.content_format || !candidate.content_kind) throw new WorkbenchError('Choose the format and content kind, then save a new version before using approved rules. Earlier reviews remain available.');
  const allRules = rulesView();
  const rules = allRules.filter(rule => rule.active);
  const input = {
    schema_version: '0.4.0', capabilities: { source_reading: false, rights_verification: false },
    request_id: requestId, content_id: revision.getValue('story'), language: 'en',
    baseline_revision: earlier, candidate_revision: candidate,
    policy_pack: {
      pack_id: 'suiko-editorial-rules',
      version: rules.map(rule => String(rule.approved.version)).join('.') || '0',
      approval_reference: 'Saved editor approvals; exact versions recorded with this attempt',
      rules: approvedRulesForReview(allRules),
    },
    taxonomy: reviewData.taxonomy,
    current_metadata: { section_id: null, tag_ids: [], short_description: '' },
  };
  if (!validators.validateRequest(input)) throw new WorkbenchError('The saved draft or active rules could not be prepared for review.', 400, validators.validateRequest.errors);
  return {
    input, rules: rules.map(rule => ({
      id: rule.id, rule_id: rule.rule_id, title: rule.approved.definition.title, origin: rule.approved.definition.origin, active: true,
      version: rule.approved.version, version_id: rule.approved.version_id, approval: rule.approved.approval,
    })),
    revision_records: { [candidate.revision_id]: id(revision), ...(baseline ? { [earlier.revision_id]: id(baseline) } : {}) },
    sources: revisionView(revision).source_urls.map(url => ({ url, status: 'not_read' })),
  };
}

export function runReview(request, response) {
  respond(response, () => {
    const body = request.body.data;
    if (!body || typeof body.request_key !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(body.request_key)) {
      throw new WorkbenchError('The review action needs a request identity.');
    }
    const duplicate = find(tables.review, 'request_key', body.request_key);
    if (duplicate) return runView(duplicate);
    const revision = record(tables.revision, body.revision_id);
    const config = providerConfig();
    const key = config?.getElement('api_key').getDecryptedValue();
    if (!key) throw new WorkbenchError('Gemini needs its server configuration before you can run a review.', 503);
    const model = config.getValue('model');
    const prepared = buildRequest(revision, body.request_key);
    prepared['provider'] = { requested_model: model, prompt_version: reviewData.promptVersion };
    if (JSON.stringify(prepared).length > 190000) throw new WorkbenchError('The saved review input is too large. Shorten the active instructions or context before trying again.');
    const running = find(tables.review, 'active_revision', id(revision));
    if (running) {
      const started = Number(new GlideDateTime(running.getValue('sys_created_on')).getNumericValue());
      if (running.getValue('state') === 'running' && Date.now() - started < 300000) {
        throw new WorkbenchError('This saved version already has a review running. Refresh to see its result.', 409);
      }
      if (running.getValue('state') === 'running') {
        running.setValue('state', 'failed');
        running.setValue('error_json', JSON.stringify({ message: 'The earlier review was interrupted. You can retry.' }));
      }
      running.setValue('active_revision', '');
      running.update();
    }
    const run = new GlideRecord(tables.review);
    run.initialize();
    run.setValue('revision', id(revision));
    run.setValue('request_key', body.request_key);
    run.setValue('active_revision', id(revision));
    run.setValue('state', 'running');
    run.setValue('model', model);
    run.setValue('request_json', JSON.stringify(prepared));
    const runId = run.insert();
    if (!runId) throw new WorkbenchError('Another review started for this version. Refresh to see it.', 409);
    if (!run.get(String(runId))) throw new WorkbenchError('The review attempt could not be reopened. Refresh the story before retrying.', 500);
    persistReviewAttempt(run, prepared.input, () => {
      const message = new RESTMessageV2();
      message.setEndpoint('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent');
      message.setHttpMethod('POST');
      message.setHttpTimeout(40000);
      message.setRequestHeader('Content-Type', 'application/json');
      message.setRequestHeader('x-goog-api-key', key);
      message.setRequestBody(JSON.stringify({
        systemInstruction: { parts: [{ text: reviewData.prompt }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(prepared.input) }] }],
        generationConfig: {
          responseMimeType: 'application/json', responseJsonSchema: reviewData.providerSchema,
          maxOutputTokens: 8192, thinkingConfig: { thinkingLevel: 'MINIMAL' },
        },
      }));
      let providerResponse = message.execute();
      let modelUsed = model;
      if (providerResponse.getStatusCode() === 503 && model === 'gemini-3.5-flash-lite') {
        modelUsed = 'gemini-3.1-flash-lite';
        prepared['provider'] = {
          requested_model: model, prompt_version: reviewData.promptVersion,
          fallback_model: modelUsed, fallback_reason: 'Gemini 3.5 returned HTTP 503.',
        };
        run.setValue('request_json', JSON.stringify(prepared));
        run.setValue('model', modelUsed);
        message.setEndpoint('https://generativelanguage.googleapis.com/v1beta/models/' + modelUsed + ':generateContent');
        providerResponse = message.execute();
      }
      const status = providerResponse.getStatusCode();
      if (status !== 200) {
        throw new WorkbenchError(status === 503 ? 'Gemini is busy. Your draft is saved and you can retry.'
          : 'Gemini could not complete this review (HTTP ' + status + '). Your draft is saved.', 502);
      }
      const payload = JSON.parse(providerResponse.getBody());
      const candidate = payload.candidates?.[0];
      if (candidate?.finishReason !== 'STOP') throw new WorkbenchError('Gemini stopped before finishing this review. You can retry.', 422);
      const raw = candidate.content.parts.filter(part => !part.thought && typeof part.text === 'string')
        .map(part => part.text).join('');
      run.setValue('model', payload.modelVersion || modelUsed);
      return raw;
    }, validators);
    return runView(run);
  });
}

export function saveMetadata(request, response) {
  respond(response, () => {
    const input = request.body.data;
    const run = record(tables.review, input.review_id);
    if (run.getValue('state') !== 'complete') throw new WorkbenchError('Choose a completed review before saving metadata.');
    const revision = record(tables.revision, run.getValue('revision'));
    if (id(latestRevision(revision.getValue('story'))) !== id(revision)) {
      throw new WorkbenchError('A newer draft exists. Open that version before saving metadata.', 409);
    }
    const choice = input.metadata;
    if (!choice || typeof choice.section !== 'string' || choice.section.length > 160
      || typeof choice.description !== 'string' || choice.description.length > 240
      || !Array.isArray(choice.tags) || choice.tags.length > 5
      || choice.tags.some(tag => typeof tag !== 'string' || tag.length > 80)) {
      throw new WorkbenchError('Use a short section, up to five tags, and a description of at most 240 characters.');
    }
    const saved = { ...choice, by: gs.getUserID(), at: now() };
    const update = new GlideRecord(tables.review);
    update.addQuery('sys_id', id(run));
    update.addQuery('sys_mod_count', String(input.expected_modified));
    update.setValue('metadata_json', JSON.stringify(saved));
    update.updateMultiple();
    const refreshed = record(tables.review, id(run));
    if (refreshed.getValue('metadata_json') !== JSON.stringify(saved)) {
      throw new WorkbenchError('Someone updated this review. Refresh before saving your metadata choice.', 409);
    }
    return runView(refreshed);
  });
}

export function saveRule(request, response) {
  respond(response, () => saveRuleDraft(request.body.data));
}

export function approveRule(request, response) {
  respond(response, () => approveSavedRule(request.body.data));
}

export function setRuleActive(request, response) {
  respond(response, () => setSavedRuleActive(request.body.data));
}

export function configureProvider(request, response) {
  respond(response, () => {
    if (!gs.hasRole('admin')) throw new WorkbenchError('An administrator configures the provider.', 403);
    const input = request.body.data;
    if (!input || typeof input !== 'object' || (input.api_key !== undefined && typeof input.api_key !== 'string')) {
      throw new WorkbenchError('Supply the provider settings as a JSON object.');
    }
    const model = input?.model || 'gemini-3.5-flash-lite';
    if (!['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].includes(model)) {
      throw new WorkbenchError('Choose a supported Gemini model.');
    }
    let config = providerConfig();
    if (!config) {
      config = new GlideRecord(tables.config);
      config.initialize();
      config.setValue('name', 'gemini');
    }
    if (input.api_key) config.getElement('api_key').setDisplayValue(String(input.api_key));
    config.setValue('model', model);
    const saved = config.isNewRecord() ? config.insert() : config.update();
    if (!saved) throw new WorkbenchError('The provider configuration could not be saved.', 500);
    return { configured: !!config.getValue('api_key'), model };
  });
}
