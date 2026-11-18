import '@servicenow/sdk/global';
import { Test, TestSuite } from '@servicenow/sdk/core';
import { editor, rulesEditor } from './review.now';

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

const archive = Test({
  $id: Now.ID['fe02-archive-guard-test'],
  name: 'Suiko FE-02: archive, restore and guarded deletion',
  description: 'Runs the archive actions as dedicated editor, rules editor, no-role and admin users. No model calls or changes to shared evidence.',
  failOnServerError: true,
}, atf => {
  atf.server.createUser({ $id: Now.ID['fe02-archive-editor-user'], firstName: 'Suiko', lastName: 'Archive Editor', roles: [editor] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-story-step'], script: Now.include('./tests/archive-guard.script.js') });
  atf.server.createUser({ $id: Now.ID['fe02-archive-rules-user'], firstName: 'Suiko', lastName: 'Archive Rules', roles: [rulesEditor] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-rule-step'], script: Now.include('./tests/archive-guard.script.js') });
  atf.server.createUser({ $id: Now.ID['fe02-archive-outsider-user'], firstName: 'Suiko', lastName: 'Archive Outsider', roles: [] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-outsider-step'], script: Now.include('./tests/archive-guard.script.js') });
  // The ATF step accepts a role record ID. This is the PDI's built-in admin role.
  atf.server.createUser({ $id: Now.ID['fe02-archive-admin-user'], firstName: 'Suiko', lastName: 'Archive Admin', roles: ['2831a114c611228501d4ea6c309d626d'] });
  atf.server.runServerSideScript({ $id: Now.ID['fe02-archive-admin-step'], script: Now.include('./tests/archive-guard.script.js') });
});

TestSuite({
  $id: Now.ID['ai-review-server-regression-suite'],
  name: 'Suiko AI: server review regressions',
  description: 'Server-only checks using fictional inputs and injected provider replies.',
  tests: [persistence, approvedRules, archive],
});
