const config = {
/**
 * path to log file
 * 
 * Sometimes you want to get result of different logs, of different authors, or keep record of historical data.
 * By naming your log files differently in the folder /input and then adding them here you can run the program inputting the data from the log file you choose.
 */
  logFilePath: "./input/log.csv",

  // contributor's name from git
  gitAuthor: "Your GitName",

  // repo name (or selection name according to configs below)
  repo: "Your Repo",

  excludeByRegex: [
    /**
     * Sometimes you want to exclude a given file that distorts the amount of your real contribution. You do it like this, i.e:
     * "package-lock.json",
     * 
     * Sometimes you want to exclude a whole folder, then you use a regular expression. I.e. this folder was not gitignored at the right time:
     * "_test_results/",
     */
  ],

  includeByRegex: [
    /**
     * Sometimes you want to show your contribution to a portion of a git repo only. As above, you can specify a given file or 
     * a regular expression. I.e. you want to separate contribution to tests you wrote while tests and source lies in the same repo:
     * "src/__tests__/",
     */    
  ],
};

export default config;
