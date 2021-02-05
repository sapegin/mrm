<!-- package.json -->

# mrm-task-package

[Mrm](https://github.com/sapegin/mrm) task that adds `package.json`.

## What it does

- Creates `package.json`

## Usage

```
npm install -g mrm mrm-task-package
mrm package
```

## Options

See [Mrm docs](../../docs/Getting_started.md) for more details.

### `github` (default: extracted from `.git/config` file)

Your GitHub user name.

### `name` (default: will try to read from your npm or Git config)

Your name.

### `url` (default: will try to read from your npm or Git config)

Your site URL.

### `minNode` (default: 10)

Minimum required Node.js version.

### `license` (default: MIT)

License.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
