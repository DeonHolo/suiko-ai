import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeRuleDefinition, ruleApplicability, approvedRuleSnapshot, approvedRulesForReview, starterTemplates } from '../src/editorial-rules.js';

const manual = () => ({
  title: 'Preserve uncertainty', text: '  Keep “may” when the reporting is uncertain.\nDo not turn it into “will”.  ',
  priority: 'standard', formats: ['article'], content_kinds: ['news', 'opinion'], conditions: 'When a plan is discussed.',
  human_checks: [], origin: { kind: 'manual' },
});

test('five optional starter templates have editable definitions and no invented approval', () => {
  assert.equal(starterTemplates.length, 5);
  assert.equal(new Set(starterTemplates.map(rule => rule.template_id)).size, 5);
  for (const template of starterTemplates) {
    const saved = normalizeRuleDefinition({ ...template, origin: { kind: 'starter', template_id: template.template_id } });
    assert.equal(saved.text, template.text);
    assert.equal(saved.origin.kind, 'starter');
    assert.equal(saved.approval, undefined);
  }
});

test('manual instructions retain the editor wording and conditions', () => {
  const input = manual();
  const saved = normalizeRuleDefinition(input);
  assert.equal(saved.text, input.text);
  assert.equal(saved.conditions, input.conditions);
  input.formats.push('script');
  assert.deepEqual(saved.formats, ['article']);
});

test('invalid rule scope and incomplete policy origins are rejected', () => {
  for (const change of [
    { formats: [] }, { formats: ['pdf'] }, { formats: ['article', 'article'] }, { content_kinds: ['advert'] },
    { text: '  ' }, { text: 'a'.repeat(3001) }, { origin: { kind: 'starter', template_id: 'unknown' } },
    { origin: { kind: 'policy', policy_version_id: 'missing', passage_ids: [] } },
  ]) assert.throws(() => normalizeRuleDefinition({ ...manual(), ...change }), { code: 'INVALID_RULE' });
});

test('typed applicability explains excluded formats and kinds while retaining natural-language conditions', () => {
  const rule = normalizeRuleDefinition(manual());
  assert.equal(ruleApplicability(rule, { content_format: 'article', content_kind: 'news' }).applies, true);
  assert.equal(ruleApplicability(rule, { content_format: 'article', content_kind: 'news' }).reason, rule.conditions);
  const excluded = ruleApplicability(rule, { content_format: 'script', content_kind: 'sponsored' });
  assert.equal(excluded.applies, false);
  assert.match(excluded.reason, /script \/ sponsored/);
  assert.equal(ruleApplicability(rule, {}).applies, null);
});

test('an approval freezes the exact saved definition, version and editor', () => {
  const definition = manual();
  const snapshot = approvedRuleSnapshot('HEADLINE', definition, 'a'.repeat(32), 2, 'b'.repeat(32), '2026-11-12 12:40:00');
  definition.text = 'A later proposal changes this.';
  definition.formats.push('script');
  assert.equal(snapshot.definition.text, manual().text);
  assert.deepEqual(snapshot.definition.formats, ['article']);
  assert.equal(snapshot.version, 2);
  assert.equal(snapshot.approval.by, 'b'.repeat(32));
  assert.throws(() => approvedRuleSnapshot('HEADLINE', manual(), 'a'.repeat(32), 2, '', 'now'), { code: 'INVALID_RULE' });
});

test('a pending replacement does not change the wording used in reviews', () => {
  const approved = approvedRuleSnapshot('HEADLINE', manual(), 'a'.repeat(32), 1, 'b'.repeat(32), '2026-11-12 12:40:00');
  const state = { rule_id: 'HEADLINE', active: true, title: 'A new unapproved title', text: 'New unapproved wording.', approved };
  const rules = approvedRulesForReview([state, { rule_id: 'OFF', active: false, approved: null }]);
  assert.equal(rules.length, 1);
  assert.equal(rules[0].text, manual().text);
  assert.deepEqual(rules[0].applicability.formats, ['article']);
  assert.deepEqual(approvedRulesForReview([{ ...state, active: false }]), []);
  assert.throws(() => approvedRulesForReview([{ ...state, approved: null }]), { code: 'INVALID_RULE' });
});
