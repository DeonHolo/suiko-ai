import '@servicenow/sdk/global';
import {
  Acl, Role, Table, StringColumn, IntegerColumn, ReferenceColumn,
  BooleanColumn, GenericColumn, Form, default_view, RestApi, ApplicationMenu, Record,
} from '@servicenow/sdk/core';
import { getState, saveRevision, runReview, saveMetadata, saveRule, approveRule, setRuleActive, configureProvider, getPolicies, savePolicy, suggestPolicyChecks } from '../server/workbench';

export const editor = Role({
  $id: Now.ID['suiko-editor-role'], name: 'x_2236136_suiko_ai.editor',
});
export const rulesEditor = Role({
  $id: Now.ID['suiko-rules-editor-role'], name: 'x_2236136_suiko_ai.rules_editor',
  containsRoles: [editor],
});
const editorApi = Acl({
  $id: Now.ID['suiko-api-access'], type: 'rest_endpoint', name: 'suiko_editor_api',
  operation: 'execute', roles: [editor], adminOverrides: true,
});

export const x_2236136_suiko_ai_story = Table({
  name: 'x_2236136_suiko_ai_story', label: 'Suiko story', audit: true,
  schema: { title: StringColumn({ label: 'Title', maxLength: 160, mandatory: true }) },
  allowWebServiceAccess: false,
});
export const x_2236136_suiko_ai_revision = Table({
  name: 'x_2236136_suiko_ai_revision', label: 'Suiko revision', audit: true,
  schema: {
    story: ReferenceColumn({ label: 'Story', referenceTable: 'x_2236136_suiko_ai_story', mandatory: true }),
    version: IntegerColumn({ label: 'Version', mandatory: true }),
    version_key: StringColumn({ label: 'Version identity', maxLength: 80 }),
    request_key: StringColumn({ label: 'Save identity', maxLength: 80 }),
    title: StringColumn({ label: 'Title', maxLength: 160 }),
    body: StringColumn({ label: 'Draft', maxLength: 12000 }),
    notes: StringColumn({ label: 'Review context', maxLength: 4000 }),
    content_format: StringColumn({ label: 'Content format', maxLength: 20 }),
    content_kind: StringColumn({ label: 'Content kind', maxLength: 20 }),
    source_urls_json: StringColumn({ label: 'Saved source links', maxLength: 8000 }),
  },
  allowWebServiceAccess: false,
  index: [{ element: 'version_key', unique: true }, { element: 'request_key', unique: true }],
});
export const x_2236136_suiko_ai_review = Table({
  name: 'x_2236136_suiko_ai_review', label: 'Suiko AI review', audit: true,
  schema: {
    revision: ReferenceColumn({ label: 'Revision', referenceTable: 'x_2236136_suiko_ai_revision', mandatory: true }),
    request_key: StringColumn({ label: 'Request identity', maxLength: 80 }),
    active_revision: StringColumn({ label: 'Running revision', maxLength: 32 }),
    state: StringColumn({ label: 'State', maxLength: 20 }),
    model: StringColumn({ label: 'Model', maxLength: 100 }),
    request_json: StringColumn({ label: 'Saved review input', maxLength: 200000 }),
    source_evidence_json: StringColumn({ label: 'Saved source material', maxLength: 100000 }),
    response_json: StringColumn({ label: 'Gemini result', maxLength: 200000 }),
    error_json: StringColumn({ label: 'Review issue', maxLength: 20000 }),
    metadata_json: StringColumn({ label: 'Editor metadata choice', maxLength: 5000 }),
  },
  allowWebServiceAccess: false,
  index: [{ element: 'request_key', unique: true }, { element: 'active_revision', unique: true }],
});
export const x_2236136_suiko_ai_rule = Table({
  name: 'x_2236136_suiko_ai_rule', label: 'Suiko editorial rule', audit: true,
  schema: {
    rule_id: StringColumn({ label: 'Rule identity', maxLength: 80 }),
    title: StringColumn({ label: 'Title', maxLength: 160 }),
    instruction: StringColumn({ label: 'When and what to check', maxLength: 3000 }),
    priority: StringColumn({ label: 'Priority', maxLength: 20 }),
    active: BooleanColumn({ label: 'Active', default: true }),
    version: IntegerColumn({ label: 'Version', default: 1 }),
    managed: BooleanColumn({ label: 'Uses explicit approval', default: false }),
    draft_version_id: StringColumn({ label: 'Current proposed version', maxLength: 32 }),
    approved_json: StringColumn({ label: 'Approved rule snapshot', maxLength: 16000 }),
    change_key: StringColumn({ label: 'Last settings action', maxLength: 80 }),
  },
  allowWebServiceAccess: false,
  index: [{ element: 'rule_id', unique: true }],
});
export const x_2236136_suiko_ai_config = Table({
  name: 'x_2236136_suiko_ai_config', label: 'Suiko provider configuration',
  schema: {
    name: StringColumn({ label: 'Configuration', maxLength: 80 }),
    model: StringColumn({ label: 'Model', maxLength: 100 }),
    api_key: GenericColumn({ label: 'Gemini API key', columnType: 'password2' }),
  },
  allowWebServiceAccess: false,
  index: [{ element: 'name', unique: true }],
});

export const x_2236136_suiko_ai_rule_version = Table({
  name: 'x_2236136_suiko_ai_rule_version', label: 'Suiko rule version', audit: true,
  schema: {
    parent_rule: ReferenceColumn({ label: 'Editorial rule', referenceTable: 'x_2236136_suiko_ai_rule', mandatory: true }),
    version: IntegerColumn({ label: 'Version', mandatory: true }),
    version_key: StringColumn({ label: 'Version identity', maxLength: 80 }),
    definition_json: StringColumn({ label: 'Saved instruction and applicability', maxLength: 16000 }),
    approval_json: StringColumn({ label: 'Approval record', maxLength: 1000 }),
  },
  allowWebServiceAccess: false,
  index: [{ element: 'version_key', unique: true }],
});

export const x_2236136_suiko_ai_policy_version = Table({
  name: 'x_2236136_suiko_ai_policy_version', label: 'Suiko policy copy', audit: true,
  schema: {
    title: StringColumn({ label: 'Policy title', maxLength: 160, mandatory: true }),
    body: StringColumn({ label: 'Original policy wording', maxLength: 12000, mandatory: true }),
    saved_by_name: StringColumn({ label: 'Saved by', maxLength: 160 }),
    request_key: StringColumn({ label: 'Save request', maxLength: 80, mandatory: true }),
  },
  allowWebServiceAccess: false,
  index: [{ element: 'request_key', unique: true }],
});

Acl({ $id: Now.ID['policy-version-read'], type: 'record', table: 'x_2236136_suiko_ai_policy_version',
  operation: 'read', roles: [rulesEditor], adminOverrides: true });
Acl({ $id: Now.ID['policy-version-create'], type: 'record', table: 'x_2236136_suiko_ai_policy_version',
  operation: 'create', roles: ['admin'], adminOverrides: true });
Acl({ $id: Now.ID['policy-version-write'], type: 'record', table: 'x_2236136_suiko_ai_policy_version',
  operation: 'write', roles: ['admin'], adminOverrides: true });
Acl({ $id: Now.ID['policy-version-delete'], type: 'record', table: 'x_2236136_suiko_ai_policy_version',
  operation: 'delete', roles: ['admin'], adminOverrides: true });

Acl({ $id: Now.ID['rule-version-read'], type: 'record', table: 'x_2236136_suiko_ai_rule_version',
  operation: 'read', roles: [editor], adminOverrides: true });
Acl({ $id: Now.ID['rule-version-create'], type: 'record', table: 'x_2236136_suiko_ai_rule_version',
  operation: 'create', roles: ['admin'], adminOverrides: true });
Acl({ $id: Now.ID['rule-version-write'], type: 'record', table: 'x_2236136_suiko_ai_rule_version',
  operation: 'write', roles: ['admin'], adminOverrides: true });
Acl({ $id: Now.ID['rule-version-delete'], type: 'record', table: 'x_2236136_suiko_ai_rule_version',
  operation: 'delete', roles: ['admin'], adminOverrides: true });

Form({
  table: 'x_2236136_suiko_ai_rule_version', view: default_view,
  sections: [{ caption: 'Saved rule version', content: [{ layout: 'one-column', elements: [
    { type: 'table_field', field: 'parent_rule' }, { type: 'table_field', field: 'version' },
    { type: 'table_field', field: 'version_key' }, { type: 'table_field', field: 'definition_json' },
    { type: 'table_field', field: 'approval_json' },
  ] }] }],
});

Form({
  table: 'x_2236136_suiko_ai_story', view: default_view,
  sections: [{ caption: 'Details', content: [{ layout: 'one-column', elements: [
      { type: 'table_field', field: 'title' }
  ] }] }],
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_story-read'], type: 'record',
  table: 'x_2236136_suiko_ai_story', operation: 'read',
  roles: [editor], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_story-create'], type: 'record',
  table: 'x_2236136_suiko_ai_story', operation: 'create',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_story-write'], type: 'record',
  table: 'x_2236136_suiko_ai_story', operation: 'write',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_story-delete'], type: 'record',
  table: 'x_2236136_suiko_ai_story', operation: 'delete',
  roles: ['admin'], adminOverrides: true,
});

Form({
  table: 'x_2236136_suiko_ai_revision', view: default_view,
  sections: [{ caption: 'Details', content: [{ layout: 'one-column', elements: [
      { type: 'table_field', field: 'story' },
      { type: 'table_field', field: 'version' },
      { type: 'table_field', field: 'version_key' },
      { type: 'table_field', field: 'request_key' },
      { type: 'table_field', field: 'title' },
      { type: 'table_field', field: 'body' },
      { type: 'table_field', field: 'notes' },
      { type: 'table_field', field: 'content_format' },
      { type: 'table_field', field: 'content_kind' },
      { type: 'table_field', field: 'source_urls_json' }
  ] }] }],
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_revision-read'], type: 'record',
  table: 'x_2236136_suiko_ai_revision', operation: 'read',
  roles: [editor], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_revision-create'], type: 'record',
  table: 'x_2236136_suiko_ai_revision', operation: 'create',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_revision-write'], type: 'record',
  table: 'x_2236136_suiko_ai_revision', operation: 'write',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_revision-delete'], type: 'record',
  table: 'x_2236136_suiko_ai_revision', operation: 'delete',
  roles: ['admin'], adminOverrides: true,
});

Form({
  table: 'x_2236136_suiko_ai_review', view: default_view,
  sections: [{ caption: 'Details', content: [{ layout: 'one-column', elements: [
      { type: 'table_field', field: 'revision' },
      { type: 'table_field', field: 'request_key' },
      { type: 'table_field', field: 'active_revision' },
      { type: 'table_field', field: 'state' },
      { type: 'table_field', field: 'model' },
      { type: 'table_field', field: 'request_json' },
      { type: 'table_field', field: 'response_json' },
      { type: 'table_field', field: 'error_json' },
      { type: 'table_field', field: 'metadata_json' }
  ] }] }],
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_review-read'], type: 'record',
  table: 'x_2236136_suiko_ai_review', operation: 'read',
  roles: [editor], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_review-create'], type: 'record',
  table: 'x_2236136_suiko_ai_review', operation: 'create',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_review-write'], type: 'record',
  table: 'x_2236136_suiko_ai_review', operation: 'write',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_review-delete'], type: 'record',
  table: 'x_2236136_suiko_ai_review', operation: 'delete',
  roles: ['admin'], adminOverrides: true,
});

Form({
  table: 'x_2236136_suiko_ai_rule', view: default_view,
  sections: [{ caption: 'Details', content: [{ layout: 'one-column', elements: [
      { type: 'table_field', field: 'rule_id' },
      { type: 'table_field', field: 'title' },
      { type: 'table_field', field: 'instruction' },
      { type: 'table_field', field: 'priority' },
      { type: 'table_field', field: 'active' },
      { type: 'table_field', field: 'version' }
  ] }] }],
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_rule-read'], type: 'record',
  table: 'x_2236136_suiko_ai_rule', operation: 'read',
  roles: [editor], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_rule-create'], type: 'record',
  table: 'x_2236136_suiko_ai_rule', operation: 'create',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_rule-write'], type: 'record',
  table: 'x_2236136_suiko_ai_rule', operation: 'write',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_rule-delete'], type: 'record',
  table: 'x_2236136_suiko_ai_rule', operation: 'delete',
  roles: ['admin'], adminOverrides: true,
});

Form({
  table: 'x_2236136_suiko_ai_config', view: default_view,
  sections: [{ caption: 'Details', content: [{ layout: 'one-column', elements: [
      { type: 'table_field', field: 'name' },
      { type: 'table_field', field: 'model' },
      { type: 'table_field', field: 'api_key' }
  ] }] }],
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_config-read'], type: 'record',
  table: 'x_2236136_suiko_ai_config', operation: 'read',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_config-create'], type: 'record',
  table: 'x_2236136_suiko_ai_config', operation: 'create',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_config-write'], type: 'record',
  table: 'x_2236136_suiko_ai_config', operation: 'write',
  roles: ['admin'], adminOverrides: true,
});

Acl({
  $id: Now.ID['x_2236136_suiko_ai_config-delete'], type: 'record',
  table: 'x_2236136_suiko_ai_config', operation: 'delete',
  roles: ['admin'], adminOverrides: true,
});

const menu = ApplicationMenu({
  $id: Now.ID['suiko-menu'], title: 'Suiko AI', roles: [editor],
});
Record({
  $id: Now.ID['suiko-review-module'], table: 'sys_app_module',
  data: {
    title: 'Review workbench', application: menu, active: true, order: 100,
    link_type: 'DIRECT', query: 'x_2236136_suiko_ai_review.do',
    roles: ['x_2236136_suiko_ai.editor'],
  },
});

RestApi({
  $id: Now.ID['suiko-workbench-api'], name: 'Suiko review workbench', serviceId: 'workbench',
  consumes: 'application/json', produces: 'application/json', enforceAcl: [editorApi],
  versions: [{ $id: Now.ID['suiko-api-v1'], version: 1, isDefault: true }],
  routes: [
    { $id: Now.ID['suiko-state'], method: 'GET', path: '/state', version: 1, script: getState },
    { $id: Now.ID['suiko-save-revision'], method: 'POST', path: '/revisions', version: 1, script: saveRevision },
    { $id: Now.ID['suiko-run-review'], method: 'POST', path: '/reviews', version: 1, script: runReview },
    { $id: Now.ID['suiko-save-metadata'], method: 'POST', path: '/metadata', version: 1, script: saveMetadata },
    { $id: Now.ID['suiko-save-rule'], method: 'POST', path: '/rules', version: 1, script: saveRule },
    { $id: Now.ID['suiko-approve-rule'], method: 'POST', path: '/rules/approve', version: 1, script: approveRule },
    { $id: Now.ID['suiko-rule-active'], method: 'POST', path: '/rules/active', version: 1, script: setRuleActive },
    { $id: Now.ID['suiko-list-policies'], method: 'GET', path: '/policies', version: 1, script: getPolicies },
    { $id: Now.ID['suiko-save-policy'], method: 'POST', path: '/policies', version: 1, script: savePolicy },
    { $id: Now.ID['suiko-suggest-policy'], method: 'POST', path: '/policies/suggest', version: 1, script: suggestPolicyChecks },
    { $id: Now.ID['suiko-provider-configuration'], method: 'POST', path: '/provider', version: 1, script: configureProvider },
  ],
});
