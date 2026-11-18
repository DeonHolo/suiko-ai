(function () {
  var fixture = String(steps('586d4edb0d0d41f5a745ed95db358b9b').record_id);
  require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/story-workflow-test.ts').testInboxPagination(fixture);
  stepResult.setOutputMessage('Passed as Editor: partial-title search, 50 and 3 distinct rows, stable ordering, archived exclusion and invalid cursors.');
  return true;
})();
