# mrm-task-travis

[Mrm](https://github.com/sapegin/mrm) task that adds [Travis CI](https://travis-ci.org/).

## What it does

- Creates `.travis.yml`
- Adds Travis CI badge to the Readme

## Usage

```
npm install -g mrm mrm-task-travis
mrm travis
```

## Options

See [Mrm docs](https://github.com/sapegin/mrm#usage) for more details.

### `github` (default: extracted from `.git/config` file)

Your GitHub user name.

### `readmeFile` (default: `Readme.md`)

Name of the Readme file.

### `maxNode` (default: 9)

Maximum Node.js version to run tests. Minimum version will be taken from `engines.node` field of you `package.json`.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
