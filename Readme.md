# Marmot (mrm)

[![Build Status](https://travis-ci.org/sapegin/mrm.svg)](https://travis-ci.org/sapegin/mrm)
[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm)

Command line tool to help you keep dotfiles (`.gitignore`, `.eslintrc`, etc.) of all your open source projects in sync.

## Features

* Will not overwrite your data if you don’t want it to
* Has tools to work with JSON, YAML, INI, Markdown and text files
* Has bunch of customizable tasks (see the [list below](#tasks))
* Easy to write your own tasks

![](https://d3vv6lp55qjaqc.cloudfront.net/items/1g0e2M3m2Y3j0m3B3n1t/Image%202017-06-20%20at%209.00.39%20PM.png)

## Motivation

Most of the available tools are template based. It works moderately well for new project generation but doesn’t work well for updating. Marmot’s approach is closer to codemods than templates.

## Installation

```
npm install -g mrm
```

## Usage

* `mrm` — Print list of tasks
* `mrm <task>` — Run tasks

(You will need a configuration file first.)

## Configuration

Create `~/.mrm/config.json` or `~/dotfiles/mrm/config.json`:

```json5
{
    "name": "Tobias Müller",
    "email": "tobias2000@gmail.com",
    "url": "http://tobias2000.io",
    "github": "tobias2000",
    "indent": "tab", // "tab" or number of spaces
    "readme": "Readme.md", // Name of readme file
    "license": "License.md", // Name of license file
    "aliases": {  // Aliases to run multiple tasks at once
        "node": ["license", "readme", "package", "editorconfig", "eslint", "gitignore"]
    }
}
```

## Tasks

### codecov

Adds [Codecov](https://codecov.io/) to Travis CI config (see [travis](#travis) task) and Readme badge.

### editorconfig

[EditorConfig](http://editorconfig.org/): adds `.editorconfig`.

Config options:

* `indent` — indentation, `tab` or number of spaces (by default `tab`).

### eslint

[ESLint](http://eslint.org/): adds `.eslintrc`, adds npm script and installs dependencies.

Config options:

* `eslintPreset` — preset name (not npm package name, by default will install `eslint:recommended` preset)
* `eslintPeerDependencies` — additional dependencies to install (e.g. `['prettier', 'eslint-plugin-prettier']`)

### gitignore

Adds `.gitignore` with `node_modules`, logs and artifacts of popular code editors.

### jest

[Jest](https://facebook.github.io/jest/): adds npm scripts, updates `.gitignore`, `.npmignore`, `.eslintignore` with common patterns, installs dependencies. Tries to get rid of Mocha and AVA configs.

### license

Adds license file based on `license` field in `package.json`.

Config options:

* `license` — File name (by default `License.md`).

### lintstaged

[lint-staged](https://github.com/okonet/lint-staged): creates config in `package.json`, sets up pre-commit Git hook and installs dependencies.

### package

Creates `package.json`.

### readme

Creates Readme file.

Config options:

* `readme` — Name of the readme file (by default `Readme.md`).

### stylelint

[Stylelint](https://stylelint.io/): adds `.stylelintrc`, adds npm script and installs dependencies.

Config options:

* `stylelintPreset` — preset name (by default will install `stylelint-config-standard` preset)
* `stylelintExtensions` — file extensions to lint (by default `.css`)

### travis

[Travis CI](https://travis-ci.org/): creates `.travis.yml` and adds Travis CI badge to Readme.

## Custom tasks

Create either `~/.mrm/<taskname>/index.js` or `~/dotfiles/mrm/<taskname>/index.js`. If `<taskname>` is the same as one of the internal tasks, then your task will override internal one:

```js
const { /* ... */ } = require('mrm-core');
module.exports = function(config) {
  // config('name', 'default value') - config value
  // config() - all config values
};
module.exports.description = 'Task description';
```

If your custom tasks have dependencies (such as `mrm-core`) you should initialize the mrm folder as an npm module, and set your dependencies there:

```bash
cd ~/.mrm
# or: cd ~/dotfiles/mrm
npm init -y
npm install --save mrm-core
```

See [mrm-core](https://github.com/sapegin/mrm-core) library for useful functions for your tasks.

You can find [some examples here](https://github.com/sapegin/dotfiles/tree/master/mrm) or check [code of internal tasks](https://github.com/sapegin/mrm/tree/master/src/tasks).

## Change log

The change log can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
