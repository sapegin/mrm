<!-- Codecov -->

# mrm-task-codecov

[Mrm](https://github.com/sapegin/mrm) task that adds [Codecov](https://codecov.io/) to Travis CI config (see [travis](https://github.com/sapegin/mrm/tree/master/packages/mrm-task-travis) task) and a Readme badge.

## What it does

- Creates GitHub Action workflow file
- Adds a satus badge to the Readme

## Usage

```
npx mrm codecov
```

## Options

See [Mrm docs](../../docs/Getting_started.md) for more details.

### `workflowFile` (default: `.github/workflows/node.js.yml`)

Location of the GitHub Actions workflow file.

### `readmeFile` (default: `Readme.md`)

Name of the Readme file.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
