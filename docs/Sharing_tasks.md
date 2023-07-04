<!-- Sharing tasks -->

# Sharing tasks via npm

The basic file structure of a shared task looks like this:

```
.
├── index.js
├── package.json
```

`index.js` is the same as described in [Making tasks](./Making_tasks.md). And the `package.json` would look like this:

```json
{
  "name": "mrm-task-unicorn",
  "version": "0.1.0",
  "description": "Unicorn task for Mrm",
  "author": {
    "name": "Artem Sapegin",
    "url": "https://sapegin.me"
  },
  "homepage": "https://github.com/sapegin/mrm/tree/master/packages/mrm-task-unicorn",
  "repository": "sapegin/mrm",
  "license": "MIT",
  "engines": {
    "node": ">=4"
  },
  "main": "index.js",
  "files": ["index.js"],
  "keywords": ["mrm", "mrm-task", "unicorn"],
  "dependencies": {
    "mrm-core": "^2.1.3"
  }
}
```

The package name should should follow this pattern: `mrm-task-<TASK>`, otherwise you’ll have to type full package name when you run a task:

```bash
mrm unicorn # mrm-task-unicorn
mrm @mycompany/unicorn-task # @mycompany/unicorn-task
```
