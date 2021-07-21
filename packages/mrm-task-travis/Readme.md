<!-- Travis CI -->

# [DEPRECATED] mrm-task-travis

**Use the [ci](../ci/Readme.md) task instead.**

[Mrm](https://github.com/sapegin/mrm) task that adds [Travis CI](https://travis-ci.org/).

## What it does

- Creates `.travis.yml`
- Adds Travis CI badge to the Readme

## Usage

```
npx mrm travis
```

## Options

See [Mrm docs](../../docs/Getting_started.md) for more details.

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
