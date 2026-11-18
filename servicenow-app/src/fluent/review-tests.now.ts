import '@servicenow/sdk/global';
import { Test, TestSuite } from '@servicenow/sdk/core';
import { editor, legalReviewer, rulesEditor } from './review.now';

const persistence = Test({
  $id: Now.ID['ai16-review-persistence-test'],
  name: 'Suiko AI-16: checked review persistence and retry',
  description: 'Uses injected replies, actual review records and the installed generated validators. No Gemini calls or provider configuration changes.',
  failOnServerError: true,
}, atf => {
  atf.server.runServerSideScript({
    $id: Now.ID['ai16-review-persistence-step'],
    script: Now.include('./tests/review-attempt.script.js'),
  });
});

const approvedRules = Test({
  $id: Now.ID['ai18-approved-rule-test'], name: 'Suiko AI-18: saved rule approval and editor permissions',
  description: 'Runs the rule actions as dedicated non-admin users; no model calls. ATF rolls back its fixture data.',
  failOnServerError: true,
}, atf => {
  atf.server.createUser({ $id: Now.ID['ai18-manager-user'], firstName: 'Suiko', lastName: 'Rules Test', roles: [rulesEditor] });
  atf.server.runServerSideScript({ $id: Now.ID['ai18-manager-step'], script: Now.include('./tests/rule-manager.script.js') });
  atf.server.runServerSideScript({ $id: Now.ID['ai19-policy-step'], script: Now.include('./tests/policy-setup.script.js') });
  atf.server.runServerSideScript({ $id: Now.ID['ai21-claim-step'], script: Now.include('./tests/claim-evidence.script.js') });
  atf.server.runServerSideScript({ $id: Now.ID['ai22-revision-step'], script: Now.include('./tests/revision-comparison.script.js') });
  atf.server.createUser({ $id: Now.ID['ai18-editor-user'], firstName: 'Suiko', lastName: 'Editor Test', roles: [editor] });
  atf.server.runServerSideScript({ $id: Now.ID['ai18-editor-step'], script: Now.include('./tests/everyday-editor.script.js') });
});

const legalWorkflow = Test({
  $id: Now.ID['be02-legal-workflow-test'],
  name: 'Suiko BE-02: exact-revision legal workflow',
  description: 'Uses separate Editor, assigned legal-only, unassigned legal-only and outsider accounts on fictional drafts.',
  failOnServerError: true,
}, atf => {
  const reviewer = atf.server.createUser({
    $id: Now.ID['be02-assigned-legal-user'], firstName: 'Suiko', lastName: 'Assigned Legal',
    roles: [legalReviewer], impersonate: false,
  });
  const unassigned = atf.server.createUser({
    $id: Now.ID['be02-unassigned-legal-user'], firstName: 'Suiko', lastName: 'Unassigned Legal',
    roles: [legalReviewer], impersonate: false,
  });
  const inactive = atf.server.createUser({
    $id: Now.ID['be02-inactive-legal-user'], firstName: 'Suiko', lastName: 'Inactive Legal',
    roles: [legalReviewer], fieldValues: { active: false }, impersonate: false,
  });
  const outsider = atf.server.createUser({
    $id: Now.ID['be02-legal-outsider'], firstName: 'Suiko', lastName: 'Legal Outsider',
    roles: [], impersonate: false,
  });
  const sender = atf.server.createUser({
    $id: Now.ID['be02-legal-workflow-user'],
    firstName: 'Suiko', lastName: 'Legal Workflow Editor', roles: [editor],
  });
  const submitted = atf.server.runServerSideScript({
    $id: Now.ID['be02-legal-workflow-step'],
    script: `(function () {
      var test = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts');
      outputs.table = 'x_2236136_suiko_ai_legal_task';
      outputs.record_id = test.runLegalRoutingRegression('${reviewer.user}', '${unassigned.user}', '${inactive.user}');
      return true;
    })();`,
  });
  atf.server.impersonate({ $id: Now.ID['be02-test-as-unassigned'], user: unassigned.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-unassigned'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runUnassignedLegalRegression('${submitted.record_id}', true);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-test-as-outsider'], user: outsider.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-outsider'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runUnassignedLegalRegression('${submitted.record_id}', false);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-test-as-reviewer'], user: reviewer.user });
  const cleared = atf.server.runServerSideScript({ $id: Now.ID['be02-check-older-clearance'], script: `(function () {
    outputs.table = 'x_2236136_suiko_ai_story';
    outputs.record_id = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runAssignedLegalRegression('${submitted.record_id}', false);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-return-to-editor'], user: sender.user });
  const fresh = atf.server.runServerSideScript({ $id: Now.ID['be02-check-fresh-routing'], script: `(function () {
    outputs.table = 'x_2236136_suiko_ai_legal_task';
    outputs.record_id = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runFreshLegalRoutingRegression('${cleared.record_id}', '${reviewer.user}');
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-review-newer-copy'], user: reviewer.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-changes-requested'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runAssignedLegalRegression('${fresh.record_id}', true);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-final-editor-check'], user: sender.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-current-status'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').verifyLegalChangesRequested('${cleared.record_id}');
    return true;
  })();` });
});

TestSuite({
  $id: Now.ID['ai-review-server-regression-suite'],
  name: 'Suiko AI: server review regressions',
  description: 'Server-only checks using fictional inputs and injected provider replies.',
  tests: [persistence, approvedRules, legalWorkflow],
});
