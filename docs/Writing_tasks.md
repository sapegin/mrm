# Writing your own tasks

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

[mrm-core](../packages/mrm-core) is an utility library created to write Mrm tasks, it has functions to work with common config files (JSON, YAML, INI, Markdown), npm dependencies, etc.

## With `mrm-core` and parameters

Let’s take a look at a more complex task.

```js
// 1 - Import utility helpers (could use any NPM package here).
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

// 2 - Define task configuration.
// Follows "inquirer" prompt definition.
const parameters = {
  eslintPreset: {
    type: 'input',
    message: 'ESLint preset to use as basis',
    initial: 'eslint:recommended'
  }
};

function task(config) {
  // 3 - Load task configs (either from prompt or other methods).
  const { eslintPreset } = config.values();

  // 4 - Define packages to install.
  const packages = ['eslint'];

  // 5 - Append custom eslint-config in case defined.
  if (eslintPreset !== 'eslint:recommended') {
    packages.push(`eslint-config-${eslintPreset}`);
  }

  // 6 - Create or load .eslintignore, and set basic ignores.
  lines('.eslintignore')
    .add(['node_modules/'])
    .save();

  // 7 - Create or load package.json.
  const pkg = packageJson();

  pkg
    // 8 - Set linting script.
    .setScript('lint', 'eslint . --cache --fix')
    // 9 - Set pretest script.
    .prependScript('pretest', 'npm run lint')
    // 10 - Save changes to package.json.
    .save();

  // 11 - Create or load .eslintrc.
  const eslintrc = json('.eslintrc');

  // 12 - Use Babel parser if the project depends on Babel.
  if (pkg.get('devDependencies.babel-core')) {
    const parser = 'babel-eslint';
    packages.push(parser);
    eslintrc.merge({ parser });
  }

  // 13 - Configure ESlint preset, if set (defaults to eslint:recommended).
  if (eslintPreset) {
    eslintrc.set('extends', eslintPreset);
  }

  // 14 - Save changes to .eslintrc.
  eslintrc.save();

  // 15 - Install new npm dependencies.
  install(packages);
}

// 16 - Configure task metadata (used by the `mrm` tool).
task.parameters = parameters;
task.description = 'Adds ESLint';

module.exports = task;
```

> Have a look at [`mrm-core` docs](../packages/mrm-core#api) for more utility helpers, and [the default tasks](../Readme.md#tasks) for reference.

### Configuration prompts

The example above shows a basic configuration prompt (`parameters`), but Mrm supports more complex prompts too. Have a look at [Inquirer docs](https://github.com/SBoudrias/Inquirer.js#documentation).
