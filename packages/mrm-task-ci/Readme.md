<!-- CI -->

# mrm-task-ci

[Mrm](https://github.com/sapegin/mrm) task that adds GitHub Action workflow that runs Node.js tests.

## What it does

- Creates GitHub Action workflow file
- Sets up tests for currently supported [Node.js LTS versions](https://nodejs.org/en/about/releases/)
- Adds a satus badge to the Readme

## Usage

```
npm install -g mrm mrm-task-ci
mrm ci
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
