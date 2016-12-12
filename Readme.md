# Marmot (mrm)

[![npm](https://img.shields.io/npm/v/mrm.svg)](https://www.npmjs.com/package/mrm)

Command line tool to help you keep dotfiles (.gitignore, .eslintrc, etc.) of all your open source project in sync.

## Motivation

Most of the available tools are tepmplate based. It works moderately well for new project generation but doesn’t work well for updating. Marmot’s approach is closer to codemods than templates.

## Usage

Command | Result
------- | ------
`npm install -g mrm` | Installation
`mrm` | Print list of commands
`mrm <command>` | Run command

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

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[mrm](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
