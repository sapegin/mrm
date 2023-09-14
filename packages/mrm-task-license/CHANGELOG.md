# Change Log

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 5.1.22 (2023-09-14)

**Note:** Version bump only for package mrm-task-license

## 5.1.21 (2023-09-13)

**Note:** Version bump only for package mrm-task-license

## 5.1.20 (2023-09-13)

**Note:** Version bump only for package mrm-task-license

## 5.1.19 (2023-09-13)

**Note:** Version bump only for package mrm-task-license

## 5.1.18 (2023-09-13)

**Note:** Version bump only for package mrm-task-license

## 5.1.17 (2023-07-04)

**Note:** Version bump only for package mrm-task-license

## 5.1.16 (2023-07-04)

**Note:** Version bump only for package mrm-task-license

## 5.1.15 (2023-07-04)

**Note:** Version bump only for package mrm-task-license

## 5.1.14 (2023-03-10)

**Note:** Version bump only for package mrm-task-license

## 5.1.13 (2022-10-19)

**Note:** Version bump only for package mrm-task-license

## 5.1.12 (2022-10-19)

**Note:** Version bump only for package mrm-task-license

## 5.1.11 (2022-10-19)

**Note:** Version bump only for package mrm-task-license

## 5.1.10 (2022-10-18)

**Note:** Version bump only for package mrm-task-license

## 5.1.9 (2022-10-18)

**Note:** Version bump only for package mrm-task-license

## 5.1.8 (2022-10-17)

**Note:** Version bump only for package mrm-task-license

## 5.1.7 (2022-10-16)

**Note:** Version bump only for package mrm-task-license

## 5.1.6 (2022-09-15)

**Note:** Version bump only for package mrm-task-license

## 5.1.5 (2022-09-15)

### Bug Fixes

- Pass correct parameters to pnpm ([#235](https://github.com/sapegin/mrm/issues/235)) ([92cb61c](https://github.com/sapegin/mrm/commit/92cb61c03c02559269cfaadaa391a069ef9add08))

## 5.1.4 (2022-09-15)

**Note:** Version bump only for package mrm-task-license

## 5.1.3 (2022-09-15)

**Note:** Version bump only for package mrm-task-license

## 5.1.2 (2022-09-15)

**Note:** Version bump only for package mrm-task-license

## 5.1.1 (2022-09-15)

**Note:** Version bump only for package mrm-task-license

# 5.1.0 (2022-08-23)

### Features

- Aliases could reference other aliases ([#104](https://github.com/sapegin/mrm/issues/104)) ([4c718f8](https://github.com/sapegin/mrm/commit/4c718f80029a218357204fd788c0bccdf99b7d67))

# 5.0.0 (2022-03-22)

### Features

- **lint-staged:** Husky upgrade v6 to v7 ([#206](https://github.com/sapegin/mrm/issues/206)) ([87779e8](https://github.com/sapegin/mrm/commit/87779e891efbd61ec10b59f7c41ac66b4263d6ce)), closes [#205](https://github.com/sapegin/mrm/issues/205) [#192](https://github.com/sapegin/mrm/issues/192)

### BREAKING CHANGES

- **lint-staged:** Node 10 support was dropped from Husky v7

## 4.0.8 (2021-10-14)

**Note:** Version bump only for package mrm-task-license

## 4.0.7 (2021-09-18)

**Note:** Version bump only for package mrm-task-license

## 4.0.6 (2021-08-03)

**Note:** Version bump only for package mrm-task-license

## 4.0.5 (2021-08-03)

### Bug Fixes

- **core:** Fix types of yaml method ([#190](https://github.com/sapegin/mrm/issues/190)) ([7cdd216](https://github.com/sapegin/mrm/commit/7cdd216681155e44a3d17f4d734a2d6f91fede4c))

## 4.0.4 (2021-08-02)

### Bug Fixes

- **eslint:** Add missing lodash dependency ([#164](https://github.com/sapegin/mrm/issues/164)) ([cea24d8](https://github.com/sapegin/mrm/commit/cea24d80d031c835519db595a3da6a16556be28f))

## 4.0.3 (2021-07-21)

**Note:** Version bump only for package mrm-task-license

## 4.0.2 (2021-07-21)

**Note:** Version bump only for package mrm-task-license

## [4.0.1](https://github.com/sapegin/mrm/compare/mrm-task-license@4.0.0...mrm-task-license@4.0.1) (2021-07-21)

**Note:** Version bump only for package mrm-task-license

# [4.0.0](https://github.com/sapegin/mrm/compare/mrm-task-license@3.4.1...mrm-task-license@4.0.0) (2021-04-07)

### Features

- Autoload tasks and presets ([#99](https://github.com/sapegin/mrm/issues/99)) ([b866455](https://github.com/sapegin/mrm/commit/b866455f98c72b7698ec7cc5fb277df3b3f9ce25)), closes [#97](https://github.com/sapegin/mrm/issues/97)
- Increase supported node version from 8 to 10 ([#138](https://github.com/sapegin/mrm/issues/138)) ([224c673](https://github.com/sapegin/mrm/commit/224c67332ee71b9e275dbea1435cd9088852ff6f))

### BREAKING CHANGES

- Node 8 or 9 are no longer supported, the minimum supported version is now 10.13.
- Mrm will no longer load globally installed tasks and presets but will autoload them directly from npm, similar to how npx works (we're actually using npx under the hood).

## [3.4.1](https://github.com/sapegin/mrm/compare/mrm-task-license@3.4.0...mrm-task-license@3.4.1) (2021-04-01)

**Note:** Version bump only for package mrm-task-license

# [3.4.0](https://github.com/sapegin/mrm/compare/mrm-task-license@3.3.0...mrm-task-license@3.4.0) (2021-02-25)

### Features

- Add more fields to package.json ([#134](https://github.com/sapegin/mrm/issues/134)) ([d80840a](https://github.com/sapegin/mrm/commit/d80840a5e771976ef38cdf8a3b535a412e1097f6))

# [3.3.0](https://github.com/sapegin/mrm/compare/mrm-task-license@3.2.0...mrm-task-license@3.3.0) (2021-02-09)

### Features

- **readme:** Make contributing conditional by `includeContributing` option and allow `contributingFile` option for a name ([#123](https://github.com/sapegin/mrm/issues/123)) ([481a316](https://github.com/sapegin/mrm/commit/481a3161bc9c1a778a27b73cd746f4a4d756a41d))

# [3.2.0](https://github.com/sapegin/mrm/compare/mrm-task-license@3.1.4...mrm-task-license@3.2.0) (2021-02-09)

### Features

- Allow to define template-based license file name in license and readme tasks ([#124](https://github.com/sapegin/mrm/issues/124)) ([bf99bca](https://github.com/sapegin/mrm/commit/bf99bca77d01f5554fdd4c115ac21a23c68739a4))

## [3.1.4](https://github.com/sapegin/mrm/compare/mrm-task-license@3.1.3...mrm-task-license@3.1.4) (2021-02-08)

**Note:** Version bump only for package mrm-task-license

## [3.1.3](https://github.com/sapegin/mrm/compare/mrm-task-license@3.1.2...mrm-task-license@3.1.3) (2021-02-03)

**Note:** Version bump only for package mrm-task-license

## [3.1.2](https://github.com/sapegin/mrm/compare/mrm-task-license@3.1.1...mrm-task-license@3.1.2) (2020-11-04)

### Bug Fixes

- **license:** Remove unrelated npm keywords ([019def6](https://github.com/sapegin/mrm/commit/019def602d2f3a4e0325d6cb3d1cf301b9b24d0e))

## [3.1.1](https://github.com/sapegin/mrm/compare/mrm-task-license@3.1.0...mrm-task-license@3.1.1) (2020-10-28)

### Bug Fixes

- **license:** More robust author name parsing in package.json ([ad3d743](https://github.com/sapegin/mrm/commit/ad3d743a2797451b2f8c5d414e3b02ba794faf59))

# [3.1.0](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.9...mrm-task-license@3.1.0) (2020-10-27)

### Features

- Remove deprecated API ([a2a94fa](https://github.com/sapegin/mrm/commit/a2a94fa72dcb6ece1d8a223b8ff743ec2562518a))

## [3.0.9](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.8...mrm-task-license@3.0.9) (2020-10-27)

**Note:** Version bump only for package mrm-task-license

## [3.0.8](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.7...mrm-task-license@3.0.8) (2020-10-27)

**Note:** Version bump only for package mrm-task-license

## [3.0.7](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.6...mrm-task-license@3.0.7) (2020-10-26)

**Note:** Version bump only for package mrm-task-license

## [3.0.6](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.5...mrm-task-license@3.0.6) (2020-09-23)

### Bug Fixes

- **license:** Support package.json author fields as an object ([#94](https://github.com/sapegin/mrm/issues/94)) ([6a6ff30](https://github.com/sapegin/mrm/commit/6a6ff30f503e6429b30a559ec644e8c7e6d9a95c))

## [3.0.5](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.4...mrm-task-license@3.0.5) (2020-08-19)

### Bug Fixes

- Migrate to the new parameters API ([fcc2d61](https://github.com/sapegin/mrm/commit/fcc2d61be7ec720b0cd4c45e3cb65c6f543a45fb))

## [3.0.4](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.3...mrm-task-license@3.0.4) (2020-06-08)

**Note:** Version bump only for package mrm-task-license

## [3.0.3](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.2...mrm-task-license@3.0.3) (2020-04-07)

**Note:** Version bump only for package mrm-task-license

## [3.0.2](https://github.com/sapegin/mrm/compare/mrm-task-license@3.0.1...mrm-task-license@3.0.2) (2020-03-20)

### Bug Fixes

- Spell "changelog" as one word, remove a note about Jest snapshots ([aa9b2c1](https://github.com/sapegin/mrm/commit/aa9b2c19a47bac19fea5de3339650d6e1f051916))

## 3.0.1 (2020-01-27)

**Note:** Version bump only for package mrm-task-license
