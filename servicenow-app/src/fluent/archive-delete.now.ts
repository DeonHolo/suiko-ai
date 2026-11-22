import { BusinessRule, CrossScopePrivilege } from '@servicenow/sdk/core';
import { guardArchiveParentDelete } from '../server/archive';

BusinessRule({
  $id: Now.ID['suiko-archive-story-delete-guard'],
  table: 'x_2236136_suiko_ai_story', name: 'Suiko Archive owns story deletion',
  when: 'before', action: ['delete'], script: guardArchiveParentDelete,
});

CrossScopePrivilege({
  $id: '60886a04833453906fffc629feaad312',
  targetScope: 'global', targetName: 'sys_dictionary', targetType: 'sys_db_object',
  operation: 'read', status: 'allowed',
});

CrossScopePrivilege({
  $id: '68886a04833453906fffc629feaad31b',
  targetScope: 'global', targetName: 'sys_script', targetType: 'sys_db_object',
  operation: 'read', status: 'allowed',
});

CrossScopePrivilege({
  $id: 'a8886a04833453906fffc629feaad323',
  targetScope: 'global', targetName: 'GlideRecord.deleteRecord', targetType: 'scriptable',
  operation: 'execute', status: 'allowed',
});

CrossScopePrivilege({
  $id: 'bc8a264c833453906fffc629feaad326',
  targetScope: 'global', targetName: 'GlideSysAttachment.getAttachments', targetType: 'scriptable',
  operation: 'execute', status: 'allowed',
});

BusinessRule({
  $id: Now.ID['suiko-archive-rule-delete-guard'],
  table: 'x_2236136_suiko_ai_rule', name: 'Suiko Archive owns rule deletion',
  when: 'before', action: ['delete'], script: guardArchiveParentDelete,
});

