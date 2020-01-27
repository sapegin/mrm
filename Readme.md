# Mrm

[![Build Status](https://travis-ci.org/sapegin/mrm.svg)](https://travis-ci.org/sapegin/mrm) [![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm) [![Codecov](https://codecov.io/gh/sapegin/mrm/branch/master/graph/badge.svg)](https://codecov.io/gh/sapegin/mrm)

Command line tool to help you keep configuration (`package.json`, `.gitignore`, `.eslintrc`, etc.) of your open source projects in sync.

## Features

- Doesn’t overwrite your data unless you want to
- Minimal changes: keeps the original file formatting or read the style from EditorConfig
- Minimal configuration: tries to infer configuration from the project itself or from the environment
- [Customizable tasks](#tasks) for popular tools like ESLint, Prettier, lint-staged, etc. included
- [Custom tasks](docs/Writing_tasks.md) and [tools](packages/mrm-core/Readme.md) to work with JSON, YAML, INI, Markdown and new line separated text files
- Sharing tasks via npm and grouping them into [presets](#custom-presets)

![](https://d3vv6lp55qjaqc.cloudfront.net/items/1g0e2M3m2Y3j0m3B3n1t/Image%202017-06-20%20at%209.00.39%20PM.png)

## Motivation

Most of the available tools are template based. Template approach works moderately well for new project generation but doesn’t work well for updating. Mrm’s approach is closer to [codemods](https://github.com/facebook/codemod) than templates.

Read more in my article, [Automating open source project configuration with Mrm](https://blog.sapegin.me/all/mrm), or watch [my talk on Mrm](https://www.youtube.com/watch?v=5tHfAf4bRcM).

## Documentation

- [Getting started](docs/Getting_started.md)
- [Writing your own tasks](docs/Writing_tasks.md)
- [Sharing tasks via npm](docs/Sharing_tasks.md)
- [Custom presets](docs/Custom_presets.md)
- [FAQ](docs/FAQ.md)
- [Utilities to write codemods](packages/mrm-core/Readme.md)

## Tasks

These tasks are included by default:

<!-- textlint-disable terminology -->

- [codecov](packages/mrm-task-codecov)
- [contributing](packages/mrm-task-contributing)
- [editorconfig](packages/mrm-task-editorconfig)
- [eslint](packages/mrm-task-eslint)
- [gitignore](packages/mrm-task-gitignore)
- [jest](packages/mrm-task-jest)
- [license](packages/mrm-task-license)
- [lint-staged](packages/mrm-task-lint-staged)
- [package](packages/mrm-task-package)
- [prettier](packages/mrm-task-prettier)
- [readme](packages/mrm-task-readme)
- [semantic-release](packages/mrm-task-semantic-release)
- [styleguidist](packages/mrm-task-styleguidist)
- [stylelint](packages/mrm-task-stylelint)
- [travis](packages/mrm-task-travis)
- [typescript](packages/mrm-task-typescript)

<!-- textlint-enable -->

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
