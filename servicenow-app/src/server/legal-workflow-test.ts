import { gs } from '@servicenow/glide';
import { getState, legalDecision, legalTasks, saveRevision, workflowAction } from './workbench.ts';

function expect(value, message) {
  if (!value) throw new Error(message);
}

function action(handler, data, queryParams = {}) {
  let status = 200;
  let body;
  handler({ body: { data }, queryParams }, {
    setStatus: value => { status = value; },
    setBody: value => { body = value; },
  });
  return { status, body };
}

export function runLegalWorkflowRegression() {
  expect(gs.hasRole('x_2236136_suiko_ai.editor') && gs.hasRole('x_2236136_suiko_ai.legal_reviewer') && !gs.hasRole('admin'),
    'Use the dedicated editor/legal-reviewer test user.');
  const saved = action(saveRevision, {
    request_key: 'ATF-legal-' + gs.generateGUID(),
    title: 'ATF legal workflow story',
    text: 'A fictional clip appears in the finished package.',
    notes: 'Confirm the clip permission before sign-off.',
    content_format: 'script',
    content_kind: 'news',
    source_urls: [],
  });
  expect(saved.status === 200 && saved.body.id, 'Could not save the legal workflow fixture.');

  const state = action(getState, {}, { story: saved.body.story_id });
  expect(state.status === 200 && state.body.workflow.status === 'needs_review', 'A new story did not start in needs review.');
  const reviewer = state.body.workflow.reviewers.find(user => user.id === String(gs.getUserID()));
  expect(!!reviewer, 'The legal test user was not offered as an eligible reviewer.');

  const sent = action(workflowAction, {
    action: 'send_to_legal', revision_id: saved.body.id,
    reviewer_id: String(gs.getUserID()), note: 'Confirm the fictional clip permission.',
    expected_modified: state.body.workflow.modified,
  });
  expect(sent.status === 200 && sent.body.workflow.status === 'waiting_for_legal', 'Sending the revision to legal did not update workflow status.');

  const repeated = action(workflowAction, {
    action: 'send_to_legal', revision_id: saved.body.id,
    reviewer_id: String(gs.getUserID()), note: 'Confirm the fictional clip permission.',
    expected_modified: sent.body.workflow.modified,
  });
  expect(repeated.status === 200 && repeated.body.task_id === sent.body.task_id, 'Repeated routing created a duplicate pending task.');

  const opened = action(legalTasks, {}, { task: sent.body.task_id });
  expect(opened.status === 200 && opened.body.task.revision.id === saved.body.id
    && opened.body.task.revision.text === 'A fictional clip appears in the finished package.',
  'The legal task did not return the frozen submitted revision.');

  const cleared = action(legalDecision, {
    task_id: sent.body.task_id, revision_id: saved.body.id,
    expected_modified: opened.body.task.modified, action: 'clear', note: '',
  });
  expect(cleared.status === 200 && cleared.body.task.status === 'cleared', 'Legal clearance was not saved.');

  const after = action(getState, {}, { story: saved.body.story_id });
  expect(after.status === 200 && after.body.workflow.status === 'ready_for_sign_off',
    'Legal clearance did not make the current revision ready for sign-off.');
  return 'Passed: exact-revision routing, duplicate prevention, frozen task text and legal clearance.';
}
