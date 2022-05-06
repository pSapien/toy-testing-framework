const { cpus } = require("os");
const fs = require("fs");
const { join } = require("path");
const colors = require("colors");

const Haste = require("jest-haste-map").default;
const JestWorker = require("jest-worker").Worker;

// const { runTest } = require("./worker");
const root = process.cwd();

/**
 * search for test files in the file system
 * the good thing about using Haste is, it combines with watchman
 * to only give you the files that have changed
 */
const hasteMapOptions = {
  /**
   * this is the root directory which haste should look on when anything changes
   */
  rootDir: root,

  /**
   * this is the sub directory which haste look at
   * this is important for big monorepo projects, which has multiple sub directories
   */
  roots: [root],

  maxWorkers: cpus().length,

  /**
   * legacy thingy that was supposed to used by React Native
   */
  platforms: [],

  /**
   * just look at the js files
   */
  extensions: ["js"],

  name: "toy-testing-framework",
};

(async function main() {
  const worker = new JestWorker(join(root, "worker.js"), {
    enableWorkerThreads: true,
  });

  const hasteMap = new Haste(hasteMapOptions);
  await hasteMap.setupCachePath(hasteMapOptions);

  const { hasteFS } = await hasteMap.build();
  const testFilesSet = hasteFS.matchFilesWithGlob(["**/*.test.js"]);

  for await (const testFile of testFilesSet) {
    const { success, errorMessage } = await worker.runTest(testFile);
    const status = success
      ? colors.green.inverse(" PASS ")
      : colors.red.inverse(" FAILED ");

    console.log(`${status} ${colors.dim(testFile)}`);

    if (!success) {
      console.warn(errorMessage);
    }
  }

  worker.end();
})();
