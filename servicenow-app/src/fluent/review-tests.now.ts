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
  atf.server.createUser({ $id: Now.ID['ai18-editor-user'], firstName: 'Suiko', lastName: 'Editor Test', roles: [editor] });
  atf.server.runServerSideScript({ $id: Now.ID['ai18-editor-step'], script: Now.include('./tests/everyday-editor.script.js') });
});

TestSuite({
  $id: Now.ID['ai-review-server-regression-suite'],
  name: 'Suiko AI: server review regressions',
  description: 'Server-only checks using fictional inputs and injected provider replies.',
  tests: [persistence, approvedRules],
});
