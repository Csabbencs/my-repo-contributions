import { mergeResults, writeResultFiles } from "./functions.js";

// merge.js has a different config file to index.js
import config from "./config-merge.js";

(async function () {
  const res = await mergeResults(config.directory);

  res && !res.error
    ? await writeResultFiles(res, config)
    : console.log(res.error, "\r\nMerging files terminated.");
})();