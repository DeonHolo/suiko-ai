import { GlideRecord, GlideRecordSecure, GlideDateTime, gs } from '@servicenow/glide';
import { RESTMessageV2 } from '@servicenow/glide/sn_ws';
import { WorkbenchError } from './workbench-error.ts';
import { listStories } from './story-inbox.ts';
import {
  appendEditorDecision, editorActions, guardedStoryUpdate, hasEditorDecision, latestRevision, legalTaskForRevision,
  needsLegalClearance, readableRecord, requireEditor, workflowHistory, workflowStatus,
} from './story-workflow.ts';
import { listEditorialRules as rulesView, saveRuleDraft, approveSavedRule, setSavedRuleActive, starterTemplates, supportedChecks } from './editorial-rules.ts';
import { policyState, readPolicyVersion, savePolicyVersion } from './policy-records.ts';
import { requireRulesEditor } from './rule-access.ts';
import { assertRevisionNotArchived, assertStoryNotArchived, canArchiveStories } from './archive.ts';
import { checkPolicySuggestions, policyProposalPrompt, policyProposalSchema } from './generated/policy-proposals.js';
import { sourceRuleIds, sourceMaterial } from './generated/source-reader.js';
import { readSavedSources } from './read-sources.ts';
import { literalChanges } from './generated/revision-diff.js';
import * as validators from './generated/validators.js';
import { ReviewValidationError } from './generated/assessment-checks.js';
import { normalizeStoryInput, storySnapshot } from './generated/story-input.js';
import { approvedRulesForReview, reviewRulesCurrent } from './generated/editorial-rules.js';
import { persistReviewAttempt } from './generated/review-attempt.js';
import reviewData from './generated/review-data.js';

const tables = {
  story: 'x_2236136_suiko_ai_story',
  revision: 'x_2236136_suiko_ai_revision',
  review: 'x_2236136_suiko_ai_review',
  config: 'x_2236136_suiko_ai_config',
  legalTask: 'x_2236136_suiko_ai_legal_task',
};
const roles = {
  legalReviewer: 'x_2236136_suiko_ai.legal_reviewer',
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

function requireLegalReviewer() {
  if (!gs.hasRole('admin') && !gs.hasRole(roles.legalReviewer)) {
    throw new WorkbenchError('This legal review is not available to your account.', 403);
  }
}

function userDisplayName(userId: string) {
  const user = new GlideRecord('sys_user');
  return user.get(userId) ? user.getValue('name') || user.getValue('user_name') : '';
}

function legalReviewers() {
  const users = [];
  const seen = new Set<string>();
  const assignments = new GlideRecord('sys_user_has_role');
  assignments.addQuery('role.name', roles.legalReviewer);
  assignments.query();
  while (assignments.next()) {
    const userId = assignments.getValue('user');
    if (seen.has(userId)) continue;
    const user = new GlideRecord('sys_user');
    if (user.get(userId) && user.getValue('active') === '1') {
      seen.add(userId);
      users.push({ id: userId, name: user.getValue('name') || user.getValue('user_name') });
    }
  }
  return users;
}

function legalReviewerExists(userId: string) {
  const user = new GlideRecord('sys_user');
  if (!user.get(userId) || user.getValue('active') !== '1') return false;
  const assignment = new GlideRecord('sys_user_has_role');
  assignment.addQuery('role.name', roles.legalReviewer);
  assignment.addQuery('user', userId);
  assignment.setLimit(1);
  assignment.query();
  return assignment.next();
}

function storyArchived(story: GlideRecord) {
  return story.isValidField('archived') && story.getValue('archived') === '1';
}

function requireActiveStory(story: GlideRecord) {
  if (storyArchived(story)) throw new WorkbenchError('Restore this story from Archive before taking a legal action.', 409);
}

function canDecideTask(task: GlideRecord, story: GlideRecord) {
  return task.getValue('status') === 'pending' && !storyArchived(story);
}

function workflowView(story: GlideRecord, revision: GlideRecord | null) {
  const revisionId = revision ? id(revision) : '';
  const task = revision ? legalTaskForRevision(revisionId) : null;
  const legalStatus = task?.getValue('status');
  const reviewers = legalReviewers();
  const status = workflowStatus(story, revisionId, legalStatus);
  const actions = revision && !storyArchived(story)
    ? editorActions(status, needsLegalClearance(story), legalStatus === 'cleared') : [];
  if (revision && !task && status !== 'signed_off' && reviewers.length && !storyArchived(story)) {
    actions.push('send_to_legal');
  }
  return {
    status,
    modified: String(story.getValue('sys_mod_count')),
    current_revision_id: revisionId,
    actions,
    reviewers,
    history: workflowHistory(story, userDisplayName),
  };
}

function legalTaskView(row: GlideRecord) {
  const revision = record(tables.revision, row.getValue('revision'));
  const story = record(tables.story, row.getValue('story'));
  const status = row.getValue('status');
  const assigned = row.getValue('assigned_reviewer') === String(gs.getUserID());
  const canDecide = (assigned || gs.hasRole('admin')) && canDecideTask(row, story);
  return {
    id: id(row),
    title: revision.getValue('title') || '',
    modified: row.getValue('sys_mod_count'),
    status,
    reason: row.getValue('reason') || '',
    requested_by: userDisplayName(row.getValue('requested_by')),
    requested_at: row.getValue('requested_at'),
    revision: revisionView(revision),
    actions: canDecide ? ['clear', 'request_changes'] : [],
    ...(status !== 'pending' ? {
      decision: {
        note: row.getValue('decision_note') || '',
        actor: userDisplayName(row.getValue('decision_by')),
        decided_at: row.getValue('decided_at'),
      },
    } : {}),
  };
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

function runView(row: GlideRecord, rules = rulesView()) {
  const request = parse(row.getValue('request_json'));
  const sources = parse(row.getValue('source_evidence_json'));
  if (request && sources) {
    request.sources = sources;
    if (request.input.schema_version === '0.5.0') request.input.source_material = sourceMaterial(sources);
  }
  const edits = parse(row.getValue('revision_diff_json'));
  if (request && edits) request.literal_edits = edits;
  return {
    id: id(row), revision_id: row.getValue('revision'), state: row.getValue('state'),
    model: row.getValue('model'), request,
    rules_current: reviewRulesCurrent(request?.rules, rules),
    result: parse(row.getValue('response_json')), error: parse(row.getValue('error_json')),
    metadata: parse(row.getValue('metadata_json')), modified: row.getValue('sys_mod_count'),
    saved_at: row.getValue('sys_created_on'),
  };
}

function providerConfig() {
  return find(tables.config, 'name', 'gemini');
}

const geminiEndpoint = model => 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';

function geminiMessage(key, model, prompt, input, schema) {
  const message = new RESTMessageV2();
  message.setEndpoint(geminiEndpoint(model));
  message.setHttpMethod('POST');
  message.setHttpTimeout(40000);
  message.setRequestHeader('Content-Type', 'application/json');
  message.setRequestHeader('x-goog-api-key', key);
  message.setRequestBody(JSON.stringify({
    systemInstruction: { parts: [{ text: prompt }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(input) }] }],
    generationConfig: {
      responseMimeType: 'application/json', responseJsonSchema: schema,
      maxOutputTokens: 8192, thinkingConfig: { thinkingLevel: 'MINIMAL' },
    },
  }));
  return message;
}

function geminiReply(response, model, task, savedMessage) {
  const status = response.getStatusCode();
  if (status !== 200) {
    throw new WorkbenchError(status === 503 ? 'Gemini is busy. ' + savedMessage
      : 'Gemini could not ' + task + ' (HTTP ' + status + '). ' + savedMessage, 502);
  }
  const payload = JSON.parse(response.getBody());
  const candidate = payload.candidates?.[0];
  if (candidate?.finishReason !== 'STOP' || !Array.isArray(candidate.content?.parts)) {
    throw new WorkbenchError('Gemini stopped before finishing. ' + savedMessage, 422);
  }
  const raw = candidate.content.parts.filter(part => !part.thought && typeof part.text === 'string')
    .map(part => part.text).join('');
  return { raw, model: payload.modelVersion || model };
}

export function executeGemini(message, model, task, savedMessage, onFallback = null) {
  const response = message.execute();
  if (response.getStatusCode() !== 503 || model !== 'gemini-3.5-flash-lite') return geminiReply(response, model, task, savedMessage);
  const fallback = 'gemini-3.1-flash-lite';
  onFallback?.(fallback);
  message.setEndpoint(geminiEndpoint(fallback));
  return { ...geminiReply(message.execute(), fallback, task, savedMessage), fallback_model: fallback };
}

const legalReviewEnabled = () => gs.getProperty('x_2236136_suiko_ai.legal_review_enabled', 'false') === 'true';

const workflowEnabled = () => gs.getProperty('x_2236136_suiko_ai.workflow_enabled', 'false') === 'true';
const inboxEnabled = () => gs.getProperty('x_2236136_suiko_ai.inbox_enabled', 'false') === 'true';

export function getStories(request, response) {
  respond(response, () => listStories(request.queryParams));
}

export function getState(request, response) {
  return readState(request, response, legalReviewEnabled() || workflowEnabled());
}

export function readStateForLegalTest(request, response) {
  return readState(request, response, true);
}

function readState(request, response, includeWorkflow) {
  respond(response, () => {
    requireEditor();
    const rules = rulesView();
    const stories = [];
    const row = new GlideRecordSecure(tables.story);
    row.addQuery('archived', false).addOrCondition('archived', 'ISEMPTY', '');
    row.orderByDesc('sys_updated_on');
    row.setLimit(50);
    row.query();
    while (row.next()) stories.push({ id: id(row), title: row.getValue('title'), updated_at: row.getValue('sys_updated_on') });
    const storyId = String(request.queryParams.story || '');
    let story = null;
    let parent = null;
    const revisions = [];
    const runs = [];
    if (storyId) {
      parent = readableRecord(tables.story, storyId);
      story = { id: id(parent), title: parent.getValue('title'), modified: parent.getValue('sys_mod_count'),
        archived: parent.getValue('archived') === '1', can_archive: canArchiveStories() };
      const revision = new GlideRecordSecure(tables.revision);
      revision.addQuery('story', storyId);
      revision.orderByDesc('version');
      revision.setLimit(50);
      revision.query();
      while (revision.next()) revisions.push(revisionView(revision));
      const review = new GlideRecordSecure(tables.review);
      review.addQuery('revision.story', storyId);
      review.orderByDesc('sys_created_on');
      review.setLimit(50);
      review.query();
      while (review.next()) runs.push(runView(review, rules));
    }
    const config = providerConfig();
    const workflow = includeWorkflow && story
      ? workflowView(parent, latestRevision(story.id))
      : null;
    return {
      stories, story, workflow,
      revisions, runs, rules, starter_templates: starterTemplates, supported_checks: supportedChecks, taxonomy: reviewData.taxonomy,
      viewer_id: String(gs.getUserID()),
      capabilities: {
        source_reading: true,
        archive: gs.getProperty('x_2236136_suiko_ai.archive_enabled', 'false') === 'true',
        legal_review: legalReviewEnabled(),
        inbox: inboxEnabled(),
        workflow: workflowEnabled(),
      },
      can_manage_rules: gs.hasRole('admin') || gs.hasRole('x_2236136_suiko_ai.rules_editor'),
      provider: { configured: !!config?.getValue('api_key'), model: config?.getValue('model') || 'gemini-3.5-flash-lite' },
    };
  });
}

export function saveRevision(request, response) {
  respond(response, () => {
    requireEditor();
    const input = request.body.data;
    if (!input || typeof input.request_key !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(input.request_key)) {
      throw new WorkbenchError('The save action needs a request identity.');
    }
    const existing = find(tables.revision, 'request_key', input.request_key);
    if (existing) {
      const parent = readableRecord(tables.story, existing.getValue('story'));
      const latest = latestRevision(id(parent));
      if (!storyArchived(parent) && latest && id(latest) === id(existing)) publishRevision(id(parent), latest);
      return revisionView(readableRecord(tables.revision, id(existing)));
    }
    const normalized = normalizeStoryInput(input);
    const { title, text, notes, content_format, content_kind, source_urls } = normalized;
    let story;
    let latest = null;
    if (input.story_id) {
      story = readableRecord(tables.story, input.story_id);
      assertStoryNotArchived(story);
      latest = latestRevision(id(story));
      if ((latest ? id(latest) : null) !== (input.expected_revision_id || null)) {
        throw new WorkbenchError('A newer version was saved. Reload the story before saving your edit.', 409);
      }
      if (latest && latest.getValue('title') === title && latest.getValue('body') === text
        && (latest.getValue('notes') || '') === notes
        && latest.getValue('content_format') === content_format && latest.getValue('content_kind') === content_kind
        && JSON.stringify(parse(latest.getValue('source_urls_json')) || []) === JSON.stringify(source_urls)) {
        publishRevision(id(story), latest);
        return revisionView(latest);
      }
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
    publishRevision(id(story), revision);
    return revisionView(revision);
  });
}


function publishRevision(storyId: string, revision: GlideRecord) {
  // A retry repairs an interrupted publish. Competing changes cannot move
  // the pointer back to an older version or reset an already published one.
  for (let attempt = 0; attempt < 3; attempt++) {
    const story = readableRecord(tables.story, storyId);
    if (story.getValue('current_revision') === id(revision)) return;
    const latest = latestRevision(storyId);
    if (!latest || id(latest) !== id(revision)) return;
    assertStoryNotArchived(story);
    const task = legalTaskForRevision(id(revision));
    if (guardedStoryUpdate(story, {
      title: revision.getValue('title'),
      current_revision: id(revision),
      workflow_status: workflowStatus(story, id(revision), task?.getValue('status')),
    })) return;
  }
  throw new WorkbenchError('The version was recorded. Retry the save to refresh the story.', 409);
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
  // Archived rules keep their earlier snapshots readable but stay out of new reviews.
  const allRules = rulesView().filter(rule => !rule.archived);
  const rules = allRules.filter(rule => rule.active);
  const sources = candidate.source_urls.map((url, index) => ({ source_id: 'source-' + (index + 1), url, status: 'not_read' }));
  const input = {
    schema_version: '0.5.0', capabilities: { source_reading: true, rights_verification: false },
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
    source_rule_ids: sourceRuleIds(allRules, candidate),
    source_material: sourceMaterial(sources),
  };
  if (!validators.validateRequest(input)) throw new WorkbenchError('The saved draft or active rules could not be prepared for review.', 400, validators.validateRequest.errors);
  return {
    input, rules: rules.map(rule => ({
      id: rule.id, rule_id: rule.rule_id, title: rule.approved.definition.title, origin: rule.approved.definition.origin, active: true,
      version: rule.approved.version, version_id: rule.approved.version_id, approval: rule.approved.approval,
    })),
    revision_records: { [candidate.revision_id]: id(revision), ...(baseline ? { [earlier.revision_id]: id(baseline) } : {}) },
    decision_check_requested: false,
    sources,
  };
}

function liveReviewProvider() {
  const config = providerConfig();
  const key = config?.getElement('api_key').getDecryptedValue();
  if (!key) throw new WorkbenchError('Gemini needs its server configuration before you can run a review.', 503);
  const model = config.getValue('model');
  return {
    model,
    generate(input, onFallback) {
      const message = geminiMessage(key, model, reviewData.prompt, input, reviewData.providerSchema);
      return executeGemini(message, model, 'complete this review', 'Your draft is saved and you can retry.', onFallback);
    },
  };
}

export function runReview(request, response) {
  return reviewSavedVersion(request, response, liveReviewProvider, readSavedSources);
}

export function reviewSavedVersion(request, response, createProvider, readSources) {
  respond(response, () => {
    const body = request.body.data;
    if (!body || typeof body.request_key !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(body.request_key)) {
      throw new WorkbenchError('The review action needs a request identity.');
    }
    const duplicate = find(tables.review, 'request_key', body.request_key);
    if (duplicate) return runView(duplicate);
    const revision = record(tables.revision, body.revision_id);
    assertRevisionNotArchived(revision);
    const provider = createProvider();
    const model = provider.model;
    // Decision 1 is retained for offline experiments, not editor review requests.
    // Legacy clients may still send decision_check; it cannot enable a second call.
    const prepared = buildRequest(revision, body.request_key);
    const revisionDiff = literalChanges(prepared.input.baseline_revision, prepared.input.candidate_revision);
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
    if (revisionDiff) run.setValue('revision_diff_json', JSON.stringify(revisionDiff));
    const runId = run.insert();
    if (!runId) throw new WorkbenchError('Another review started for this version. Refresh to see it.', 409);
    if (!run.get(String(runId))) throw new WorkbenchError('The review attempt could not be reopened. Refresh the story before retrying.', 500);
    // The source column is the saved copy. The model request and readback use that same text.
    const input = { ...prepared.input };
    persistReviewAttempt(run, input, () => {
      const sources = readSources(input.candidate_revision.source_urls, input.source_rule_ids.length > 0);
      run.setValue('source_evidence_json', JSON.stringify(sources));
      input.source_material = sourceMaterial(sources);
      const reply = provider.generate({ ...input, literal_edits: revisionDiff }, fallback => {
        prepared['provider'] = {
          requested_model: model, prompt_version: reviewData.promptVersion,
          fallback_model: fallback, fallback_reason: 'Gemini 3.5 returned HTTP 503.',
        };
        run.setValue('request_json', JSON.stringify(prepared));
        run.setValue('model', fallback);
      });
      run.setValue('model', reply.model);
      return reply.raw;
    }, validators, result => result, revisionDiff);
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

function requireMatchingRoute(task: GlideRecord, reviewerId: string, reason: string) {
  if (task.getValue('status') !== 'pending') {
    throw new WorkbenchError('Legal has already decided on this version. Save a new version to send it again.', 409);
  }
  if (task.getValue('assigned_reviewer') !== reviewerId || task.getValue('reason') !== reason) {
    throw new WorkbenchError('This version already has a pending legal request with different details. Reopen the story.', 409);
  }
}

export function workflowAction(request, response) {
  respond(response, () => {
    requireEditor();
    const input = request.body.data;
    if (!input || !['request_changes', 'sign_off', 'send_to_legal'].includes(input.action)
      || typeof input.revision_id !== 'string') {
      throw new WorkbenchError('Choose a saved version and a valid workflow action.');
    }
    const note = typeof input.note === 'string' ? input.note.trim() : '';
    if (note.length > 1000 || (input.action !== 'sign_off' && !note)) {
      throw new WorkbenchError('Add a reason of up to 1,000 characters for this action.');
    }
    if (input.action === 'send_to_legal' && !/^[a-f0-9]{32}$/.test(String(input.reviewer_id))) {
      throw new WorkbenchError('Choose a legal reviewer.');
    }
    const revision = readableRecord(tables.revision, input.revision_id);
    const story = readableRecord(tables.story, revision.getValue('story'));
    requireActiveStory(story);
    const latest = latestRevision(id(story));
    const stale = () => new WorkbenchError('This story changed elsewhere. Reload its current version before deciding.', 409);
    if (!latest || id(latest) !== id(revision)
      || (story.getValue('current_revision') && story.getValue('current_revision') !== id(revision))
      || !/^\d+$/.test(String(input.expected_modified))) throw stale();

    const task = legalTaskForRevision(id(revision));
    if (input.action === 'send_to_legal' && task) {
      requireMatchingRoute(task, input.reviewer_id, note);
      return { workflow: workflowView(story, revision), task_id: id(task) };
    }
    if (String(input.expected_modified) !== String(story.getValue('sys_mod_count'))) throw stale();

    const legalStatus = task?.getValue('status');
    const status = workflowStatus(story, id(revision), legalStatus);
    if (input.action === 'send_to_legal') {
      if (status === 'signed_off') throw new WorkbenchError('Save a new version before sending a signed-off story to legal.', 409);
      if (!legalReviewerExists(input.reviewer_id)) throw new WorkbenchError('Choose an active legal reviewer.');
      // Reserve the story before creating a task so a concurrent editor
      // cannot sign off against the old status.
      const reserved = guardedStoryUpdate(story, {
        current_revision: id(revision), workflow_status: 'waiting_for_legal', legal_clearance_required: '1',
      });
      if (!reserved) throw stale();
      const routed = routeRevision(reserved, revision, input.reviewer_id, note);
      return { workflow: workflowView(record(tables.story, id(story)), latestRevision(id(story))), task_id: id(routed) };
    }

    const needsClearance = needsLegalClearance(story);
    if (!editorActions(status, needsClearance, legalStatus === 'cleared').includes(input.action)) {
      if (input.action === 'sign_off' && needsClearance && legalStatus !== 'cleared') {
        throw new WorkbenchError('Legal must clear this exact version before you can sign off.', 409);
      }
      throw new WorkbenchError('This action is no longer available for the current version. Reload the story.', 409);
    }
    const decisionId = String(gs.generateGUID());
    const updated = guardedStoryUpdate(story, {
      current_revision: id(revision),
      workflow_status: input.action === 'sign_off' ? 'signed_off' : 'changes_requested',
      editor_decisions_json: appendEditorDecision(story, revision, input.action, note, decisionId),
    });
    if (updated) return { workflow: workflowView(updated, revision) };
    const refreshed = readableRecord(tables.story, id(story));
    if (!hasEditorDecision(refreshed, decisionId)) throw stale();
    return { workflow: workflowView(refreshed, latestRevision(id(story))) };
  });
}

function routeRevision(story: GlideRecord, revision: GlideRecord, reviewerId: string, reason: string) {
  const task = new GlideRecord(tables.legalTask);
  task.initialize();
  task.setValue('story', id(story));
  task.setValue('revision', id(revision));
  task.setValue('pending_key', id(revision));
  task.setValue('assigned_reviewer', reviewerId);
  task.setValue('status', 'pending');
  task.setValue('reason', reason);
  task.setValue('requested_by', gs.getUserID());
  task.setValue('requested_at', now());
  task.setValue('submitted_title', revision.getValue('title'));
  task.setValue('submitted_text', revision.getValue('body'));
  task.setValue('submitted_notes', revision.getValue('notes') || '');
  if (task.insert()) return task;
  const winner = legalTaskForRevision(id(revision));
  if (!winner) throw new WorkbenchError('The legal request could not be saved. Reload and retry sending it.', 500);
  requireMatchingRoute(winner, reviewerId, reason);
  return winner;
}

export function legalTasks(request, response) {
  respond(response, () => {
    requireLegalReviewer();
    const taskId = String(request.queryParams.task || '');
    if (taskId) {
      const task = record(tables.legalTask, taskId);
      if (!gs.hasRole('admin') && task.getValue('assigned_reviewer') !== String(gs.getUserID())) {
        throw new WorkbenchError('This legal review could not be found.', 404);
      }
      return { task: legalTaskView(task) };
    }
    const rows = new GlideRecord(tables.legalTask);
    if (!gs.hasRole('admin')) rows.addQuery('assigned_reviewer', gs.getUserID());
    rows.orderByDesc('requested_at');
    rows.setLimit(50);
    rows.query();
    const tasks = [];
    while (rows.next()) {
      const revision = record(tables.revision, rows.getValue('revision'));
      tasks.push({
        id: id(rows),
        title: revision.getValue('title') || '',
        version: Number(revision.getValue('version')),
        status: rows.getValue('status'),
        requested_at: rows.getValue('requested_at'),
      });
    }
    return { tasks };
  });
}

export function legalDecision(request, response) {
  respond(response, () => {
    requireLegalReviewer();
    const input = request.body.data;
    if (!input || !['clear', 'request_changes'].includes(input.action)
      || typeof input.task_id !== 'string' || typeof input.revision_id !== 'string') {
      throw new WorkbenchError('Choose a legal review and a valid decision.');
    }
    const note = typeof input.note === 'string' ? input.note.trim() : '';
    if (input.action === 'request_changes' && !note) {
      throw new WorkbenchError('Explain what needs to change before requesting changes.');
    }
    if (note.length > 1000) throw new WorkbenchError('Keep the legal decision note to 1,000 characters.');
    const task = record(tables.legalTask, input.task_id);
    if (!gs.hasRole('admin') && task.getValue('assigned_reviewer') !== String(gs.getUserID())) {
      throw new WorkbenchError('This legal review could not be found.', 404);
    }
    if (task.getValue('revision') !== input.revision_id) {
      throw new WorkbenchError('This decision does not match the submitted version.', 409);
    }
    if (task.getValue('status') !== 'pending') {
      throw new WorkbenchError('This legal review already has a decision.', 409);
    }
    if (input.expected_modified === undefined
      || String(input.expected_modified) !== String(task.getValue('sys_mod_count'))) {
      throw new WorkbenchError('This legal review changed elsewhere. Reload it before deciding.', 409);
    }
    const story = record(tables.story, task.getValue('story'));
    requireActiveStory(story);
    const decisionKey = String(gs.generateGUID());
    const status = input.action === 'clear' ? 'cleared' : 'changes_requested';
    const update = new GlideRecord(tables.legalTask);
    update.addQuery('sys_id', id(task));
    update.addQuery('sys_mod_count', String(input.expected_modified));
    update.addQuery('status', 'pending');
    update.addQuery('revision', input.revision_id);
    update.addQuery('assigned_reviewer', task.getValue('assigned_reviewer'));
    update.setValue('status', status);
    update.setValue('decision_key', decisionKey);
    update.setValue('decision_note', note);
    update.setValue('decision_by', gs.getUserID());
    update.setValue('decided_at', now());
    update.updateMultiple();
    const refreshed = record(tables.legalTask, id(task));
    if (refreshed.getValue('decision_key') !== decisionKey) {
      throw new WorkbenchError('This legal review changed elsewhere. Reload it before deciding.', 409);
    }
    const current = record(tables.story, id(story));
    if (current.getValue('current_revision') === input.revision_id
      && current.getValue('workflow_status') === 'waiting_for_legal') {
      guardedStoryUpdate(current, { workflow_status: status === 'cleared' ? 'ready_for_sign_off' : 'changes_requested' });
    }
    return { task: legalTaskView(refreshed) };
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

export function getPolicies(request, response) {
  respond(response, () => policyState(String(request.queryParams.version || '')));
}

export function savePolicy(request, response) {
  respond(response, () => savePolicyVersion(request.body.data));
}

export function proposePolicyChecks(body, generate) {
  requireRulesEditor();
  const policy = readPolicyVersion(body?.policy_version_id);
  const focus = body.passage_id || null;
  if (focus && !policy.passages.some(passage => passage.id === focus)) throw new WorkbenchError('Choose a passage from this saved policy.');
  const reply = generate({ passages: policy.passages, focus_passage_id: focus, available_checks: supportedChecks });
  return { ...checkPolicySuggestions(reply.raw, policy, focus), policy_version_id: policy.id, model: reply.model, fallback_model: reply.fallback_model };
}

export function suggestPolicyChecks(request, response) {
  respond(response, () => proposePolicyChecks(request.body.data, input => {
    const config = providerConfig();
    const key = config?.getElement('api_key').getDecryptedValue();
    if (!key) throw new WorkbenchError('Gemini needs its server configuration. You can use the saved policy wording now.', 503);
    const model = config.getValue('model');
    const message = geminiMessage(key, model, policyProposalPrompt, input, policyProposalSchema);
    return executeGemini(message, model, 'suggest checks', 'Your policy is saved. Try again or use the original wording.');
  }));
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
