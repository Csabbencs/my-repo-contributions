import { mergeResults } from "../functions";

it("should not merge insufficient files in folder output1", async () => {

  const res = await mergeResults("./__tests__/output1/");

  expect(res.error.message).toEqual("You need at least 2 files to merge results.");
});

it("should merge files in folder output2", async () => {
  const res = await mergeResults("./__tests__/output2/");

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-23",
        added: 6,
        removed: 1,
        changed: 7,
        noOfFileChanges: 2,
        noOfCommits: 2,
      },      
      {
        commitDate: "2022-06-24",
        added: 1,
        removed: 1,
        changed: 2,
        noOfFileChanges: 1,
        noOfCommits: 1,
      },
    ],
    sum: { added: 7, removed: 2, changed: 9, fileChanges: 3, commits: 3 },
    warning: [],
  });
});

it("should merge files in folder output3", async () => {
  const res = await mergeResults("./__tests__/output3/");

  expect(res).toEqual({
    daily: [
      {
        commitDate: "2022-06-23",
        added: 6,
        removed: 1,
        changed: 7,
        noOfFileChanges: 2,
        noOfCommits: 2,
      },       
      {
        commitDate: "2022-06-29",
        added: 6,
        removed: 2,
        changed: 8,
        noOfFileChanges: 3,
        noOfCommits: 2,
      },
      {
        commitDate: "2022-06-24",
        added: 1,
        removed: 1,
        changed: 2,
        noOfFileChanges: 1,
        noOfCommits: 1,
      },         
    ],
    sum: { added: 13, removed: 4, changed: 17, fileChanges: 6, commits: 5 },
    warning: [],
  });
});