# mrm-task-jest

[Mrm](https://github.com/sapegin/mrm) task that adds [Jest](https://facebook.github.io/jest/).

Supports Babel (via [babel-jest](https://github.com/facebook/jest/tree/master/packages/babel-jest)) and TypeScript (via [ts-jest](https://github.com/kulshekhar/ts-jest)).

## What it does

- Adds npm scripts
- Updates `.gitignore`, `.npmignore`, `.eslintignore` with common patterns
- Creates a sample test file, `test.js`, when the project has `index.js` in the root folder
- Tries to get rid of Mocha and AVA configs and dependencies
- Installs dependencies

## Usage

```
npm install -g mrm mrm-task-jest
mrm jest
```

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
