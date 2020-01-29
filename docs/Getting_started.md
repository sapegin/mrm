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

There are three ways for setting tasks configurations: **interactive mode**; **command line parameters**; **config files**.

> See [tasks docs](../Readme.md#tasks) for available config options on core tasks.

### Interactive mode

Use the `-i` argument to enable interactive/prompt mode:

```shell
npx mrm eslint -i
```

This will prompt for all [ESLint Mrm task configs](https://github.com/sapegin/mrm/tree/master/packages/mrm-task-eslint#options) prior to running the task. It will also use **command line parameters** and **config files** as defaults for each option.

**When to use:** use this configuration mode for one-time running mrm (typically with `npx`) when you don't know available options upfront and don't want to create files on your user's root dir.

> **:warning::** This configuration mode was introduced on version `2.1.0`, and requires tasks define compatibility with this feature. Core tasks are in the process of upgrading, and current status can be followed on [issue #55]()

### Command line paramenters

You can pass any configuration as a command line parameter as follows, respecting the `--config:` prefix:

```shell
npx mrm license --config:name "Gandalf the Grey"
```

This will ultimately set the `name` config for this single task execution.

**When to use:** when you know upfront all the configuration names and expected values; when you are running `mrm` on CI.

### Config files

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

**When to use:** when you often use the same configuration (usually when you scaffold new projects frequently); when you want to define sets of default task aliases.
