# Marmot (mrm)

[![Build Status](https://travis-ci.org/sapegin/mrm.svg)](https://travis-ci.org/sapegin/mrm)
[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm)

Command line tool to help you keep dotfiles (`.gitignore`, `.eslintrc`, etc.) of all your open source project in sync.

## Features

* Will not overwrite your date if you don’t want
* Has tools to work with JSON, YAML, INI, Markdown and text files
* Has bunch customizable taks (see the list below)
* Easy to write your own tasks

## Motivation

Most of the available tools are template based. It works moderately well for new project generation but doesn’t work well for updating. Marmot’s approach is closer to codemods than templates.

## Installation

```
npm install -g mrm
```

## Usage

* `mrm` — Print list of task
* `mrm <task>` — Run taks

## Configuration

Create `~/.mrm/config.json` or `~/dotfiles/mrm/config.json`:

```json5
{
    "name": "Tobias Müller",
    "email": "tobias2000@gmail.com",
    "url": "http://tobias2000.io",
    "github": "tobias2000",
    "indent": "tab", // "tab" or number of spaces
    "readme", "Readme.md", // Name of readme file
    "license", "License.md", // Name of license file
    "aliases": {  // Aliases to run multiple tasks at once
        "node": ["license", "readme", "package", "editorconfig", "eslint", "gitignore"]
    }
}
```

## Tasks

### editorconfig

Adds `.editorconfig`.

### eslint

Adds `.eslintrc` and `.eslintignore`, adds npm script and inistalls dependencies.

Config options:

* `eslintPreset` — preset name (not npm package name, by default will instal `eslint:recommended` preset)

### gitignore

Adds `.gitignore` with `node_modules`, logs and artifacts of popular code editors.

### license

Adds MIT license file.

### lintstaged

Adds lint-staged: creates `.lintstagedrc`, sets up pre-commit Git hook and inistalls dependencies.

### package

Creates `package.json` and adds npm badge to Readme.

### readme

Creates readme file.

### travis

Creates `.travis.yml`and adds Travis CI badge to Readme.

## Custom tasks

Create either `~/.mrm/<taskname>/index.js` or `~/dotfiles/mrm/<taskname>/index.js`. If `<taskname>` is the same as one of the internal tasks, then your task will override internal one:

```js
const { /* ... */ } = require('mrm-core');
module.exports = function(config) {
  // config('name', 'default value') - config value
  // config() - all config values
};
module.exports.description = 'Taks description';
```

See [mrm-core](https://github.com/sapegin/mrm-core) library for useful functions for your tasks.

You can find [some examples here](https://github.com/sapegin/dotfiles/tree/master/mrm) or check [code of internal tasks](https://github.com/sapegin/mrm/tree/master/src/tasks).

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
