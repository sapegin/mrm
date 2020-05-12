<!-- Making tasks -->

# Making your own tasks

Create either `~/.mrm/<TASK>/index.js` or `~/dotfiles/mrm/<TASK>/index.js`. If `<TASK>` is the same as one of the default tasks your task will override a default one.

## Basic example

The simplest task could look like this:

```js
// Mrm module to work with new line separated text files
const { lines } = require('mrm-core');

function task() {
  // Read .gitignore if it exists
  lines('.gitignore')
    // Add lines that do not exist in a file yet,
    // but keep all existing lines
    .add(['node_modules/', '.DS_Store'])
    // Update or create a file
    .save();
}

task.description = 'Adds .gitignore';
module.exports = task;
```

Tasks can also be async by adding the `async` keyword or returning a `Promise`.

```js
async function task() {}

// or
function task() {
  return new Promise(() => {});
}
```

## With dependencies

If your tasks have dependencies (such as `mrm-core`) you should initialize the `mrm` folder as an npm module and list your dependencies there:

```bash
cd ~/.mrm # or cd ~/dotfiles/mrm
npm init -y
npm install --save mrm-core
```

[mrm-core](https://github.com/sapegin/mrm/tree/master/packages/mrm-core) is an utility library for writing Mrm tasks, it has functions to work with common config files (JSON, YAML, INI, Markdown), npm dependencies, etc.

## With `mrm-core` and parameters

Let’s take a look at a more complex task.

```js
// Import utility helpers (could use any npm package here).
const {
  // JSON files
  json,
  // package.json
  packageJson,
  // New line separated text files
  lines,
  // Install npm packages
  install
} = require('mrm-core');

// task() function gets task parameters object as the first argument
// (see `module.exports.parameters` at the end of the file).
module.exports = function task({ eslintPreset }) {
  // Define packages to install.
  const packages = ['eslint'];

  // Append custom eslint-config in case it's defined.
  if (eslintPreset !== 'eslint:recommended') {
    packages.push(`eslint-config-${eslintPreset}`);
  }

  // Create or load .eslintignore, and set basic ignores.
  lines('.eslintignore')
    .add(['node_modules/'])
    .save();

  // Create or load package.json.
  const pkg = packageJson();

  pkg
    // Set linting script.
    .setScript('lint', 'eslint . --cache --fix')
    // Set pretest script.
    .prependScript('pretest', 'npm run lint')
    // Save changes to package.json.
    .save();

  // Create or load .eslintrc.
  const eslintrc = json('.eslintrc');

  // Use Babel parser if the project depends on Babel.
  if (pkg.get('devDependencies.babel-core')) {
    const parser = 'babel-eslint';
    packages.push(parser);
    eslintrc.merge({ parser });
  }

  // Configure ESlint preset, if set (defaults to eslint:recommended).
  if (eslintPreset) {
    eslintrc.set('extends', eslintPreset);
  }

  // Save changes to .eslintrc.
  eslintrc.save();

  // Install new npm dependencies.
  install(packages);
};

// Configure task metadata (used by the `mrm` tool).

// Define task configuration (see "Configuration prompts" section below for details)
module.exports.parameters = {
  // Follows Inquirer.js questions format.
  eslintPreset: {
    // input, number, confirm, list, rawlist, expand, checkbox, password, editor
    type: 'input',
    message: 'ESLint preset to use as basis',
    default: 'eslint:recommended'
  }
};
// Description to show in the task list
module.exports.description = 'Adds ESLint';
```

Have a look at [mrm-core docs](https://github.com/sapegin/mrm/tree/master/packages/mrm-core#api) for more utility helpers, and [the default tasks](../Readme.md#tasks) for reference.

### Configuration prompts

The example above shows a basic configuration prompt:

```js
module.exports.parameters = {
  eslintPreset: {
    type: 'input',
    message: 'ESLint preset to use as basis',
    default: 'eslint:recommended'
  }
};
```

Mrm supports more complex prompts too — have a look at [Inquirer.js docs](https://github.com/SBoudrias/Inquirer.js#objects).

We pass all parameters to Inquirer.js, unless they have the `config` type:

```js
module.exports.parameters = {
  indent: {
    type: 'config',
    default: 'tab'
  }
};
```

The `default` can be a value, like in the example above, or a function that receives an object with config values and command line overrides:

```js
module.exports.parameters = {
  spaces: {
    type: 'input',
    message: 'Number of spaces for tab stop',
    default(options) {
      return options.input || Math.round(Math.random() * 10);
    }
  }
};
```

This is different from the default Inquirer.js behavior and works consistently in interactive and non-interactive modes.

Use the `validate()` method to make a parameter required:

```js
module.exports.parameters = {
  eslintPreset: {
    type: 'input',
    message: 'ESLint preset to use as basis',
    validate(value) {
      return value ? true : 'eslintPreset is required';
    }
  }
};
```

In this case the only ways to override the default walue are a config file or a command line parameter.

### Migrating from the legacy parameters to Inquirer.js

Calling `.defaults()`, `.required()` and `.values()` on the parameters object is deprecated in mrm-core X.X.

```js
module.exports = function task(config) {
  const {
    indent,
    prettierPattern,
    prettierOptions,
    prettierOverrides
  } = config
    .defaults({
      indent: 'tab'
    })
    .values();
  // ...
};
```

Mrm passes parameters to the task function as a plain object:

```js
module.exports = function task({
  indent,
  prettierPattern,
  prettierOptions,
  prettierOverrides
}) {
  // ...
};
```

Parameters are described using an [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#objects) object:

```js
module.exports.parameters = {
  indent: {
    type: 'input',
    message: 'Choose indentation style (tabs or number of spaces)',
    default: 'tab',
    choices: ['tab', 2, 4, 8]
  },
  prettierPattern: {
    type: 'input',
    message: 'Enter Prettier file glob pattern',
    default: 'auto'
  },
  prettierOptions: {
    type: 'config'
  },
  prettierOverrides: {
    type: 'config'
  }
};
```

See the previous section for more examples.
