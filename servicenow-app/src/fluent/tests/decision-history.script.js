(function () {
    var test = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/decision-history-test.ts');
    // Rules Editor contains Editor, so check the more specific role first.
    var message = gs.hasRole('admin')
        ? test.runDecisionAdminRegression()
        : gs.hasRole('x_2236136_suiko_ai.rules_editor')
            ? test.runDecisionRulesEditorRegression()
            : gs.hasRole('x_2236136_suiko_ai.editor')
                ? test.runDecisionEditorHistoryRegression()
                : gs.hasRole('x_2236136_suiko_ai.legal_reviewer')
                    ? test.runDecisionLegalOnlyRegression()
                    : test.runDecisionOutsiderRegression();
    stepResult.setOutputMessage(message);
    return true;
})();
