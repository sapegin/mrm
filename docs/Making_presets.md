<!-- Making presets -->

# Making your own presets

Preset is an npm package (or a directory) that contains a shared config and tasks.

The file structure looks like this:

```
.
├── task1
│   └── index.js
├── task2
│   └── index.js
├── config.json
├── package.json
```

And the `package.json` would look like this:

```json
{
  "name": "mrm-preset-default",
  "version": "0.1.0",
  "description": "Common tasks for Mrm",
  "author": {
    "name": "Artem Sapegin",
    "url": "https://sapegin.me"
  },
  "homepage": "https://github.com/sapegin/mrm/packages/mrm-preset-default",
  "repository": "sapegin/mrm",
  "license": "MIT",
  "engines": {
    "node": ">=4"
  },
  "main": "config.json",
  "files": ["config.json", "*/index.js"],
  "keywords": ["mrm", "mrm-preset"],
  "dependencies": {
    "mrm-core": "^2.1.3",
    "mrm-task-gitignore": "^0.1.0"
  }
}
```

See [Making tasks](./Making_tasks.md) to learn how to create Mrm tasks. To add a task to a preset put it into a `<TASK>/index.js` file in your preset package folder.

If you want to use a task from npm (or any default task), you should include it as a dependency. That way you can be sure that you’ll always have a task version that works for your project.

For example, if you want to use `mrm-task-gitignore` task, you need to create a `gitignore/index.js` file in your preset package folder:

```js
module.exports = require('mrm-task-gitignore');
```

The package name should should follow this pattern: `mrm-preset-<TASK>`, otherwise you’ll have to type full package name when you run a task:

```
mrm license --preset unicorn # mrm-preset-unicorn
mrm license --preset @mycompany/unicorn-preset # @mycompany/unicorn-preset
```
