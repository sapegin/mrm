# Change Log

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 6.1.13 (2022-10-19)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.12 (2022-10-19)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.11 (2022-10-19)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.10 (2022-10-18)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.9 (2022-10-18)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.8 (2022-10-17)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.7 (2022-10-16)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.6 (2022-09-15)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.5 (2022-09-15)

### Bug Fixes

- Pass correct parameters to pnpm ([#235](https://github.com/sapegin/mrm/issues/235)) ([92cb61c](https://github.com/sapegin/mrm/commit/92cb61c03c02559269cfaadaa391a069ef9add08))

## 6.1.4 (2022-09-15)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.3 (2022-09-15)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.2 (2022-09-15)

**Note:** Version bump only for package mrm-task-semantic-release

## 6.1.1 (2022-09-15)

**Note:** Version bump only for package mrm-task-semantic-release

# 6.1.0 (2022-08-23)

### Features

- Aliases could reference other aliases ([#104](https://github.com/sapegin/mrm/issues/104)) ([4c718f8](https://github.com/sapegin/mrm/commit/4c718f80029a218357204fd788c0bccdf99b7d67))

# 6.0.0 (2022-03-22)

### Features

- **lint-staged:** Husky upgrade v6 to v7 ([#206](https://github.com/sapegin/mrm/issues/206)) ([87779e8](https://github.com/sapegin/mrm/commit/87779e891efbd61ec10b59f7c41ac66b4263d6ce)), closes [#205](https://github.com/sapegin/mrm/issues/205) [#192](https://github.com/sapegin/mrm/issues/192)

### BREAKING CHANGES

- **lint-staged:** Node 10 support was dropped from Husky v7

## 5.1.7 (2021-10-14)

**Note:** Version bump only for package mrm-task-semantic-release

## 5.1.6 (2021-09-18)

**Note:** Version bump only for package mrm-task-semantic-release

## 5.1.5 (2021-08-03)

**Note:** Version bump only for package mrm-task-semantic-release

## 5.1.4 (2021-08-03)

### Bug Fixes

- **core:** Fix types of yaml method ([#190](https://github.com/sapegin/mrm/issues/190)) ([7cdd216](https://github.com/sapegin/mrm/commit/7cdd216681155e44a3d17f4d734a2d6f91fede4c))

## 5.1.3 (2021-08-02)

### Bug Fixes

- **eslint:** Add missing lodash dependency ([#164](https://github.com/sapegin/mrm/issues/164)) ([cea24d8](https://github.com/sapegin/mrm/commit/cea24d80d031c835519db595a3da6a16556be28f))

## 5.1.2 (2021-07-21)

**Note:** Version bump only for package mrm-task-semantic-release

## 5.1.1 (2021-07-21)

**Note:** Version bump only for package mrm-task-semantic-release

# [5.1.0](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@5.0.0...mrm-task-semantic-release@5.1.0) (2021-07-21)

### Bug Fixes

- **semantic-release:** Fix the URL of the repository settings page ([b2b1085](https://github.com/sapegin/mrm/commit/b2b1085075bcd4e8c3131d4b44a67dfee63e2431))

### Features

- **semantic-release:** Use LTS version of Node.js, update setup-node action ([b95c5c7](https://github.com/sapegin/mrm/commit/b95c5c7e3278453d6255ed3abb18da883ab73cd1))

# [5.0.0](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.1.1...mrm-task-semantic-release@5.0.0) (2021-04-07)

### Features

- Autoload tasks and presets ([#99](https://github.com/sapegin/mrm/issues/99)) ([b866455](https://github.com/sapegin/mrm/commit/b866455f98c72b7698ec7cc5fb277df3b3f9ce25)), closes [#97](https://github.com/sapegin/mrm/issues/97)
- Increase supported node version from 8 to 10 ([#138](https://github.com/sapegin/mrm/issues/138)) ([224c673](https://github.com/sapegin/mrm/commit/224c67332ee71b9e275dbea1435cd9088852ff6f))

### BREAKING CHANGES

- Node 8 or 9 are no longer supported, the minimum supported version is now 10.13.
- Mrm will no longer load globally installed tasks and presets but will autoload them directly from npm, similar to how npx works (we're actually using npx under the hood).

## [4.1.1](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.1.0...mrm-task-semantic-release@4.1.1) (2021-04-01)

**Note:** Version bump only for package mrm-task-semantic-release

# [4.1.0](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.0.4...mrm-task-semantic-release@4.1.0) (2021-02-25)

### Features

- Add more fields to package.json ([#134](https://github.com/sapegin/mrm/issues/134)) ([d80840a](https://github.com/sapegin/mrm/commit/d80840a5e771976ef38cdf8a3b535a412e1097f6))

## [4.0.4](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.0.3...mrm-task-semantic-release@4.0.4) (2021-02-09)

**Note:** Version bump only for package mrm-task-semantic-release

## [4.0.3](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.0.2...mrm-task-semantic-release@4.0.3) (2021-02-08)

**Note:** Version bump only for package mrm-task-semantic-release

## [4.0.2](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.0.1...mrm-task-semantic-release@4.0.2) (2021-02-03)

**Note:** Version bump only for package mrm-task-semantic-release

## [4.0.1](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@4.0.0...mrm-task-semantic-release@4.0.1) (2020-11-04)

**Note:** Version bump only for package mrm-task-semantic-release

# [4.0.0](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.1.2...mrm-task-semantic-release@4.0.0) (2020-10-28)

### Features

- **semantic-release:** Use GitHub Actions instead of Travis CI ([e11643c](https://github.com/sapegin/mrm/commit/e11643c7ea0bac0d696084b615131e31a84b1284))

### BREAKING CHANGES

- **semantic-release:** - The task now creates a GitHub Actions workflow instead of Travis CI.

* Custom semantic-release configurations aren't supported.

## [3.1.2](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.1.1...mrm-task-semantic-release@3.1.2) (2020-10-27)

**Note:** Version bump only for package mrm-task-semantic-release

## [3.1.1](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.1.0...mrm-task-semantic-release@3.1.1) (2020-10-27)

**Note:** Version bump only for package mrm-task-semantic-release

# [3.1.0](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.8...mrm-task-semantic-release@3.1.0) (2020-10-27)

### Features

- **mrm-core:** Replace js-yaml with yaml ([ca72d6b](https://github.com/sapegin/mrm/commit/ca72d6b8fa94a627285db2454287e550985d1fc7))

## [3.0.8](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.7...mrm-task-semantic-release@3.0.8) (2020-10-26)

**Note:** Version bump only for package mrm-task-semantic-release

## [3.0.7](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.6...mrm-task-semantic-release@3.0.7) (2020-08-19)

**Note:** Version bump only for package mrm-task-semantic-release

## [3.0.6](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.5...mrm-task-semantic-release@3.0.6) (2020-06-18)

### Bug Fixes

- Migrate to the new parameters API ([fcc2d61](https://github.com/sapegin/mrm/commit/fcc2d61be7ec720b0cd4c45e3cb65c6f543a45fb))

## [3.0.5](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.4...mrm-task-semantic-release@3.0.5) (2020-06-08)

**Note:** Version bump only for package mrm-task-semantic-release

## [3.0.4](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.3...mrm-task-semantic-release@3.0.4) (2020-04-07)

**Note:** Version bump only for package mrm-task-semantic-release

## [3.0.3](https://github.com/sapegin/mrm/compare/mrm-task-semantic-release@3.0.2...mrm-task-semantic-release@3.0.3) (2020-03-20)

**Note:** Version bump only for package mrm-task-semantic-release

## 3.0.2 (2020-01-27)

**Note:** Version bump only for package mrm-task-semantic-release
