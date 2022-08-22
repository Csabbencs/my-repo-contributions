# My Repo Contributions

Share your contribution to one or more, public or private repository in a way that is easy to understand.

## Benefits
- A standalone HTML page is made including your contributions to repositories
- Repositories can be public or private, shared or local
- Contributions from multiple repositories can be merged

<p style="margin: 20px" align="center">
  <img src="resources/readme-figure-1.png" />
</p>

## You need this tool when
- the repositories you work on are not hosted on GitHub
- the repositories you work on are private
- the repositories you work on are confidential and you want to make sure no confidential data gets out
- a few files or folders might be excluded from or included only in the result
- you have no rights to install some given CLI tools in the environment you work
- you find cumbersome to create mock repositories or install CLI tools to achieve the result
- you need a representation of result that is easy to understand by not techy people

## Side benefits
- public and private repo contribution data can be merged
- JSON export is also available
- HTML export follows the GitHub-style representation of contributions

## Output data that you can show off
- Added Lines per day
- Removed Lines per day
- Changed Lines per day
- Number of File Changes per day
- Number of Commits per day
- All the above summed up for the requested period (typically, your repo, all time)

## Requirements
- git
- node

## Install
You need no install.

## Settings

### logFilePath
Sometimes you want to get result of different logs, of different authors, or keep record of historical data.
By naming your log files differently in the folder "/input" and then adding them here you can run the program inputting the data from the log file you choose.

### gitAuthor
Contributor's name from git to include it in the result HTML.

### repo (config.js)
Repo name (or selection name according to excludeByRegex or includeByRegex) to include it in the result HTML.

### repo (config-merge.js)
This is how you name "All repositories I'm contributing to" in the result HTML when merging results from many repositories.

### excludeByRegex
Sometimes you want to exclude a given file that distorts the amount of your real contribution, i.e."package-lock.json".
Sometimes you want to exclude a whole folder, then you use a regular expression. I.e. this folder was not gitignored at the right time: "_test_results/".

### includeByRegex
Sometimes you want to show your contribution to a portion of a git repo only. As above, you can specify a given file or a regular expression. I.e. you want to separate contribution to tests you wrote while tests and source lies in the same repo.

***Note: to set the above visit files config.js and config-merge.js.***

## Usage: get results from a single repository
Step 1. Export the work you've done from git using the following command:  
```
git log --no-merges --author="Your Name" --pretty=format:"%h%x09%an%x09%ae%x09%ad%x09%as%x09%s" --numstat > log.csv
```

Step 2. Copy the file you get at step 1 into the folder "/input"  

Step 3. Run   
```
$ npm run start
```
or
```
$ node index.js
```

Step 4. Find HTML and json results in folder "/output" under the name "result-[repo from config.js]".

***Note that confidential data such as code or commit message never reaches the input of the script as it is already filtered by git when you retrieve data from the repo at step 1.***

## Usage: merge results from multiple repositories

***Prerequisite: you have already run the script for each repository of your choice, one by one, so by now in the folder "/output" you have a couple of files starting with the name "result-\*.json".***

Step 1. Run
```
$ npm run merge
```
or
```
$ node merge.js
```

Step 2. Find HTML and json results in folder "/output" under the name "result-[repo from config-merge.js]".

***Note that the merge happens for each and every file named "result-\*.json" in the folder "/output", so in case you have previous result, you may have to remove them from the folder. ***

## Troubleshooting
If you see unexpected error messages or results making no sense, you might have to check 
1. the encoding of log.csv. Unless it is UTF-8 without BOM, there is a chance that the prgram can't handle it. Convert it to UTF-8 in your favourite text editor.
2. the format of data in log.csv. The program can handle only one specific format exported from git. Make sure you added the correct --pretty=format to the git command.

## Why I made this tool
I needed a quick way to sum up the work I've done from multiple private repositories and present it in any easily digestable way for other who are not developers primarily.
I liked the GitHub-like representation of contributions but as the code I work on is not open source but confidential business data, I mustn't add into GitHub as a private repository. Not to mention, that the repositories themselves are not on GitHub.
I've installed a few CLI tools which could do some of I wanted but they were cumbersome to use and didn't provide a nice output to untechy people.
I've tried a few open-source programs from github with the same goal but none of them could provide the union of goals I mention above in combination with the kind of output data I needed.

## Contribute
Please do. Leave a message, like, share, fork if you find the tool useful. It'd be nice to hear feedback if the tool helped you present your contributions.

There is plenty room for improvements and features ideas, submit a pull request.

If you want to run tests or develop the app further then first run
```
$ npm i --save-dev
```

All tests in folder __tests__ must pass. So don't forget to run
```
$ npm test
```
and all your tests.

## License

[MIT license](https://opensource.org/licenses/MIT)