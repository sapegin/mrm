<!-- Getting started -->

# Getting started with Mrm

## Installation

```
npm install -g mrm
```

## Usage

Print a list available of tasks and aliases:

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

Run a task from a preset (`mrm-preset-unicorn` npm package, read more [about presets](./Making_presets.md)):

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

## Tasks, aliases, and presets

**Task** does a single useful thing. For example, adds ESLint to a project. See [all official tasks](../Readme.md#tasks).

To run a task, type:

**Alias** runs multiple tasks at the same time, one after another. You can [add aliases via the config file](#config-files).

**Preset** is a shared configuration published as an npm package, read more [about presets](./Making_presets.md)).

## Configuration

There are three ways for setting tasks configurations: **interactive mode**, **command line parameters**, and **config files**.

> See [tasks docs](../Readme.md#tasks) for available config options on official tasks.

### Interactive mode

Use the `-i` argument to enable interactive/prompt mode:

```shell
npx mrm eslint -i
```

This will prompt for all [ESLint Mrm task options](https://github.com/sapegin/mrm/tree/master/packages/mrm-task-eslint#options) prior to running the task. It will also use **command line parameters** and **config files** as defaults for each option.

**When to use:** use this configuration mode for one-time running Mrm (typically with `npx`) when you don't know available options upfront and don't want to create a config file.

### Command line parameters

You can pass any option as a command line parameters as follows:

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
