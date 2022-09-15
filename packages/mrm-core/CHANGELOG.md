# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 7.1.1 (2022-09-15)

**Note:** Version bump only for package mrm-core





# 7.1.0 (2022-08-23)


### Features

* Aliases could reference other aliases ([#104](https://github.com/sapegin/mrm/issues/104)) ([4c718f8](https://github.com/sapegin/mrm/commit/4c718f80029a218357204fd788c0bccdf99b7d67))





# 7.0.0 (2022-03-22)


### Features

* **lint-staged:** Husky upgrade v6 to v7 ([#206](https://github.com/sapegin/mrm/issues/206)) ([87779e8](https://github.com/sapegin/mrm/commit/87779e891efbd61ec10b59f7c41ac66b4263d6ce)), closes [#205](https://github.com/sapegin/mrm/issues/205) [#192](https://github.com/sapegin/mrm/issues/192)


### BREAKING CHANGES

* **lint-staged:** Node 10 support was dropped from Husky v7





## 6.1.7 (2021-10-14)

**Note:** Version bump only for package mrm-core





## 6.1.6 (2021-09-18)

**Note:** Version bump only for package mrm-core





## 6.1.5 (2021-08-03)

**Note:** Version bump only for package mrm-core





## 6.1.4 (2021-08-03)


### Bug Fixes

* **core:** Fix types of yaml method ([#190](https://github.com/sapegin/mrm/issues/190)) ([7cdd216](https://github.com/sapegin/mrm/commit/7cdd216681155e44a3d17f4d734a2d6f91fede4c))





## 6.1.3 (2021-08-02)


### Bug Fixes

* **eslint:** Add missing lodash dependency ([#164](https://github.com/sapegin/mrm/issues/164)) ([cea24d8](https://github.com/sapegin/mrm/commit/cea24d80d031c835519db595a3da6a16556be28f))





## 6.1.2 (2021-07-21)

**Note:** Version bump only for package mrm-core





## 6.1.1 (2021-07-21)

**Note:** Version bump only for package mrm-core





# [6.1.0](https://github.com/sapegin/mrm/compare/mrm-core@6.0.0...mrm-core@6.1.0) (2021-07-21)


### Bug Fixes

* Don't crash on adding badges to an empty file ([#162](https://github.com/sapegin/mrm/issues/162)) ([f52524d](https://github.com/sapegin/mrm/commit/f52524d3930c92bf46f501feef19c5abbfef562e))


### Features

* Add pnpm support (option or auto-detect) ([#143](https://github.com/sapegin/mrm/issues/143)) ([8d976d8](https://github.com/sapegin/mrm/commit/8d976d89a8c184e183edb96d281af0a823530010)), closes [#114](https://github.com/sapegin/mrm/issues/114)





# [6.0.0](https://github.com/sapegin/mrm/compare/mrm-core@5.0.0...mrm-core@6.0.0) (2021-04-07)


### Features

* Autoload tasks and presets ([#99](https://github.com/sapegin/mrm/issues/99)) ([b866455](https://github.com/sapegin/mrm/commit/b866455f98c72b7698ec7cc5fb277df3b3f9ce25)), closes [#97](https://github.com/sapegin/mrm/issues/97)
* Increase supported node version from 8 to 10 ([#138](https://github.com/sapegin/mrm/issues/138)) ([224c673](https://github.com/sapegin/mrm/commit/224c67332ee71b9e275dbea1435cd9088852ff6f))


### BREAKING CHANGES

* Node 8 or 9 are no longer supported, the minimum supported version is now 10.13.
* Mrm will no longer load globally installed tasks and presets but will autoload them directly from npm, similar to how npx works (we're actually using npx under the hood).





# [5.0.0](https://github.com/sapegin/mrm/compare/mrm-core@4.7.0...mrm-core@5.0.0) (2021-04-01)


### Features

* **lint-staged:** Use husky 6 ([#152](https://github.com/sapegin/mrm/issues/152)) ([133fe08](https://github.com/sapegin/mrm/commit/133fe08b0895b0c994c55d39e0f43af0672fe1f9))


### BREAKING CHANGES

* **lint-staged:** The lint-staged task will migrate simple-git-hooks back to husky 6, the existing simple-git-hooks dependency will be removed.





# [4.7.0](https://github.com/sapegin/mrm/compare/mrm-core@4.6.0...mrm-core@4.7.0) (2021-02-25)


### Features

* Add more fields to package.json ([#134](https://github.com/sapegin/mrm/issues/134)) ([d80840a](https://github.com/sapegin/mrm/commit/d80840a5e771976ef38cdf8a3b535a412e1097f6))





# [4.6.0](https://github.com/sapegin/mrm/compare/mrm-core@4.5.0...mrm-core@4.6.0) (2021-02-09)


### Features

* **readme:** Make contributing conditional by `includeContributing` option and allow `contributingFile` option for a name ([#123](https://github.com/sapegin/mrm/issues/123)) ([481a316](https://github.com/sapegin/mrm/commit/481a3161bc9c1a778a27b73cd746f4a4d756a41d))





# [4.5.0](https://github.com/sapegin/mrm/compare/mrm-core@4.4.0...mrm-core@4.5.0) (2021-02-08)


### Features

* **core:** Allow to use yarn@berry ([#110](https://github.com/sapegin/mrm/issues/110)) ([5c14395](https://github.com/sapegin/mrm/commit/5c14395e8ca7e76c8bdf135cd0211ac42fff12c5))





# [4.4.0](https://github.com/sapegin/mrm/compare/mrm-core@4.3.0...mrm-core@4.4.0) (2021-02-03)


### Features

* Allow to specify Yaml version ([#113](https://github.com/sapegin/mrm/issues/113)) ([e4b203e](https://github.com/sapegin/mrm/commit/e4b203eee58b82a196b9b2bd3ef8e3124a1f36db)), closes [#112](https://github.com/sapegin/mrm/issues/112)





# [4.3.0](https://github.com/sapegin/mrm/compare/mrm-core@4.2.2...mrm-core@4.3.0) (2020-11-04)


### Features

* **core:** Add markdown.removeBadge() method ([7c6386c](https://github.com/sapegin/mrm/commit/7c6386c55036515ea79549da31dff51f59b30719))





## [4.2.2](https://github.com/sapegin/mrm/compare/mrm-core@4.2.1...mrm-core@4.2.2) (2020-10-27)

**Note:** Version bump only for package mrm-core





## [4.2.1](https://github.com/sapegin/mrm/compare/mrm-core@4.2.0...mrm-core@4.2.1) (2020-10-27)

**Note:** Version bump only for package mrm-core





# [4.2.0](https://github.com/sapegin/mrm/compare/mrm-core@4.1.3...mrm-core@4.2.0) (2020-10-27)


### Features

* **mrm-core:** Replace js-yaml with yaml ([ca72d6b](https://github.com/sapegin/mrm/commit/ca72d6b8fa94a627285db2454287e550985d1fc7))





## [4.1.3](https://github.com/sapegin/mrm/compare/mrm-core@4.1.2...mrm-core@4.1.3) (2020-10-26)


### Bug Fixes

* **mrm-core:** Fix adding packages to Yarn workspaces ([#100](https://github.com/sapegin/mrm/issues/100)) ([4c23e05](https://github.com/sapegin/mrm/commit/4c23e05087470b3f773c965420bdddc28bf2a5bd))





## [4.1.2](https://github.com/sapegin/mrm/compare/mrm-core@4.1.1...mrm-core@4.1.2) (2020-08-19)


### Bug Fixes

* Handle non-registry installs ([#90](https://github.com/sapegin/mrm/issues/90)) ([2b29a76](https://github.com/sapegin/mrm/commit/2b29a765fe8e4c81a4c968e281e3000d78da500b)), closes [#89](https://github.com/sapegin/mrm/issues/89)





## [4.1.1](https://github.com/sapegin/mrm/compare/mrm-core@4.1.0...mrm-core@4.1.1) (2020-06-08)


### Bug Fixes

* TypeScript types: add missing set() function signature for json ([#80](https://github.com/sapegin/mrm/issues/80)) ([6c22a8d](https://github.com/sapegin/mrm/commit/6c22a8ded59d3396375ce3e3def532df066540b4))





# [4.1.0](https://github.com/sapegin/mrm/compare/mrm-core@4.0.3...mrm-core@4.1.0) (2020-04-07)


### Features

* Finish interactive mode ([#70](https://github.com/sapegin/mrm/issues/70)) ([52cbb85](https://github.com/sapegin/mrm/commit/52cbb85924d37455cd37d0ab4c1b552bbe0d41ab))





## [4.0.3](https://github.com/sapegin/mrm/compare/mrm-core@4.0.2...mrm-core@4.0.3) (2020-03-20)

**Note:** Version bump only for package mrm-core





## 4.0.2 (2019-12-12)

**Note:** Version bump only for package mrm-core
