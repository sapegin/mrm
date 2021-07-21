<!-- Core utils -->

# mrm-core

[![npm](https://img.shields.io/npm/v/mrm-core.svg)](https://www.npmjs.com/package/mrm-core)

Utilities to write codemods for config files (JSON, YAML, INI, Markdown, etc.). Can be used to make tasks for [Mrm](https://github.com/sapegin/mrm).

## Example

Add ESLint to your project:

```js
const { json, lines, packageJson, install } = require('mrm-core');

module.exports = function(config) {
  const preset = config('preset', 'tamia');
  const packages = ['eslint', `eslint-config-${preset}`];

  // .eslintrc
  const eslintrc = json('.eslintrc');
  if (!eslintrc.get('extends').startsWith(preset)) {
    eslintrc.set('extends', preset).save();
  }

  // .eslintignore
  lines('.eslintignore')
    .add('node_modules')
    .save();

  // package.json
  const pkg = packageJson()
    .setScript('lint', 'eslint . --fix')
    .setScript('pretest', 'npm run line')
    .save();

  // Install dependencies
  install(packages);
};
module.exports.description = 'Adds ESLint with a custom preset';
```

Read more in [the docs](https://github.com/sapegin/mrm/tree/master/packages/mrm-task-eslint), and this task is already included by default.

You can find more examples [in my dotfiles repository](https://github.com/sapegin/dotfiles/tree/master/mrm).

You don’t have to use mrm-core with mrm, you can run this tasks from your own code:

```js
const get = require('lodash/get');
const addEslint = require('./tasks/eslint');
const config = {
  preset: 'airbnb'
};
const getConfig = (prop, defaultValue) =>
  get(config, prop, defaultValue);
addEslint(getConfig);
```

## Installation

```
npm install mrm-core
```

## API

### Work with files

- Do not overwrite original files, unless you want to.
- All functions (except getters) can be chained.
- `save()` will create file if it doesn’t exist or update it with new data.
- `save()` will write file to disk only if the new content is different from the original file.
- `save()` will try to keep formatting (indentation, end of file new line) of the original file or use style from EditorConfig.

#### JSON

API:

```js
const { json } = require('mrm-core');
const file = json('file name', { default: 'values' });
file.exists(); // File exists?
file.get(); // Return everything
file.get('key.subkey', 'default value'); // Return value with given address
file.set('key.subkey', 'value'); // Set value by given address
file.set({ key: value }); // Replace JSON with given object
file.unset('key.subkey'); // Remove value by given address
file.merge({ key: value }); // Merge JSON with given object
file.save(); // Save file
file.delete(); // Delete file
```

Example:

```js
json('.eslintrc')
  .merge({
    extends: 'eslint-config-recommended'
  })
  .save();
```

#### YAML

API:

```js
const { yaml } = require('mrm-core');
const file = yaml(
  'file name', // File name
  { default: 'values' }, // Default value
  { version: '1.2' } // Options
);
file.exists(); // File exists?
file.get(); // Return everything
file.get('key.subkey', 'default value'); // Return value with given address
file.set('key.subkey', 'value'); // Set value by given address
file.set({ key: value }); // Replace JSON with given object
file.unset('key.subkey'); // Remove value by given address
file.merge({ key: value }); // Merge JSON with given object
file.save(); // Save file
file.delete(); // Delete file
```

Example:

```js
yaml('.travis.yml')
  .set('language', 'node_js')
  .set('node_js', [4, 6])
  .save();
```

#### INI

API:

```js
const { ini } = require('mrm-core');
const file = ini('file name', 'comment');
file.exists(); // File exists?
file.get(); // Return everything
file.get('section name'); // Return section value
file.set('section name', { key: value }); // Set section value
file.unset('section name'); // Remove section
file.save(); // Save file
file.save({ withSpaces: false }); // Disable spaces around =
file.delete(); // Delete file
```

Example:

```js
const { ini } = require('mrm-core');
ini('.editorconfig', 'editorconfig.org')
  .set('_global', { root: true })
  .set('*', {
    indent_style: 'tab',
    end_of_line: 'lf'
  })
  .save();
```

Result:

```ini
# editorconfig.org
root = true

[*]
indent_style = tab
end_of_line = lf
```

#### New line separated text files

API:

```js
const { lines } = require('mrm-core');
const file = lines('file name', ['default', 'values']);
file.exists(); // File exists?
file.get(); // Return everything
file.set(['line 1', 'line 2', 'line 3']); // Set file lines, overwrite existing
file.add('new'); // Add new line
file.add(['new', 'lines']); // Add multiple news lines
file.remove('new'); // Remove line
file.remove(['new', 'lines']); // Remove multiple lines
file.save(); // Save file
file.delete(); // Delete file
```

Example:

```js
lines('.eslintignore')
  .add('node_modules')
  .save();
```

#### Markdown

**Note:** use `template` function to create Markdown files.

API:

```js
const { markdown } = require('mrm-core');
const file = markdown('file name');
file.exists(); // File exists?
file.get(); // Return file content
// Add a badge at the beginning of the file (below header)
file.addBadge('image URL', 'link URL', 'alt text');
// Remove a badge when the predicate function returns true
file.removeBadge(({ imageUrl, linkUrl, altText }) =>
  imageUrl.startsWith('https://travis-ci.org')
);
file.save(); // Save file
file.delete(); // Delete file
```

Example:

```js
const name = 'pizza';
markdown('Readme.md')
  .addBadge(
    `https://travis-ci.org/${config('github')}/${name}.svg`,
    `https://travis-ci.org/${config('github')}/${name}`,
    'Build Status'
  )
  .save();
```

#### Plain text templates

Templates use ECMAScript [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) syntax.

API:

```js
const { template } = require('mrm-core');
const file = template('file name', 'template file name');
file.exists(); // File exists?
file.get(); // Return file content
file.apply({ key: 'value' }); // Replace template tags with given values
file.save(); // Save file
file.delete(); // Delete file
```

Example:

```js
template('License.md', path.join(__dirname, 'License.md'))
  .apply(config(), {
    year: new Date().getFullYear()
  })
  .save();
```

Template:

```
The MIT License
===============

Copyright ${year} ${name} (${url}), contributors

Permission is hereby granted, free of charge, to any person obtaining...
```

### Special files

#### package.json

API:

```js
const { packageJson } = require('mrm-core');
const file = packageJson({ default: 'values' });
file.exists(); // File exists?
file.get(); // Return everything
file.getScript('test'); // Return script
file.getScript('test', 'eslint'); // Return a subcommand of a script
file.setScript('test', 'eslint --fix'); // Replace a script with a command: a -> b
file.appendScript('test', 'eslint --fix'); // Append command to a script: a -> a && b
file.prependScript('test', 'eslint --fix'); // Prepend a script with a command: a -> b && a
file.removeScript('test'); // Remove script
file.removeScript(/^mocha|ava$/); // Remove all scripts that match a regexp
file.removeScript('test', /b/); // Remove subcommands from a script: a && b -> a
file.save(); // Save file
file.delete(); // Delete file
// All methods of json() work too
```

**Note:** subcommand is a command between `&&` in an npm script. For example, `prettier --write '**/*.js' && eslint . --fix` has two subcommands: `prettier…` and `eslint…`.

Example:

```js
packageJson()
  .appendScript('lint', 'eslint . --ext .js --fix')
  .save();
```

### File system helpers

```js
const { copyFiles, deleteFiles, makeDirs } = require('mrm-core');
copyFiles('source dir', 'file name'); // Copy file
copyFiles('source dir', ['file name 1', 'file name 2']); // Copy files
copyFiles('source dir', 'file name', { overwrite: false }); // Do not overwrite
deleteFiles('file name 1'); // Delete file or folder
deleteFiles(['file name 1', 'folder name 1']); // Delete files or folders
makeDirs('dir name'); // Create folder
makeDirs(['dir name 1', 'dir name 2']); // Create folders
```

### Install and uninstall npm, Yarn, or pnpm packages

Installs npm package(s) and saves them to `package.json` if they aren’t installed yet or not satisfying range.

```js
const { install } = require('mrm-core');
install('eslint'); // Install to devDependencies
install(['tamia', 'lodash'], { dev: false }); // Install to dependencies
install({ lodash: '^4.17.3' }); // Install particular version
install(['lodash'], {
  versions: { lodash: '^4.17.3', other: '1.0.0' }
}); // Install particular version
install(['github/repo']); // Install non-registry package without version
```

**Note:** Works with all [semver](https://semver.org/) ranges, like `1.2.3`, `^1.2.0` or `>=2`.

Uninstalls npm package(s) and removes them from `package.json`:

```js
const { uninstall } = require('mrm-core');
uninstall('eslint'); // Uninstall from devDependencies
uninstall(['tamia', 'lodash'], { dev: false }); // Uninstall from dependencies
```

To use Yarn pass `yarn: true`:

```js
const { install, uninstall } = require('mrm-core');

uninstall(['eslint'], { yarn: true });
install(['standard'], { yarn: true });
```

With Yarn Berry, pass `yarnBerry: true` and for pnpm, pass `pnpm: true`.

### Utilities

Infers style (indentation, new line at the end of file) from a source code or reads from the `.editorconfig` file.

```js
const {
  inferStyle,
  getStyleForFile,
  getIndent,
  format
} = require('mrm-core');
inferStyle('for (;;) {\n  alert(1);\n}\n');
// => { insert_final_newline: true, indent_style: 'space', indent_size: 2 }
getStyleForFile('test.js');
// => { insert_final_newline: false, indent_style: 'tab', indent_size: 'tab' }
getIndent({ indent_style: 'space', indent_size: 2 });
// => '  '
format('alert(1)\n', { insert_final_newline: false });
// => 'alert(1)'
// Only insert_final_newline is supported
```

Get file extensions list from a command like `eslint . --fix --ext .js,.jsx`:

```js
const { getExtsFromCommand } = require('mrm-core');
getExtsFromCommand(`eslint . --fix --ext .js,.jsx`, 'ext');
// => ['js', 'jsx']
getExtsFromCommand(`prettier --write '**/*.js'`);
// => ['js']
```

### Custom error class: `MrmError`

Use this class to notify user about expected errors in your tasks. It will be printed without a stack trace and will abort task.

```js
const { MrmError } = require('mrm-core');
if (!fs.existsSync('.travis.yml')) {
  throw new MrmError('Run travis task first');
}
```

## Changelog

The changelog can be found on the [Releases page](https://github.com/sapegin/mrm/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
