(function () {
    var test = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/archive-test.ts');
    var message = gs.hasRole('admin')
        ? test.runArchiveAdminRegression()
        : gs.hasRole('x_2236136_suiko_ai.rules_editor')
            ? test.runArchiveRuleRegression()
            : gs.hasRole('x_2236136_suiko_ai.editor')
                ? test.runArchiveStoryRegression()
                : test.runArchiveOutsiderRegression();
    stepResult.setOutputMessage(message);
    return true;
})();
