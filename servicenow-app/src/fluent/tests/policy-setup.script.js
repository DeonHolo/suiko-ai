(function(outputs, steps, stepResult) {
  var tests = require('x_2236136_suiko_ai/suiko-ai/0.0.1/src/server/editorial-rules-test.ts');
  stepResult.setOutputMessage(tests.runPolicySetupRegression());
  return true;
})(outputs, steps, stepResult);
