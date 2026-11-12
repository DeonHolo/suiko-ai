import { gs } from '@servicenow/glide';
import { WorkbenchError } from './workbench-error.ts';

export function requireRulesEditor() {
  if (!gs.hasRole('admin') && !gs.hasRole('x_2236136_suiko_ai.rules_editor')) {
    throw new WorkbenchError('Rule settings are available to the designated editor.', 403);
  }
}
