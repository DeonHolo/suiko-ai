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
  atf.server.createUser({
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
  // Script steps read outputs at runtime. The ATF record IDs are the existing committed identities.
  atf.server.runServerSideScript({
    $id: Now.ID['be02-legal-workflow-step'],
    script: `(function () {
      var test = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts');
      outputs.table = 'x_2236136_suiko_ai_legal_task';
      outputs.record_id = test.runLegalRoutingRegression(String(steps('677c43527dd44fb6bf779d1833bc786c').user), String(steps('bf7c90ed4c0248318c78a162f7d5c43f').user), String(steps('ecdb1b53f52c4721b6463926d78fea40').user));
      return true;
    })();`,
  });
  atf.server.impersonate({ $id: Now.ID['be02-test-as-unassigned'], user: unassigned.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-unassigned'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runUnassignedLegalRegression(String(steps('48a7fca4b1f346548893cc2dde07a321').record_id), true);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-test-as-outsider'], user: outsider.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-outsider'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runUnassignedLegalRegression(String(steps('48a7fca4b1f346548893cc2dde07a321').record_id), false);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-test-as-reviewer'], user: reviewer.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-older-clearance'], script: `(function () {
    outputs.table = 'x_2236136_suiko_ai_story';
    outputs.record_id = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runAssignedLegalRegression(String(steps('48a7fca4b1f346548893cc2dde07a321').record_id), false);
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-return-to-editor'], user: sender.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-fresh-routing'], script: `(function () {
    outputs.table = 'x_2236136_suiko_ai_legal_task';
    outputs.record_id = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runFreshLegalRoutingRegression(String(steps('2f223d5e008a473baf352fe7e953a2ab').record_id), String(steps('677c43527dd44fb6bf779d1833bc786c').user));
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-review-newer-copy'], user: reviewer.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-changes-requested'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').runAssignedLegalRegression(String(steps('a4629dd519dc427e8d24767579635c42').record_id), true);
    return true;
  })();` });
  atf.server.createUser({ $id: Now.ID['be02-history-reader'], firstName: 'Suiko', lastName: 'Other Editor', roles: [editor], impersonate: true });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-history-fields'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').verifyOtherEditorHistory(String(steps('2f223d5e008a473baf352fe7e953a2ab').record_id));
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-final-editor-check'], user: sender.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-current-status'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').verifyLegalChangesRequested(String(steps('2f223d5e008a473baf352fe7e953a2ab').record_id));
    return true;
  })();` });
  atf.server.runServerSideScript({ $id: Now.ID['be02-route-final-version'], script: `(function () {
    outputs.table = 'x_2236136_suiko_ai_legal_task';
    outputs.record_id = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').routeCurrentLegalClearanceFixture(String(steps('2f223d5e008a473baf352fe7e953a2ab').record_id), String(steps('677c43527dd44fb6bf779d1833bc786c').user));
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-final-legal-role'], user: reviewer.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-final-clearance'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').clearCurrentLegalFixture(String(steps('72ba0dde52e5457ba07dc88a6b2148a1').record_id));
    return true;
  })();` });
  atf.server.impersonate({ $id: Now.ID['be02-editor-clearance-role'], user: sender.user });
  atf.server.runServerSideScript({ $id: Now.ID['be02-check-final-clearance'], script: `(function () {
    require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/legal-workflow-test.ts').verifyCurrentLegalClearance(String(steps('2f223d5e008a473baf352fe7e953a2ab').record_id));
    return true;
  })();` });
});

const archive = Test({
  $id: Now.ID['fe02-archive-guard-test'],
  name: 'Suiko FE-02: archive, restore and guarded deletion',
  description: 'Checks admin behavior as the suite runner, then uses dedicated Editor, Rules Editor and outsider fixtures. No changes to shared evidence.',
  failOnServerError: true,
}, atf => {
  // ATF cannot grant admin to a temporary user. Run this step before impersonation.
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-admin-step'], script: `(function () {
    var archive = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/archive-test.ts');
    stepResult.setOutputMessage(archive.runArchiveAdminRegression());
    return true;
  })();` });
  atf.server.createUser({ $id: Now.ID['fe02-archive-editor-user'], firstName: 'Suiko', lastName: 'Archive Editor', roles: [editor] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-story-step'], script: Now.include('./tests/archive-guard.script.js') });
  atf.server.createUser({ $id: Now.ID['fe02-archive-rules-user'], firstName: 'Suiko', lastName: 'Archive Rules', roles: [rulesEditor] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-rule-step'], script: Now.include('./tests/archive-guard.script.js') });
  atf.server.createUser({ $id: Now.ID['fe02-archive-outsider-user'], firstName: 'Suiko', lastName: 'Archive Outsider', roles: [] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-outsider-step'], script: Now.include('./tests/archive-guard.script.js') });
});

const editorInbox = Test({
  $id: Now.ID['editor-inbox-regression-test'],
  name: 'Suiko FE-01 / BE-01: Inbox and editor decisions',
  description: 'Checks both pages, version-bound decisions, and Editor access with fictional ATF fixtures.',
  failOnServerError: true,
}, atf => {
  atf.server.runServerSideScript({
    $id: Now.ID['editor-inbox-pagination-step'],
    script: `(function () {
      outputs.table = 'x_2236136_suiko_ai_story';
      outputs.record_id = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/story-workflow-test.ts').createInboxFixtures();
      return true;
    })();`,
  });
  atf.server.createUser({ $id: Now.ID['editor-inbox-editor-user'], firstName: 'Suiko', lastName: 'Inbox Editor', roles: [editor], impersonate: true });
  atf.server.runServerSideScript({
    $id: Now.ID['editor-inbox-editor-pagination-step'],
    script: Now.include('./tests/story-inbox-pagination.script.js'),
  });
  atf.server.runServerSideScript({
    $id: Now.ID['editor-inbox-editor-step'],
    script: Now.include('./tests/story-editor-workflow.script.js'),
  });
  atf.server.createUser({ $id: Now.ID['editor-inbox-outsider-user'], firstName: 'Suiko', lastName: 'Inbox Outsider', roles: [], impersonate: true });
  atf.server.runServerSideScript({
    $id: Now.ID['editor-inbox-outsider-step'],
    script: Now.include('./tests/story-editor-access.script.js'),
  });
});

TestSuite({
  $id: Now.ID['ai-review-server-regression-suite'],
  name: 'Suiko AI: server review regressions',
  description: 'Server-only checks using fictional inputs and injected provider replies.',
  tests: [persistence, approvedRules, archive, legalWorkflow, editorInbox],
});
