# Mrm

[![Build Status](https://travis-ci.org/sapegin/mrm.svg)](https://travis-ci.org/sapegin/mrm)
[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm)

Command line tool to help you keep configuration (`package.json`, `.gitignore`, `.eslintrc`, etc.) of your open source projects in sync.

## Features

* Will not overwrite your data if you don’t want it to
* Tools to work with JSON, YAML, INI, Markdown and text files
* Bunch of [customizable tasks](#tasks) included
* Easy to write [your own tasks](#custom-tasks)
* Share tasks via npm and group them into [presets](#custom-presets)

![](https://d3vv6lp55qjaqc.cloudfront.net/items/1g0e2M3m2Y3j0m3B3n1t/Image%202017-06-20%20at%209.00.39%20PM.png)

## Table of contents

<!-- Update: npx markdown-toc -i Readme.md -->

<!-- toc -->

- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
- [Usage via npx](#usage-via-npx)
- [Configuration](#configuration)
- [Tasks](#tasks)
- [Writing custom tasks](#writing-custom-tasks)
- [Sharing tasks via npm](#sharing-tasks-via-npm)
- [Custom presets](#custom-presets)
- [Config resolution rules](#config-resolution-rules)
- [Task resolution rules](#task-resolution-rules)
- [Work with Lerna](#work-with-lerna)
- [Change log](#change-log)
- [Contributing](#contributing)
- [Authors and license](#authors-and-license)

<!-- tocstop -->

## Motivation

Most of the available tools are template based. Template approach works moderately well for new project generation but doesn’t work well for updating. Mrm’s approach is closer to [codemods](https://github.com/facebook/codemod) than templates.

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
  "name": "Gandalf the Grey",
  "email": "gandalf@middleearth.com",
  "url": "http://middleearth.com",
  "indent": "tab", // "tab" or number of spaces
  "readmeFile": "Readme.md", // Name of readme file
  "licenseFile": "License.md", // Name of license file
  "aliases": {  // Aliases to run multiple tasks at once
    "node": ["license", "readme", "package", "editorconfig", "eslint", "gitignore"]
  }
}
```

*Config file isn’t required, you can also pass config options via command line. Default tasks will try to [read data](https://github.com/sapegin/user-meta) fom your npm and Git configuration.*

## Tasks

These tasks are included by default:

* [codecov](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-codecov)
* [editorconfig](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-editorconfig)
* [eslint](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-eslint)
* [gitignore](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-gitignore)
* [jest](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-jest)
* [license](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-license)
* [lintstaged](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-lintstaged)
* [package](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-package)
* [readme](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-readme)
* [semantic-release](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-semantic-release)
* [styleguidist](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-styleguidist)
* [stylelint](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-stylelint)
* [travis](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-travis)
* [typescript](https://github.com/sapegin/mrm-tasks/tree/master/packages/mrm-task-typescript)

## Writing custom tasks

Create either `~/.mrm/<TASK>/index.js` or `~/dotfiles/mrm/<TASK>/index.js`. If `<TASK>` is the same as one of the default tasks your task will override an internal one.

```js
const { /* ... */ } = require('mrm-core');
const meta = require('user-meta');
function task(config, argv) {
  const { name, email } = config
    .defaults({ name: meta.name }) // Set “dynamic” default values (this will affect require() method below)
    .require('name', 'email') // Mark config values as required
    .values(); // Returns object with all config options
  // argv - command line arguments
};
task.description = 'Task description';
module.exports = task;
```

If your custom tasks have dependencies (such as `mrm-core`) you should initialize the `mrm` folder as an npm module and list your dependencies there:

```bash
cd ~/.mrm # or cd ~/dotfiles/mrm
npm init -y
npm install --save mrm-core
```

[mrm-core](https://github.com/sapegin/mrm-core) is an utility library created to write Mrm tasks, it has function to work with common config files (JSON, YAML, INI, Markdown), npm dependencies, etc.

You can find [some examples here](https://github.com/sapegin/dotfiles/tree/master/mrm) or check [code of default tasks](https://github.com/sapegin/mrm-tasks/tree/master/packages).

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
* `$HOME/.mrm/mrm/config.json`
* `mrm-preset-default/config.json`

if you’re passing a `--preset <PRESET>` command line option, then the only task directory will be:

* `mrm-preset-<PRESET>/config.json`

## Task resolution rules

* `<DIR>/<TASK>/index.js` if `--dir <DIR>` command line option was passed
* `$HOME/dotfiles/mrm/<TASK>/index.js`
* `$HOME/.mrm/mrm/<TASK>/index.js`
* `mrm-preset-default/<TASK>/index.js`

if you’re passing a `--preset <PRESET>` command line option, then the only task directory will be:

* `mrm-preset-<PRESET>/<TASK>/index.js`

## Work with Lerna

To run a task for each package in a [Lerna](https://github.com/lerna/lerna) repository:

```bash
./node_modules/.bin/lerna exec -- mrm <TASK>
```

## Change log

The change log can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
