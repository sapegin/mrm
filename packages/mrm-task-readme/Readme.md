<!-- Readme file -->

# mrm-task-readme

[Mrm](https://github.com/sapegin/mrm) task that adds a Readme file.

## What it does

- Creates a Readme file

## Usage

```
npx mrm readme
```

## Options

See [Mrm docs](../../docs/Getting_started.md) for more details.

### `packageName` (default: `name` field in `package.json`)

Package name.

### `name` (default: will try to read from your `package.json`, npm or Git config)

Your name.

### `url` (default: will try to read from your npm or Git config)

Your site URL.

### `readmeFile` (default: `"Readme.md"`)

Name of the Readme file.

### `license` (default: taken from `package.json`, if not found `"MIT"` is used)

License name (like `MIT`, `Unlicense`). For full list of supported values see: [`/templates`](https://github.com/sapegin/mrm/tree/master/packages/mrm-task-license/templates).

This is only needed if `licenseFile` is used.

### `licenseFile` (default: `"License.md"`)

Name of the license file. May use `${license}` within the string to insert the value of `license` dynamically into the name (to maintain this general template independently from the license type, while non-redundant with it).

### `contributingFile` (default: `"Contributing.md"`)

Name of the Contributing file.

### `includeContributing` (default: `true`)

Whether to include the Contributing section.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
