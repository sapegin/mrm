# mrm-task-stylelint

[Mrm](https://github.com/sapegin/mrm) task that adds [stylelint](https://stylelint.io/).

## What it does

- Creates `.stylelintrc`
- Adds npm script to run stylelint before tests
- Installs dependencies

## Usage

```
npm install -g mrm mrm-task-stylelint
mrm stylelint
```

## Options

See [Mrm docs](https://github.com/sapegin/mrm#usage) and [stylelint docs](https://stylelint.io/user-guide/configuration/) for more details.

### `stylelintPreset` (default: `stylelint-config-standard`)

Stylelint preset name.

### `stylelintRules`

Stylelint rules.

### `stylelintExtensions` (default: `.css`)

File extensions to lint.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
