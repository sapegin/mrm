# FAQ

## How to use Mrm with Lerna?

To run a task for each package in a [Lerna](https://github.com/lerna/lerna) repository:

```bash
./node_modules/.bin/lerna exec -- mrm <TASK>
```

## How to infer user metadata, like user name or email?

Use the [user-meta](https://github.com/sapegin/user-meta) package to read user name, email and URL from `.npmrc` or `.gitconfig`:

```js
const meta = require('user-meta');
module.exports = function task(config) {
  const { name, email, url } = config
    .defaults(meta)
    .require('name', 'email', 'url')
    .values();
  /* ... */
};
```

## How to infer GitHub user name?

Use the [git-username](https://github.com/jonschlinkert/git-username) package:

```js
const gitUsername = require('git-username');
module.exports = function task(config) {
  const { github } = config
    .defaults({
      github: gitUsername()
    })
    .require('github')
    .values();
  /* ... */
};
```

## Config resolution rules

- `<DIR>/config.json` if `--dir <DIR>` command line option was passed
- `$HOME/dotfiles/mrm/config.json`
- `$HOME/.mrm/config.json`

if you’re passing a `--preset <PRESET>` command line option, then the only task directory will be:

- `mrm-preset-<PRESET>/config.json`

## Task resolution rules

- `<DIR>/<TASK>/index.js` if `--dir <DIR>` command line option was passed
- `$HOME/dotfiles/mrm/<TASK>/index.js`
- `$HOME/.mrm/<TASK>/index.js`
- `mrm-task-<TASK>/index.js`, where `mrm-task-<TASK>` is an npm package name

if you’re passing a `--preset <PRESET>` command line option, then the only task directory will be:

- `mrm-preset-<PRESET>/<TASK>/index.js`
