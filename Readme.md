# Mrm

[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm) [![Codecov](https://codecov.io/gh/sapegin/mrm/branch/master/graph/badge.svg)](https://codecov.io/gh/sapegin/mrm) [![Node.js CI status](https://github.com/sapegin/mrm/workflows/Node.js%20CI/badge.svg)](https://github.com/sapegin/mrm/actions)

Command line tool to help you keep configuration (`package.json`, `.gitignore`, `.eslintrc`, etc.) of your open source projects in sync.

## Features

- Doesn’t overwrite your data unless you want to
- Minimal changes: keeps the original file formatting or read the style from EditorConfig
- Minimal configuration: tries to infer configuration from the project itself or from the environment
- [Customizable tasks](#tasks) for popular tools like ESLint, Prettier, lint-staged, etc. included
- [Custom tasks](https://mrm.js.org/docs/making-tasks) and [tools](https://mrm.js.org/docs/mrm-core) to work with JSON, YAML, INI, Markdown and new line separated text files
- Sharing tasks via npm and grouping them into [presets](https://mrm.js.org/docs/making-presets)

![](https://d3vv6lp55qjaqc.cloudfront.net/items/1g0e2M3m2Y3j0m3B3n1t/Image%202017-06-20%20at%209.00.39%20PM.png)

## Motivation

Most of the available tools are template based. Template approach works moderately well for new project generation but doesn’t work well for updating. Mrm’s approach is closer to [codemods](https://github.com/facebook/codemod) than templates.

Read more in my article, [Automating open source project configuration with Mrm](https://blog.sapegin.me/all/mrm), or watch [my talk on Mrm](https://www.youtube.com/watch?v=5tHfAf4bRcM).

## Documentation

- [Getting started](https://mrm.js.org/docs/getting-started)
- [Making your own tasks](https://mrm.js.org/docs/making-tasks)
- [Sharing tasks via npm](https://mrm.js.org/docs/sharing-tasks)
- [Making your own presets](https://mrm.js.org/docs/making-presets)
- [FAQ](https://mrm.js.org/docs/faq)
- [Utilities to write codemods](https://mrm.js.org/docs/mrm-core)

## Tasks

These tasks are [included by default](https://mrm.js.org/docs/mrm-preset-default):

<!-- textlint-disable terminology -->

- [ci](https://mrm.js.org/docs/mrm-task-ci)
- [codecov](https://mrm.js.org/docs/mrm-task-codecov)
- [contributing](https://mrm.js.org/docs/mrm-task-contributing)
- [dependabot](https://mrm.js.org/docs/mrm-task-dependabot)
- [editorconfig](https://mrm.js.org/docs/mrm-task-editorconfig)
- [eslint](https://mrm.js.org/docs/mrm-task-eslint)
- [gitignore](https://mrm.js.org/docs/mrm-task-gitignore)
- [jest](https://mrm.js.org/docs/mrm-task-jest)
- [license](https://mrm.js.org/docs/mrm-task-license)
- [lint-staged](https://mrm.js.org/docs/mrm-task-lint-staged)
- [package](https://mrm.js.org/docs/mrm-task-package)
- [prettier](https://mrm.js.org/docs/mrm-task-prettier)
- [readme](https://mrm.js.org/docs/mrm-task-readme)
- [semantic-release](https://mrm.js.org/docs/mrm-task-semantic-release)
- [styleguidist](https://mrm.js.org/docs/mrm-task-styleguidist)
- [stylelint](https://mrm.js.org/docs/mrm-task-stylelint)
- [travis](https://mrm.js.org/docs/mrm-task-travis)
- [typescript](https://mrm.js.org/docs/mrm-task-typescript)

<!-- textlint-enable -->

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Sponsoring

This software has been developed with lots of coffee, buy me one more cup to keep it going.

<a href="https://www.buymeacoffee.com/sapegin" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/lato-orange.png" alt="Buy Me A Coffee" height="51" width="217"></a>

## Contributing

Bug fixes are welcome, but not new features. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
