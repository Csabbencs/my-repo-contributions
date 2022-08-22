import { processLogLineByLine } from "../functions";

let testConfig = {};

beforeEach(async () => {
  testConfig = {
    logFilePath: "./__tests__/input/log-hello_world.csv",
    gitAuthor: "Your GitName",
    repo: "Your Repo",
    excludeFiles: [],
    excludeByRegex: [],
    includeByRegex: [],
  };
});

it("should pass log-hello.world.csv", async () => {
  const res = await processLogLineByLine(testConfig);

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-24",
        added: 75,
        removed: 32,
        changed: 107,
        noOfFileChanges: 5,
        noOfCommits: 1,
      },
      {
        commitDate: "2022-06-23",
        added: 4,
        removed: 0,
        changed: 4,
        noOfFileChanges: 1,
        noOfCommits: 1,
      },
    ],
    sum: { added: 79, removed: 32, changed: 111, fileChanges: 6, commits: 2 },
    warning: [],
  });
});

it("should not add up zero added or removed lines but should increase number of file changes", async () => {
  const res = await processLogLineByLine(testConfig);

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-24",
        added: 75,
        removed: 32,
        changed: 107,
        noOfFileChanges: 5,
        noOfCommits: 1,
      },
      {
        commitDate: "2022-06-23",
        added: 4,
        removed: 0,
        changed: 4,
        noOfFileChanges: 1,
        noOfCommits: 1,
      },
    ],
    sum: { added: 79, removed: 32, changed: 111, fileChanges: 6, commits: 2 },
    warning: [],
  });
});

it("should warn if log file encoding is not utf8", async () => {
  testConfig = {
    ...testConfig,
    logFilePath: "./__tests__/input/log-UTF_16_LE_BOM.csv",
  };

  const res = await processLogLineByLine(testConfig);

  expect(res.error.message).toEqual("Invalid encoding of log file. Make sure it is UTF-8.");
});

it("should exclude results (from a folder) by Regex", async () => {
  testConfig = {
    ...testConfig,
    excludeByRegex: ["src/services/"],
  };

  const res = await processLogLineByLine(testConfig);

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-24",
        added: 73,
        removed: 25,
        changed: 98,
        noOfFileChanges: 4,
        noOfCommits: 1,
      },
      {
        commitDate: "2022-06-23",
        added: 4,
        removed: 0,
        changed: 4,
        noOfFileChanges: 1,
        noOfCommits: 1,
      },
    ],
    sum: { added: 77, removed: 25, changed: 102, fileChanges: 5, commits: 2 },
    warning: [],
  });
});

it("should include results by Regex", async () => {
  testConfig = {
    ...testConfig,
    includeByRegex: ["src/services/"],
  };

  const res = await processLogLineByLine(testConfig);

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-24",
        added: 2,
        removed: 7,
        changed: 9,
        noOfFileChanges: 1,
        noOfCommits: 1,
      },
      {
        commitDate: "2022-06-23",
        added: 0,
        removed: 0,
        changed: 0,
        noOfFileChanges: 0,
        noOfCommits: 0,
      },
    ],
    sum: { added: 2, removed: 7, changed: 9, fileChanges: 1, commits: 1 },
    warning: [],
  });
});

it("should handle same day commit well", async () => {
  testConfig = {
    ...testConfig,
    logFilePath: "./__tests__/input/log-same_day_commit.csv",
  };

  const res = await processLogLineByLine(testConfig);

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-24",
        added: 75,
        removed: 32,
        changed: 107,
        noOfFileChanges: 5,
        noOfCommits: 1,
      },
      {
        commitDate: "2022-06-23",
        added: 5,
        removed: 1,
        changed: 6,
        noOfFileChanges: 2,
        noOfCommits: 2,
      },
    ],
    sum: { added: 80, removed: 33, changed: 113, fileChanges: 7, commits: 3 },
    warning: [],
  });
});

it("should warn if author is different", async () => {
  testConfig = {
    ...testConfig,
    logFilePath: "./__tests__/input/log-different_author.csv",
  };

  const res = await processLogLineByLine(testConfig);

  expect(res.warning[0].message).toEqual(
    "WARNING: Found a git author different to the one in config. You may want to check your git log command you use for retrieval."
  );
});
