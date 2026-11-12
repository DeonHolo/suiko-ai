export function workbenchSchemas(assessment) {
  const nested = JSON.parse(JSON.stringify(assessment));
  delete nested.$schema;
  delete nested.$defs;
  const response = {
    type: 'object', additionalProperties: false,
    required: ['overview', 'assessment', 'findings'],
    $defs: assessment.$defs,
    properties: {
      overview: { type: 'string', minLength: 1, maxLength: 1500 },
      overview_evidence: { type: 'array', maxItems: 6, items: { $ref: '#/$defs/evidence' } },
      assessment: nested,
      findings: {
        type: 'array', maxItems: 24,
        items: {
          type: 'object', additionalProperties: false,
          required: ['rule_id', 'summary', 'action', 'evidence'],
          properties: {
            rule_id: { type: 'string', minLength: 1, maxLength: 80 },
            summary: { type: 'string', minLength: 1, maxLength: 1500 },
            action: { type: 'string', minLength: 1, maxLength: 1500 },
            evidence: { type: 'array', minItems: 1, maxItems: 6, items: { $ref: '#/$defs/evidence' } },
          },
        },
      },
    },
  };
  const component = schema => ({ ...schema, $defs: assessment.$defs });
  return {
    validateReview: response,
    validateWorkbenchShell: {
      type: 'object', additionalProperties: false,
      required: response.required,
      properties: {
        overview: {}, overview_evidence: {}, findings: {},
        assessment: {
          type: 'object', additionalProperties: false,
          required: assessment.required,
          properties: Object.fromEntries(Object.keys(assessment.properties).map(key => [key, {}])),
        },
      },
    },
    validateWorkbenchOverview: component(response.properties.overview),
    validateWorkbenchOverviewEvidence: component({ ...response.properties.overview_evidence, minItems: 1 }),
    validateWorkbenchCoverage: component(nested.properties.coverage),
    validateWorkbenchChange: component(nested.properties.changes.items),
    validateWorkbenchPolicy: component(nested.properties.policy_assessments.items),
    validateWorkbenchFinding: component(response.properties.findings.items),
    validateWorkbenchSection: component(nested.properties.metadata_suggestions.properties.section),
    validateWorkbenchTags: component(nested.properties.metadata_suggestions.properties.tags),
    validateWorkbenchDescription: component(nested.properties.metadata_suggestions.properties.short_description),
  };
}
