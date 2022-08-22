import events from "events";
import fs from "fs";
import { promises as fsp } from "fs";
import readline from "readline";
import { generateD3 } from "./templates/template-html-d3.js";

export async function processLogLineByLine(config) {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(config.logFilePath),
      crlfDelay: Infinity,
    });

    let last = "";
    let added = 0;
    let removed = 0;
    let changed = 0;
    let commitDate = "";
    let lastCommitDate = "";
    let noOfCommits = 0;
    let noOfFileChanges = 0;
    let sumAdded = 0;
    let sumRemoved = 0;
    let sumChanged = 0;
    let sumNoOfFileChanges = 0;
    let sumNoOfCommits = 0;

    let resultJson = { daily: [], sum: [], warning: [] };

    let differentAuthorWarningEmittedYet = false;

    rl.on("line", (line) => {
      const col = line.split("\t");

      let isHeader = false;

      for (let i = 0; i < col.length; i++) {
        if (!col[i].length) {
          break;
        }

        if (col[i] === "-") {
          break;
        }

        // error
        if (col[i].charCodeAt(1) === 65533 || col[i].charCodeAt(1) === 65279) {
          rl.emit("error", new Error("Invalid encoding of log file. Make sure it is UTF-8."));
        }

        // warning
        if (col[1] !== config.gitAuthor && isHeader && !differentAuthorWarningEmittedYet) {
          differentAuthorWarningEmittedYet = true;
          const differentAuthorWarningMessage =
            "WARNING: Found a git author different to the one in config. You may want to check your git log command you use for retrieval.";
          console.log(differentAuthorWarningMessage);
          resultJson.warning.push({
            message: differentAuthorWarningMessage,
          });
        }

        if (col[i].length === 8) {
          // header line
          isHeader = true;

          // if previous round was numbers but now header then sum and store
          if (last === "NUMBERS" && i === 0) {
            // if new commitDate than before
            if (lastCommitDate !== col[4]) {
              if (changed > 0) noOfCommits++;

              // show result (commits' summary of a day)
              console.log(lastCommitDate, added, removed, changed, noOfFileChanges, noOfCommits);
              resultJson.daily.push({
                commitDate: lastCommitDate,
                added: added,
                removed: removed,
                changed: changed,
                noOfFileChanges: noOfFileChanges,
                noOfCommits: noOfCommits,
              });

              // sum
              sumAdded += added;
              sumRemoved += removed;
              sumChanged = sumAdded + sumRemoved;
              sumNoOfFileChanges += noOfFileChanges;
              sumNoOfCommits += noOfCommits;

              // reset
              added = 0;
              removed = 0;
              changed = 0;
              noOfFileChanges = 0;
              noOfCommits = 0;
            } else {
              if (changed > 0) noOfCommits++;
            }
          }
        } else if (isHeader && i === 4) {
          // date
          commitDate = col[4];
        } else if (!isHeader) {
          // check file in commit
          if (
            i === 2 &&
            !config.excludeByRegex.map((x) => col[2].match(x)).filter((x) => x !== null).length &&
            (!config.includeByRegex.length ||
              config.includeByRegex.map((x) => col[2].match(x)).filter((x) => x !== null).length)
          ) {
            added += parseInt(col[0]);
            removed += parseInt(col[1]);
            changed = added + removed;
            noOfFileChanges++;
          }
        }
      } // end for

      last = isHeader ? "HEADER" : "NUMBERS";
      lastCommitDate = commitDate;
    });

    await events.once(rl, "close").then(function () {
      if (changed > 0) noOfCommits++;

      // show last result after the loop has ended
      console.log(lastCommitDate, added, removed, changed, noOfFileChanges, noOfCommits);
      resultJson.daily.push({
        commitDate: lastCommitDate,
        added: added,
        removed: removed,
        changed: changed,
        noOfFileChanges: noOfFileChanges,
        noOfCommits: noOfCommits,
      });

      console.log(`Reading file ${config.logFilePath} done.`);

      // sum all
      console.log("Sum Added Lines:", sumAdded + added);
      console.log("Sum Removed Lines:", sumRemoved + removed);
      console.log("Sum Changed Lines:", sumChanged + changed);
      console.log("Sum of File Changes:", sumNoOfFileChanges + noOfFileChanges);
      console.log("Sum of Commits:", sumNoOfCommits + noOfCommits);
      const resultSum = {
        added: sumAdded + added,
        removed: sumRemoved + removed,
        changed: sumChanged + changed,
        fileChanges: sumNoOfFileChanges + noOfFileChanges,
        commits: sumNoOfCommits + noOfCommits,
      };
      resultJson.sum = resultSum;
    });

    return resultJson;
  } catch (err) {
    return { error: err };
  }
}

export async function writeResultFiles(resultJson, config) {
  const strippedRepo = config.repo.replace(/[|&;$%@"<>()+, ]/g, "_");

  // write result json
  const json = JSON.stringify(resultJson);
  await fsp.writeFile(`./output/result-${strippedRepo}.json`, json, "utf8");
  console.log("JSON created.");

  // write result into D3 html
  const htmlD3 = generateD3(resultJson, config.repo, config.gitAuthor);
  await fsp.writeFile(`./output/result-${strippedRepo}-d3.html`, htmlD3, "utf8");
  console.log("D3 html created.");
}

export async function mergeResults(directory) {
  try {
    // find all json files in folder result except for any ending example.json
    const jsonFiles = fs
      .readdirSync(directory)
      .filter(
        (allFilesPaths) => allFilesPaths.match(/\.json$/) !== null && allFilesPaths.match(/\.example.json$/) === null
      );

    let json1 = "";
    let json2 = "";
    let jsonFilesLoaded = [];

    let mergedArray = [];
    let mergedSumObject = {};

    if (jsonFiles.length <= 1) throw new Error("You need at least 2 files to merge results.")

    // loop through all json files
    for (let i = 0; i < jsonFiles.length - 1; i++) {
      // if json content is not in buffer yet then read and parse new json files
      json1 = jsonFilesLoaded.filter((x) => x.fileName === jsonFilesLoaded[i]).length
        ? jsonFilesLoaded[i].content
        : JSON.parse(fs.readFileSync(`${directory}${jsonFiles[i]}`, "utf8"));
      json2 = jsonFilesLoaded.filter((x) => x.fileName === jsonFilesLoaded[i + 1]).length
        ? jsonFilesLoaded[i + 1].content
        : JSON.parse(fs.readFileSync(`${directory}${jsonFiles[i + 1]}`, "utf8"));

      // add json content (that has just been read) to buffer
      if (jsonFilesLoaded.filter((x) => x.fileName === jsonFilesLoaded[i]).length) {
        jsonFilesLoaded.push({
          fileName: jsonFiles[i],
          content: json1,
        });
      }

      if (jsonFilesLoaded.filter((x) => x.fileName === jsonFilesLoaded[i + 1]).length) {
        jsonFilesLoaded.push({
          fileName: jsonFiles[i + 1],
          content: json2,
        });
      }

      // after the very first loop, use aggregated values instead of adding json1 data again
      if(i>0){
        json1.daily = mergedArray;
        json1.sum = mergedSumObject;
        json1.warning = [] // TODO
        mergedArray = [];
        mergedSumObject = {};        
      }

      let obj_json1_done = [];

      // start looping through the first json...
      for (let i in json1.daily) {
        let obj = {
          commitDate: json1.daily[i].commitDate,
          added: json1.daily[i].added,
          removed: json1.daily[i].removed,
          changed: json1.daily[i].changed,
          noOfFileChanges: json1.daily[i].noOfFileChanges,
          noOfCommits: json1.daily[i].noOfCommits,
        };

        // ... and find same commit dates in the second json
        for (let j in json2.daily) {
          if (json1.daily[i].commitDate == json2.daily[j].commitDate) {
            obj.added = json1.daily[i].added + json2.daily[j].added;
            obj.removed = json1.daily[i].removed + json2.daily[j].removed;
            obj.changed = json1.daily[i].changed + json2.daily[j].changed;
            obj.noOfFileChanges = json1.daily[i].noOfFileChanges + json2.daily[j].noOfFileChanges;
            obj.noOfCommits = json1.daily[i].noOfCommits + json2.daily[j].noOfCommits;
            obj_json1_done[json2.daily[j].commitDate] = true;
          }
        }

        mergedArray.push(obj);
      }

      // loop through commit data that lives only in the second json
      for (let j in json2.daily) {
        if (typeof obj_json1_done[json2.daily[j].commitDate] == "undefined") {
          mergedArray.push({
            commitDate: json2.daily[j].commitDate,
            added: json2.daily[j].added,
            removed: json2.daily[j].removed,
            changed: json2.daily[j].changed,
            noOfFileChanges: json2.daily[j].noOfFileChanges,
            noOfCommits: json2.daily[j].noOfCommits,
          });
        }
      }

      // aggregate json.sum
      mergedSumObject = {
        added: json1.sum.added + json2.sum.added,
        removed: json1.sum.removed + json2.sum.removed,
        changed: json1.sum.changed + json2.sum.changed,
        fileChanges: json1.sum.fileChanges + json2.sum.fileChanges,
        commits: json1.sum.commits + json2.sum.commits,
      };
    } // end for processing all json files

    return { daily: mergedArray, sum: mergedSumObject, warning: json1.warning.concat(json2.warning) };
  } catch (err) {
    return { error: err };
  }
}
