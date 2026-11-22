import { BusinessRule } from '@servicenow/sdk/core';
import { guardArchiveParentDelete } from '../server/archive';

BusinessRule({
  $id: Now.ID['suiko-archive-story-delete-guard'],
  table: 'x_2236136_suiko_ai_story', name: 'Suiko Archive owns story deletion',
  when: 'before', action: ['delete'], script: guardArchiveParentDelete,
});

BusinessRule({
  $id: Now.ID['suiko-archive-rule-delete-guard'],
  table: 'x_2236136_suiko_ai_rule', name: 'Suiko Archive owns rule deletion',
  when: 'before', action: ['delete'], script: guardArchiveParentDelete,
});

