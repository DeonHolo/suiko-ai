import '@servicenow/sdk/global';
import { Test, TestSuite } from '@servicenow/sdk/core';

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

TestSuite({
  $id: Now.ID['ai-review-server-regression-suite'],
  name: 'Suiko AI: server review regressions',
  description: 'Server-only checks using fictional inputs and injected provider replies.',
  tests: [persistence],
});
