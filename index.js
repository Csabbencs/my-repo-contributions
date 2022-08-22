import { processLogLineByLine, writeResultFiles } from "./functions.js";

// You may want to save different config files for later use. 
// This is the place to import one, other than the default "./config.js".
import config from "./config.js";

(async function () {
  const res = await processLogLineByLine(config);

  res && !res.error
    ? await writeResultFiles(res, config)
    : console.log(res.error, "\r\nReading file terminated.");
})();
