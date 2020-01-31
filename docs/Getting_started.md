# Getting started with Mrm

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
mrm license --config:name "Gandalf the Grey" --config:email "gandalf@middleearth.com" --config:url "https://middleearth.com"
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
npx mrm license --config:name "Gandalf the Grey" --config:email "gandalf@middleearth.com" --config:url "https://middleearth.com"
```

## Configuration

Create `~/.mrm/config.json` or `~/dotfiles/mrm/config.json`:

```json5
{
  indent: 'tab', // "tab" or number of spaces
  readmeFile: 'Readme.md', // Name of readme file
  licenseFile: 'License.md', // Name of license file
  aliases: {
    // Aliases to run multiple tasks at once
    node: ['license', 'readme', 'editorconfig', 'gitignore']
  }
}
```

See [tasks docs](../Readme.md#tasks) for available config options.

_Config file isn’t required, you can also pass config options via command line. Default tasks will try to [read data](https://github.com/sapegin/user-meta) fom your npm and Git configuration._
