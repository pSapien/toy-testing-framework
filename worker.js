const fs = require("fs");

async function runTest(testFile) {
  const code = await fs.promises.readFile(testFile, "utf8");
  const testResult = {
    success: false,
    errorMessage: null,
  };

  try {
    eval(code);
  } catch (err) {
    testResult.errorMessage = err.message;
  }

  return testResult;
}

module.exports = {
  runTest,
};
