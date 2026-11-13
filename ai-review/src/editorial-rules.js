import { ReviewValidationError } from './assessment-checks.js';
import { contentFormats, contentKinds } from './story-input.js';

export const supportedChecks = {
  text_review: 'Compare the supplied headline, story, captions and earlier version.',
  context_review: 'Use supplied briefs, interview excerpts and production notes as editor-provided context.',
  metadata_suggestions: 'Suggest allowed sections, tags and a public description for the editor to choose.',
  source_reading: 'Read supplied public links and retain the text. Paste an excerpt when the original source cannot be opened.',
  permissions: 'Read supplied permission notes; the editor confirms the actual permission or licence.',
};

const all = { formats: [...contentFormats], content_kinds: [...contentKinds] };
export const starterTemplates = [
  {
    template_id: 'headline-agreement', title: 'Headline and story agree', priority: 'standard', ...all,
    text: 'Check whether the headline and public story describe the same event, people and degree of certainty. Flag a potential conflict by showing the relevant passages. Preserve uncertainty expressed in the reporting.',
    conditions: '', human_checks: [],
  },
  {
    template_id: 'quotation-accuracy', title: 'Quotations match supplied material', priority: 'high', ...all,
    text: 'When public text quotes someone, compare the quotation with any relevant transcript, interview excerpt or source material supplied for this review. Flag meaningful wording or attribution differences. If the original wording is unavailable, ask the editor to confirm it.',
    conditions: 'Applies when the public text quotes a speaker or a written source.',
    requires_sources: true,
    human_checks: ['Supply the original quotation or confirm the wording when it is unavailable.'],
  },
  {
    template_id: 'claim-support', title: 'Important claims have supporting material', priority: 'high', ...all,
    text: 'For important externally checkable claims, assess how the supplied source passages or reporting context support each claim. Show the claim and relevant material. Distinguish apparent support, contradiction and missing information. Give the editor a useful next action; ordinary transitions and clearly identified opinion do not require a factual source.',
    conditions: 'Applies to important factual claims, including factual claims inside opinion or sponsored content.',
    requires_sources: true,
    human_checks: ['The editor decides whether the material is sufficient and trustworthy.'],
  },
  {
    template_id: 'sponsorship-disclosure', title: 'Paid relationships are visible', priority: 'high',
    formats: [...contentFormats], content_kinds: ['sponsored'],
    text: 'Check whether the public text clearly identifies the paid relationship described in the supplied brief or context. Flag a missing or conflicting disclosure. If the relationship is unclear, ask the editor to confirm it.',
    conditions: '', human_checks: ['Confirm the actual sponsor arrangement and the publication\'s required wording.'],
  },
  {
    template_id: 'outside-media', title: 'Outside media has permission context', priority: 'high', ...all,
    text: 'When the story or production context proposes using another person\'s photo, video or audio, check for a permission or licence note. Show the asset reference and ask for confirmation when the supplied context is insufficient. Staff-created material alone does not trigger this check.',
    conditions: 'Applies when an outside photo, video or audio asset is proposed.',
    human_checks: ['The editor confirms permission, licence terms and any required credit.'],
  },
].map(template => ({ ...template, formats: [...template.formats], content_kinds: [...template.content_kinds] }));

function invalid(message) {
  throw new ReviewValidationError('INVALID_RULE', message);
}
function text(value, max, label, required = false) {
  if (typeof value !== 'string' || [...value].length > max || (required && !value.trim())) {
    invalid(label + ' must be text' + (required ? ' with some wording' : '') + ', up to ' + max + ' characters.');
  }
  return value.replace(/\r\n?/g, '\n');
}
function choices(value, allowed, label) {
  if (!Array.isArray(value) || !value.length || value.length > allowed.length
      || new Set(value).size !== value.length || value.some(item => !allowed.includes(item))) {
    invalid('Choose at least one valid ' + label + '.');
  }
  return allowed.filter(item => value.includes(item));
}

export function normalizeRuleDefinition(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('Supply a rule to save.');
  if (!['high', 'standard'].includes(input.priority)) invalid('Choose a valid rule priority.');
  const origin = input.origin || { kind: 'manual' };
  if (!origin || typeof origin !== 'object' || !['manual', 'starter', 'policy'].includes(origin.kind)) invalid('Choose a valid rule origin.');
  let savedOrigin = { kind: origin.kind };
  if (origin.kind === 'starter') {
    if (!starterTemplates.some(template => template.template_id === origin.template_id)) invalid('This starter template could not be found.');
    savedOrigin.template_id = origin.template_id;
  }
  if (origin.kind === 'policy') {
    if (typeof origin.policy_version_id !== 'string' || !/^[a-f0-9]{32}$/.test(origin.policy_version_id)
        || !Array.isArray(origin.passage_ids) || !origin.passage_ids.length || origin.passage_ids.length > 6
        || origin.passage_ids.some(value => typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(value))) {
      invalid('The proposed rule needs its saved policy version and passage references.');
    }
    savedOrigin = { ...savedOrigin, policy_version_id: origin.policy_version_id, passage_ids: [...new Set(origin.passage_ids)] };
  }
  const confirmations = input.human_checks ?? [];
  if (!Array.isArray(confirmations) || confirmations.length > 6) invalid('Use up to six short human-confirmation notes.');
  if (input.requires_sources !== undefined && typeof input.requires_sources !== 'boolean') invalid('Choose whether the rule needs source material.');
  return {
    title: text(input.title, 160, 'The rule title', true).trim(),
    text: text(input.text, 3000, 'The rule instruction', true), priority: input.priority,
    formats: choices(input.formats, contentFormats, 'content format'),
    content_kinds: choices(input.content_kinds, contentKinds, 'content kind'),
    conditions: text(input.conditions ?? '', 1000, 'Additional conditions'),
    human_checks: confirmations.map(value => text(value, 240, 'A confirmation note', true)),
    ...(input.requires_sources === undefined ? {} : { requires_sources: input.requires_sources }),
    origin: savedOrigin,
  };
}

export function ruleApplicability(rule, revision) {
  if (!revision?.content_format || !revision.content_kind) {
    return { applies: null, reason: 'This older version has no saved format or content kind. Save a classified version before applying the approved rule scopes.' };
  }
  if (!rule.formats.includes(revision.content_format) || !rule.content_kinds.includes(revision.content_kind)) {
    return { applies: false, reason: 'This rule applies to ' + rule.formats.join(', ') + ' / ' + rule.content_kinds.join(', ')
      + '; this version is ' + revision.content_format + ' / ' + revision.content_kind + '.' };
  }
  return { applies: true, reason: rule.conditions || 'The saved format and content kind match this rule.' };
}

export function approvedRuleSnapshot(ruleId, definition, versionId, version, by, at, byName = '') {
  if (typeof ruleId !== 'string' || !/^[A-Za-z0-9_-]{1,80}$/.test(ruleId)
      || typeof versionId !== 'string' || !/^[a-f0-9]{32}$/.test(versionId)
      || !Number.isInteger(version) || version < 1 || typeof by !== 'string' || !/^[a-f0-9]{32}$/.test(by)
      || typeof at !== 'string' || !at.trim() || at.length > 100) invalid('The rule approval needs its exact saved version and editor.');
  return {
    rule_id: ruleId, definition: normalizeRuleDefinition(definition), version_id: versionId, version,
    approval: { by, at, ...(typeof byName === 'string' && byName.trim() ? { by_name: byName.slice(0, 160) } : {}) },
  };
}

export function approvedRulesForReview(states) {
  return states.filter(rule => rule.active).map(rule => {
    const snapshot = rule.approved;
    if (!snapshot || snapshot.rule_id !== rule.rule_id) invalid('An active rule needs its matching saved approval.');
    const definition = normalizeRuleDefinition(snapshot.definition);
    return {
      rule_id: snapshot.rule_id, title: definition.title, text: definition.text, priority: definition.priority,
      applicability: {
        formats: definition.formats, content_kinds: definition.content_kinds,
        conditions: definition.conditions, human_checks: definition.human_checks,
      },
    };
  });
}

export function reviewRulesCurrent(recorded, current) {
  if (!Array.isArray(recorded) || recorded.some(rule => !rule.rule_id || !rule.version_id)) return null;
  const saved = recorded.map(rule => rule.rule_id + ':' + rule.version_id).sort();
  const active = current.filter(rule => rule.active)
    .map(rule => rule.rule_id + ':' + rule.approved?.version_id).sort();
  return JSON.stringify(saved) === JSON.stringify(active);
}
