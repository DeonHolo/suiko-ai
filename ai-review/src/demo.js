import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { reviewArticle, ReviewValidationError } from './review.js';

function formatReport(request, assessment) {
  const statuses = {
    potential_conflict: 'Needs attention',
    no_potential_conflict_observed: 'No concern observed',
    not_assessable: 'Verify manually',
    not_applicable: 'Not applicable',
  };
  const rules = new Map(request.policy_pack.rules.map(rule => [rule.rule_id, rule]));
  const { section, tags, short_description: description } = assessment.metadata_suggestions;
  const sectionLabel = request.taxonomy.sections.find(item => item.id === section.suggested_id)?.label ?? 'No suggestion';
  const tagLabels = tags.suggested_ids.map(id => request.taxonomy.tags.find(item => item.id === id).label);
  const lines = [
    '# AI review demo', '',
    '**Mode:** Fixed example response. No live AI call was made.',
    `**Candidate:** ${request.candidate_revision.revision_id}`,
    `**Baseline:** ${request.baseline_revision?.revision_id ?? 'First draft'}`,
    `**Assessment status:** ${assessment.status}`, '',
    'This demonstrates local validation of a handcrafted response. Human editorial and legal decisions remain separate.', '',
    '## Changes', '',
  ];
  for (const change of assessment.changes) {
    lines.push(`- ${change.summary}`);
    for (const [label, references] of [['Before', change.before], ['After', change.after]]) {
      for (const reference of references) lines.push(`  - ${label} (${reference.revision_id}/${reference.segment_id}): ${reference.quote}`);
    }
  }
  if (assessment.changes.length === 0) lines.push('No revision changes reported.');
  lines.push('', '## Checklist', '');
  for (const rule of assessment.policy_assessments) {
    lines.push(`- **${statuses[rule.status]} — ${rules.get(rule.rule_id).title}:** ${rule.reason}`);
    if (rule.suggested_action) lines.push(`  - Next action: ${rule.suggested_action}`);
    for (const reference of rule.evidence) lines.push(`  - Evidence (${reference.revision_id}/${reference.segment_id}): ${reference.quote}`);
  }
  lines.push('', '## Suggested metadata', '',
    `- Section: ${sectionLabel}`,
    `- Tags: ${tagLabels.join(', ') || 'No suggestions'}`,
    `- Short description: ${description.suggested_text ?? 'No suggestion'}`,
    '', 'These values have not been applied to any article.');
  if (assessment.limitations.length > 0) lines.push('', '## Limitations', '', ...assessment.limitations.map(item => `- ${item}`));
  return `${lines.join('\n')}\n`;
}

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--json' && arg !== '--save')) {
  process.stderr.write('Usage: node src/demo.js [--json] [--save]\n');
  process.exitCode = 2;
} else {
  try {
    const request = JSON.parse(await readFile(new URL('../../contracts/ai-review.request.example.json', import.meta.url), 'utf8'));
    const example = JSON.parse(await readFile(new URL('../../contracts/ai-review.response.example.json', import.meta.url), 'utf8'));
    const assessment = await reviewArticle(request, { generate: async () => JSON.stringify(example.assessment) });
    const report = formatReport(request, assessment);
    if (args.includes('--save')) {
      const directory = new URL('../output/', import.meta.url);
      await mkdir(directory, { recursive: true });
      const target = new URL('demo-review.md', directory);
      await writeFile(target, report, 'utf8');
      process.stderr.write(`Saved fixture report: ${fileURLToPath(target)}\n`);
    }
    process.stdout.write(args.includes('--json') ? `${JSON.stringify({ mode: 'fixture', live_ai: false, schema_version: request.schema_version, request_id: request.request_id, assessment }, null, 2)}\n` : report);
  } catch (error) {
    const message = error instanceof ReviewValidationError ? `${error.code}: ${error.message}` : 'The offline demo could not complete.';
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
