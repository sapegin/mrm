# Writing your own tasks

Create either `~/.mrm/<TASK>/index.js` or `~/dotfiles/mrm/<TASK>/index.js`. If `<TASK>` is the same as one of the default tasks your task will override a default one.

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

If your tasks have dependencies (such as `mrm-core`) you should initialize the `mrm` folder as an npm module and list your dependencies there:

```bash
cd ~/.mrm # or cd ~/dotfiles/mrm
npm init -y
npm install --save mrm-core
```

[mrm-core](../packages/mrm-core) is an utility library created to write Mrm tasks, it has functions to work with common config files (JSON, YAML, INI, Markdown), npm dependencies, etc.

Let’s take a look at a more complicated task:

```js
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

function task(config) {
  // Task options
  // mrm eslint --config:name pizza
  const { name, eslintPreset } = config
    .defaults({
      // Default value
      eslintPreset: 'eslint:recommended'
    })
    // Required option
    .require('name')
    .values();

  // Use custom preset package from npm
  const packages = ['eslint'];
  if (eslintPreset !== 'eslint:recommended') {
    packages.push(`eslint-config-${eslintPreset}`);
  }

  // Create or update .eslintignore
  lines('.eslintignore')
    .add(['node_modules/'])
    .save();

  // Read project’s package.json
  const pkg = packageJson();

  pkg
    // Add lint script
    .setScript('lint', 'eslint . --cache --fix')
    // Add pretest script
    .prependScript('pretest', 'npm run lint')
    .save();

  // Read .eslintrc if it exists
  const eslintrc = json('.eslintrc');

  // Use Babel parser if the project depends on Babel
  if (pkg.get('devDependencies.babel-core')) {
    const parser = 'babel-eslint';
    packages.push(parser);
    eslintrc.merge({ parser });
  }

  // Set preset
  eslintrc.set('extends', eslintPreset).save();

  // Install npm dependencies
  install(packages);
}

task.description = 'Adds ESLint';
module.exports = task;
```

There are more methods in `mrm-core` — check out [the docs](../packages/mrm-core#api) and [the default tasks](../Readme.md#tasks).
