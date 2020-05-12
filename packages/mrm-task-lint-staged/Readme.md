<!-- lint-staged -->

# mrm-task-lint-staged

[Mrm](https://github.com/sapegin/mrm) task that adds [lint-staged](https://github.com/okonet/lint-staged).

**Note:** supports only Prettier, ESLint and Stylelint now, pull requests are welcome.

## What it does

- Creates a config in `package.json`
- Sets up a pre-commit Git hook
- Installs dependencies

This tasks will try to infer extensions from your npm scripts. For example, if you have `lint` script that runs ESLint for `js` and `ts` files, the task will add lint-staged rule that runs ESLint for the same extensions. And will overwrite an existing rule if you change it manually and run the task again, but it will try to keepy your custom rules.

## Usage

```
npm install -g mrm mrm-task-lint-staged
mrm lint-staged
```

## Options

See [Mrm docs](../../docs/Getting_started.md) and [lint-staged docs](https://github.com/okonet/lint-staged/blob/master/README.md) for more details.

### `lintStagedRules` (default: infer)

Overrides and custom rules. By default will try to infer by project dependencies.

For example, a custom extension:

```json
{
  "lintStagedRules": {
    "eslint": {
      "extensions": ["js", "jsx", "mjs"]
    }
  }
}
```

Or a custom command:

```json
{
  "lintStagedRules": {
    "eslint": {
      "command": "eslint --fix"
    }
  }
}
```

Or you can disable one of the default rules:

```json
{
  "lintStagedRules": {
    "prettier": {
      "enabled": false
    }
  }
}
```

Or add a custom rule:

```json
{
  "lintStagedRules": {
    "jest": {
      "extensions": ["js"],
      "command": "jest --bail --findRelatedTests"
    }
  }
}
```

Available rules are `prettier`, `eslint` and `stylelint`.

## Changelog

The changelog can be found in [CHANGELOG.md](CHANGELOG.md).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](../../Contributing.md).

## Authors and license

[Artem Sapegin](https://sapegin.me) and [contributors](https://github.com/sapegin/mrm/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
