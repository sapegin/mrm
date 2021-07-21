<!-- semantic-release -->

# mrm-task-semantic-release

[Mrm](https://github.com/sapegin/mrm) task that adds [semantic-release](https://github.com/semantic-release/semantic-release).

## What it does

- Runs semantic-release using GitHub Action
- Adds an npm version badge to the Readme

## Usage

```
npx mrm semantic-release
```

## Options

See [Mrm docs](../../docs/Getting_started.md) for more details.

### `workflowFile` (default: `.github/workflows/release.yml`)

Name of the GitHub Actions workflow file.

### `readmeFile` (default: `Readme.md`)

Name of the Readme file.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
