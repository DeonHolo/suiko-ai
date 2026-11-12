import { GlideRecord, GlideDateTime, gs } from '@servicenow/glide';
import { normalizeRuleDefinition, approvedRuleSnapshot, starterTemplates, supportedChecks } from './generated/editorial-rules.js';
import { WorkbenchError } from './workbench-error.ts';

const ruleTable = 'x_2236136_suiko_ai_rule';
const versionTable = 'x_2236136_suiko_ai_rule_version';
const uid = row => String(row.getUniqueValue());
const json = value => value ? JSON.parse(String(value)) : null;
export { starterTemplates, supportedChecks };

function requireManager() {
  if (!gs.hasRole('admin') && !gs.hasRole('x_2236136_suiko_ai.rules_editor')) {
    throw new WorkbenchError('Rule settings are available to the designated editor.', 403);
  }
}
function saved(table, id) {
  if (typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id)) throw new WorkbenchError('Choose a saved rule version.');
  const row = new GlideRecord(table);
  if (!row.get(id)) throw new WorkbenchError('That saved rule version could not be found.', 404);
  return row;
}
function checkVersion(parent, input) {
  if (!Number.isInteger(input?.expected_modified) || input.expected_modified !== Number(parent.getValue('sys_mod_count'))) {
    throw new WorkbenchError('This rule changed elsewhere. Reload it before saving or approving.', 409);
  }
}
function changeParent(parent, input, changes) {
  checkVersion(parent, input);
  const token = String(gs.generateGUID());
  const update = new GlideRecord(ruleTable);
  update.addQuery('sys_id', uid(parent));
  update.addQuery('sys_mod_count', input.expected_modified);
  for (const [field, value] of Object.entries(changes)) update.setValue(field, value);
  update.setValue('change_key', token);
  update.updateMultiple();
  const refreshed = saved(ruleTable, uid(parent));
  if (refreshed.getValue('change_key') !== token) throw new WorkbenchError('This rule changed elsewhere. Reload it before continuing.', 409);
  return refreshed;
}

export function listEditorialRules() {
  const rows = new GlideRecord(ruleTable);
  rows.orderBy('rule_id');
  rows.query();
  const rules = [];
  while (rows.next()) {
    const approved = json(rows.getValue('approved_json'));
    const draftId = rows.getValue('draft_version_id');
    let draft = null;
    if (draftId) {
      const version = saved(versionTable, String(draftId));
      if (version.getValue('parent_rule') !== uid(rows)) throw new WorkbenchError('A rule draft has the wrong saved parent. Ask the designated editor to reopen it.');
      draft = { id: uid(version), version: Number(version.getValue('version')), definition: json(version.getValue('definition_json')) };
    }
    const definition = draft?.definition || approved?.definition || {
      title: rows.getValue('title') || '', text: rows.getValue('instruction') || '',
      priority: rows.getValue('priority') || 'standard', formats: ['article', 'script', 'caption'],
      content_kinds: ['news', 'opinion', 'sponsored'], conditions: '', human_checks: [], origin: { kind: 'manual' },
    };
    rules.push({
      ...definition, id: uid(rows), rule_id: rows.getValue('rule_id'),
      version: Number(rows.getValue('version')), modified: Number(rows.getValue('sys_mod_count')),
      active: !!approved && rows.getValue('active') === '1', approved, draft,
      pending: !!draft && draft.id !== approved?.version_id,
      legacy_approval_missing: rows.getValue('managed') !== '1', updated_at: rows.getValue('sys_updated_on'),
    });
  }
  return rules;
}

export function saveRuleDraft(input) {
  requireManager();
  if (!input || typeof input.rule_id !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(input.rule_id)) {
    throw new WorkbenchError('Give this rule a valid identity.');
  }
  const definition = normalizeRuleDefinition(input);
  if (definition.origin.kind === 'policy') throw new WorkbenchError('Company-policy suggestions are not enabled yet. You can enter the rule yourself.');
  const encoded = JSON.stringify(definition);
  if (encoded.length > 15500) throw new WorkbenchError('This rule is too large to save. Shorten its optional conditions or confirmation notes.');
  let parent;
  let guard = input;
  if (input.id) {
    parent = saved(ruleTable, input.id);
    if (parent.getValue('rule_id') !== input.rule_id) throw new WorkbenchError('The rule identity changed. Reload the saved rule.');
    checkVersion(parent, input);
  } else {
    const exists = new GlideRecord(ruleTable);
    exists.addQuery('rule_id', input.rule_id);
    exists.setLimit(1);
    exists.query();
    if (exists.next()) throw new WorkbenchError('That rule already exists. Reload it before saving a proposal.', 409);
    parent = new GlideRecord(ruleTable);
    parent.initialize();
    parent.setValue('rule_id', input.rule_id);
    parent.setValue('title', definition.title);
    parent.setValue('instruction', definition.text);
    parent.setValue('priority', definition.priority);
    parent.setValue('active', false);
    parent.setValue('version', 0);
    parent.setValue('managed', true);
    const created = parent.insert();
    if (!created) throw new WorkbenchError('The rule could not be created. Reload and try again.', 409);
    parent = saved(ruleTable, String(created));
    guard = { expected_modified: Number(parent.getValue('sys_mod_count')) };
  }
  const latest = new GlideRecord(versionTable);
  latest.addQuery('parent_rule', uid(parent));
  latest.orderByDesc('version');
  latest.setLimit(1);
  latest.query();
  const number = Math.max(Number(parent.getValue('version')), latest.next() ? Number(latest.getValue('version')) : 0) + 1;
  const version = new GlideRecord(versionTable);
  version.initialize();
  version.setValue('parent_rule', uid(parent));
  version.setValue('version', number);
  version.setValue('version_key', uid(parent) + ':' + number);
  version.setValue('definition_json', encoded);
  const versionId = version.insert();
  if (!versionId) throw new WorkbenchError('A proposal was saved elsewhere. Reload the rule.', 409);
  changeParent(parent, guard, {
    draft_version_id: String(versionId), version: number, managed: true,
    title: definition.title, instruction: definition.text, priority: definition.priority,
  });
  return { rules: listEditorialRules() };
}

export function approveSavedRule(input) {
  requireManager();
  const parent = saved(ruleTable, input?.id);
  checkVersion(parent, input);
  if (parent.getValue('draft_version_id') !== input.version_id) throw new WorkbenchError('This proposal was replaced. Reload it before approving.', 409);
  const version = saved(versionTable, input.version_id);
  if (version.getValue('parent_rule') !== uid(parent)) throw new WorkbenchError('Choose the proposal belonging to this rule.');
  const active = listEditorialRules().filter(rule => rule.active && rule.id !== uid(parent));
  if (active.length >= 12) throw new WorkbenchError('Up to twelve rules can be active. Turn off another rule before approving this one.');
  const approval = approvedRuleSnapshot(parent.getValue('rule_id'), json(version.getValue('definition_json')),
    uid(version), Number(version.getValue('version')), String(gs.getUserID()), new GlideDateTime().getValue(), String(gs.getUserDisplayName()));
  if (JSON.stringify(approval).length > 16000) throw new WorkbenchError('This approved rule is too large to save. Shorten its optional notes and save a new proposal.');
  changeParent(parent, input, { approved_json: JSON.stringify(approval), active: true });
  // The parent's approved snapshot is authoritative and is saved atomically above.
  version.setValue('approval_json', JSON.stringify(approval.approval));
  if (!version.update()) throw new WorkbenchError('The approved rule was saved, but its version history needs a refresh. Reload the rules.', 500);
  return { rules: listEditorialRules() };
}

export function setSavedRuleActive(input) {
  requireManager();
  if (typeof input?.active !== 'boolean') throw new WorkbenchError('Choose whether to enable this approved rule.');
  const parent = saved(ruleTable, input.id);
  const approved = json(parent.getValue('approved_json'));
  if (input.active && !approved) throw new WorkbenchError('Approve a saved proposal before enabling this rule.');
  if (input.active && listEditorialRules().filter(rule => rule.active && rule.id !== uid(parent)).length >= 12) {
    throw new WorkbenchError('Up to twelve rules can be active. Turn off another rule first.');
  }
  changeParent(parent, input, { active: input.active });
  return { rules: listEditorialRules() };
}
