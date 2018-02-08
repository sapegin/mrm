# Mrm

[![Build Status](https://travis-ci.org/sapegin/mrm.svg)](https://travis-ci.org/sapegin/mrm)
[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm)

Command line tool to help you keep configuration (`package.json`, `.gitignore`, `.eslintrc`, etc.) of your open source projects in sync.

## Features

* Will not overwrite your data if you don’t want it to
* Minimal changes: will keep the original file formatting or read the style from EditorConfig
* Minimal configuration: will try to infer configuration from the project itself or from the environment
* Bunch of [customizable tasks](#tasks) included
* Tools to work with JSON, YAML, INI, Markdown and new line separated text files
* Easy to write [your own tasks](#custom-tasks)
* Share tasks via npm and group them into [presets](#custom-presets)

![](https://d3vv6lp55qjaqc.cloudfront.net/items/1g0e2M3m2Y3j0m3B3n1t/Image%202017-06-20%20at%209.00.39%20PM.png)

## Table of contents

<!-- Update: npx markdown-toc --maxdepth 3 -i Readme.md -->

<!-- toc -->

- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
- [Usage via npx](#usage-via-npx)
- [Configuration](#configuration)
- [Tasks](#tasks)
- [Writing your own tasks](#writing-your-own-tasks)
- [Sharing tasks via npm](#sharing-tasks-via-npm)
- [Custom presets](#custom-presets)
- [Config resolution rules](#config-resolution-rules)
- [Task resolution rules](#task-resolution-rules)
- [FAQ](#faq)
  * [How to use Mrm with Lerna?](#how-to-use-mrm-with-lerna)
  * [How to infer user metadata, like user name or email?](#how-to-infer-user-metadata-like-user-name-or-email)
  * [How to infer GitHub user name?](#how-to-infer-github-user-name)
- [Change log](#change-log)
- [Contributing](#contributing)
- [Authors and license](#authors-and-license)

<!-- tocstop -->

## Motivation

Most of the available tools are template based. Template approach works moderately well for new project generation but doesn’t work well for updating. Mrm’s approach is closer to [codemods](https://github.com/facebook/codemod) than templates.

Read more in my article, [Automating open source project configuration with Mrm](http://blog.sapegin.me/all/mrm), or watch [my talk on Mrm](https://www.youtube.com/watch?v=5tHfAf4bRcM).

## Installation

```
npm install -g mrm
```

## Usage

Print a list available of tasks:

```shell
mrm
```

Run a task or an alias

```shell
mrm gitignore
mrm license
```

Run multiple tasks:

```shell
mrm gitignore license
```

Override config options (or run without a config file):

```shell
mrm license --config:name "Gandalf the Grey" --config:email "gandalf@middleearth.com" --config:url "http://middleearth.com"
```

Custom config and tasks folder:

```shell
mrm license --dir ~/unicorn
```

Run a task from a preset (globally installed `mrm-preset-unicorn` npm package, read more [about preset](#custom-presets)):

```shell
mrm license --preset unicorn
```

## Usage via npx

If you have npm 5.3 or newer you can use mrm without installation:

```shell
npx mrm
npx mrm gitignore
npx mrm license --config:name "Gandalf the Grey" --config:email "gandalf@middleearth.com" --config:url "http://middleearth.com"
```

## Configuration

Create `~/.mrm/config.json` or `~/dotfiles/mrm/config.json`:

```json5
{
  "indent": "tab", // "tab" or number of spaces
  "readmeFile": "Readme.md", // Name of readme file
  "licenseFile": "License.md", // Name of license file
  "aliases": {  // Aliases to run multiple tasks at once
    "node": ["license", "readme", "editorconfig", "gitignore"]
  }
}
```

See [tasks docs](https://github.com/sapegin/mrm-tasks) for available config options.

*Config file isn’t required, you can also pass config options via command line. Default tasks will try to [read data](https://github.com/sapegin/user-meta) fom your npm and Git configuration.*

## Tasks

These tasks are included by default:

<!-- textlint-disable terminology -->

* [codecov](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-codecov)
* [contributing](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-contributing)
* [editorconfig](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-editorconfig)
* [eslint](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-eslint)
* [gitignore](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-gitignore)
* [jest](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-jest)
* [license](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-license)
* [lintstaged](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-lintstaged)
* [package](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-package)
* [prettier](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-prettier)
* [readme](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-readme)
* [semantic-release](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-semantic-release)
* [styleguidist](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-styleguidist)
* [stylelint](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-stylelint)
* [travis](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-travis)
* [typescript](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-typescript)

<!-- textlint-enable -->

## Writing your own tasks

Create either `~/.mrm/<TASK>/index.js` or `~/dotfiles/mrm/<TASK>/index.js`. If `<TASK>` is the same as one of the default tasks your task will override a default one.

The simplest task could look like this:

```js
// Mrm module to work with new line separated text files
const { lines } = require('mrm-core');

function task() {
  // Read .gitignore if it exists
  lines('.gitignore')
    // Add lines that do not exist in a file yet,
    // but keep all existing lines
    .add(['node_modules/', '.DS_Store'])
    // Update or create a file
    .save();
}

task.description = 'Adds .gitignore';
module.exports = task;
```

If your tasks have dependencies (such as `mrm-core`) you should initialize the `mrm` folder as an npm module and list your dependencies there:

```bash
cd ~/.mrm # or cd ~/dotfiles/mrm
npm init -y
npm install --save mrm-core
```

[mrm-core](https://github.com/sapegin/mrm-core) is an utility library created to write Mrm tasks, it has function to work with common config files (JSON, YAML, INI, Markdown), npm dependencies, etc.

Let’s take a look at a more complicated task:

```js
const {
  // JSON files
  json,
  // package.json
  packageJson,
  // New line separated text files
  lines,
  // Install npm packages
  install
} = require('mrm-core');

function task(config) {
  // Task options
  // mrm eslint --config:name pizza
  const { name, eslintPreset } = config
    .defaults({
      // Default value
      eslintPreset: 'eslint:recommended'
    })
    // Required option
    .require('name')
    .values();

  // Use custom preset package from npm
  const packages = ['eslint'];
  if (eslintPreset !== 'eslint:recommended') {
    packages.push(`eslint-config-${eslintPreset}`);
  }

  // Create or update .eslintignore
  lines('.eslintignore')
    .add(['node_modules/'])
    .save();

  // Read project’s package.json
  const pkg = packageJson();

  pkg
    // Add lint script
    .setScript('lint', 'eslint . --cache --fix')
    // Add pretest script
    .prependScript('pretest', 'npm run lint')
    .save();

  // Read .eslintrc if it exists
  const eslintrc = json('.eslintrc');

  // Use Babel parser if the project depends on Babel
  if (pkg.get('devDependencies.babel-core')) {
    const parser = 'babel-eslint';
    packages.push(parser);
    eslintrc.merge({ parser });
  }

  // Set preset
  eslintrc.set('extends', eslintPreset).save();

  // Install npm dependencies
  install(packages);
}

task.description = 'Adds ESLint';
module.exports = task;
```

There are more methods in `mrm-core` — check out [the docs](https://github.com/sapegin/mrm-core#api) and [the default tasks](https://github.com/sapegin/mrm-tasks).

## Sharing tasks via npm

The basic file structure of a shared task looks like this:

```
.
├── index.js
├── package.json
```

`index.js` is the same as described [in the previous section](#writing-custom-tasks). And the `package.json` would look like this:

```json
{
  "name": "mrm-task-unicorn",
  "version": "0.1.0",
  "description": "Unicorn task for Mrm",
  "author": {
    "name": "Artem Sapegin",
    "url": "http://sapegin.me"
  },
  "homepage": "https://github.com/sapegin/mrm-tasks/packages/mrm-task-unicorn",
  "repository": "sapegin/mrm-tasks",
  "license": "MIT",
  "engines": {
    "node": ">=4"
  },
  "main": "index.js",
  "files": [
    "index.js"
  ],
  "keywords": [
    "mrm",
    "mrm-task",
    "unicorn"
  ],
  "dependencies": {
    "mrm-core": "^2.1.3"
  }
}
```

The package name should should follow this pattern: `mrm-task-<TASK>`, otherwise you’ll have to type full package name when you run a task:

```
mrm unicorn # mrm-task-unicorn
mrm @mycompany/unicorn-task # @mycompany/unicorn-task
```

## Custom presets

Preset is an npm package (or a directory) that contains a config and tasks.

The file structure looks like this:

```
.
├── task1
│   └── index.js
├── task2
│   └── index.js
├── config.json
├── package.json
```

And the `package.json` would look like this:

```json
{
  "name": "mrm-preset-default",
  "version": "0.1.0",
  "description": "Common tasks for Mrm",
  "author": {
    "name": "Artem Sapegin",
    "url": "http://sapegin.me"
  },
  "homepage": "https://github.com/sapegin/mrm-tasks/packages/mrm-preset-default",
  "repository": "sapegin/mrm-tasks",
  "license": "MIT",
  "engines": {
    "node": ">=4"
  },
  "main": "config.json",
  "files": [
    "config.json",
    "*/index.js"
  ],
  "keywords": [
    "mrm",
    "mrm-task",
    "mrm-preset"
  ],
  "dependencies": {
    "mrm-core": "^2.1.3",
    "mrm-task-gitignore": "^0.1.0"
  }
}
```

See the [Writing custom tasks](#writing-custom-tasks) section above to learn how to write Mrm tasks. To add a task to a preset put it into a `<TASK>/index.js` file in your preset package folder.

If you want to use a task from npm (or any default task), you should include it as a dependency. That way you can be sure that you’ll always have a task version that works for your project.

For example, if you want to use `mrm-task-gitignore` task, you need to create a `gitignore/index.js` file in your preset package folder:

```js
module.exports = require('mrm-task-gitignore');
```

The package name should should follow this pattern: `mrm-preset-<TASK>`, otherwise you’ll have to type full package name when you run a task:

```
mrm license --preset unicorn # mrm-preset-unicorn
mrm license --preset @mycompany/unicorn-preset # @mycompany/unicorn-preset
```

## Config resolution rules

* `<DIR>/config.json` if `--dir <DIR>` command line option was passed
* `$HOME/dotfiles/mrm/config.json`
* `$HOME/.mrm/config.json`

if you’re passing a `--preset <PRESET>` command line option, then the only task directory will be:

* `mrm-preset-<PRESET>/config.json`

## Task resolution rules

* `<DIR>/<TASK>/index.js` if `--dir <DIR>` command line option was passed
* `$HOME/dotfiles/mrm/<TASK>/index.js`
* `$HOME/.mrm/<TASK>/index.js`
* `mrm-task-<TASK>/index.js`, where `mrm-task-<TASK>` is an npm package name
* `<TASK>` in [mrm-preset-default](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-preset-default)

if you’re passing a `--preset <PRESET>` command line option, then the only task directory will be:

* `mrm-preset-<PRESET>/<TASK>/index.js`

## FAQ

### How to use Mrm with Lerna?

To run a task for each package in a [Lerna](https://github.com/lerna/lerna) repository:

```bash
./node_modules/.bin/lerna exec -- mrm <TASK>
```

### How to infer user metadata, like user name or email?

Use the [user-meta](https://github.com/sapegin/user-meta) package to read user name, email and URL from `.npmrc` or `.gitconfig`:

```js
const meta = require('user-meta');
module.exports = function task(config) {
	const { name, email, url } = config
		.defaults(meta)
		.require('name', 'email', 'url')
		.values();
  /* ... */
}
```

### How to infer GitHub user name?

Use the [git-username](https://github.com/jonschlinkert/git-username) package:

```js
const gitUsername = require('git-username');
module.exports = function task(config) {
	const { github } = config
		.defaults({
			github: gitUsername(),
		})
		.require('github')
		.values();
  /* ... */
}
```

## Change log

The change log can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
