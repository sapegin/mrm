# Marmot (mrm)

[![Build Status](https://travis-ci.org/sapegin/mrm.svg)](https://travis-ci.org/sapegin/mrm)
[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm)

Command line tool to help you keep dotfiles (`.gitignore`, `.eslintrc`, etc.) of all your open source project in sync.

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

```json
{
    "name": "Tobias Müller",
    "email": "tobias2000@gmail.com",
    "url": "http://tobias2000.io",
    "github": "tobias2000",
    "aliases": {
        "node": ["license", "readme", "contributing", "package", "editorconfig", "eslint", "gitignore"]
    }
}
```

## Custom tasks

Create eather `~/.mrm/<taskname>/index.js` or `~/dotfiles/mrm/<taskname>/index.js`. If `<taskname>` is the same as one of the internal tasks, then your task will override internal one.

You can find [some examples here](https://github.com/sapegin/dotfiles/tree/master/mrm) or check [code of internal tasks](https://github.com/sapegin/mrm/tree/master/src/tasks).

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
