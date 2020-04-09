# mrm-task-prettier

[Mrm](https://github.com/sapegin/mrm) task that adds [Prettier](https://prettier.io/).

## What it does

- Creates `.prettierrc`
- Adds an npm script to run Prettier after tests
- Installs dependencies

## Usage

```
npm install -g mrm mrm-task-prettier
mrm prettier
```

Now run:

```
npm run format
```

## Options

See [Mrm docs](https://github.com/sapegin/mrm#documentation) for more details.

### `indent` (default: `tab`)

Indentation, `tab` or number of spaces. Will be overwritten by options from EditorConfig.

### `prettierOptions`

Prettier options, by default will try to infer options from EditorConfig.

### `prettierOverrides`

[Prettier overrides](https://prettier.io/docs/en/configuration.html#configuration-overrides), by default will use overrides for Markdown to improve documentation readability.

### `prettierPattern` (default: auto based on your dependencies)

Glob pattern to match file that should be formatted, for example `**/*.{ts,tsx}`.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
