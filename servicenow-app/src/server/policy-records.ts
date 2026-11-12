import { GlideRecord, gs } from '@servicenow/glide';
import { normalizePolicyInput, policyPassages } from './generated/policy-proposals.js';
import { requireRulesEditor } from './rule-access.ts';
import { WorkbenchError } from './workbench-error.ts';

const table = 'x_2236136_suiko_ai_policy_version';

function summary(row) {
  return {
    id: String(row.getUniqueValue()), title: row.getValue('title'),
    saved_at: row.getValue('sys_created_on'), saved_by: row.getValue('saved_by_name'),
  };
}

export function readPolicyVersion(id) {
  if (typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id)) throw new WorkbenchError('Choose a saved policy copy.');
  const row = new GlideRecord(table);
  if (!row.get(id)) throw new WorkbenchError('That policy copy could not be found.', 404);
  const text = row.getValue('body');
  return { ...summary(row), text, passages: policyPassages(text) };
}

export function policyState(id = '') {
  requireRulesEditor();
  const rows = new GlideRecord(table);
  rows.orderByDesc('sys_created_on');
  rows.setLimit(50);
  rows.query();
  const versions = [];
  while (rows.next()) versions.push(summary(rows));
  return { versions, policy: id ? readPolicyVersion(id) : null };
}

function existingCopy(input) {
  const row = new GlideRecord(table);
  row.addQuery('request_key', input.request_key);
  row.setLimit(1);
  row.query();
  if (!row.next()) return null;
  if (row.getValue('title') !== input.title || row.getValue('body') !== input.text) {
    throw new WorkbenchError('That save was already used for another policy copy. Try saving your current wording again.', 409);
  }
  return String(row.getUniqueValue());
}

export function savePolicyVersion(input) {
  requireRulesEditor();
  const draft = normalizePolicyInput(input);
  const existing = existingCopy(draft);
  if (existing) return policyState(existing);
  const row = new GlideRecord(table);
  row.initialize();
  row.setValue('title', draft.title);
  row.setValue('body', draft.text);
  row.setValue('request_key', draft.request_key);
  row.setValue('saved_by_name', String(gs.getUserDisplayName()).slice(0, 160));
  const id = row.insert();
  if (!id) {
    const concurrent = existingCopy(draft);
    if (concurrent) return policyState(concurrent);
    throw new WorkbenchError('The policy copy could not be saved. Try again.', 500);
  }
  return policyState(String(id));
}

export function validatePolicyOrigin(origin) {
  const policy = readPolicyVersion(origin.policy_version_id);
  if (!origin.passage_ids.every(id => policy.passages.some(passage => passage.id === id))) {
    throw new WorkbenchError('A rule passage could not be found in its saved policy copy. Open the policy and choose the passage again.');
  }
}
