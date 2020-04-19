jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	install: jest.fn(),
	uninstall: jest.fn(),
}));

const { install, uninstall } = require('mrm-core');
const { getConfigGetter } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

const legacyConfigFile = '/.eslintrc';
const configFile = '/.eslintrc.json';
const packageJson = stringify({
	name: 'unicorn',
	scripts: {
		test: 'jest',
	},
});

afterEach(() => {
	vol.reset();
	install.mockClear();
	uninstall.mockClear();
});

it('should add ESLint', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint']);
});

it('should use a custom preset', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should not add a custom preset if it’s already there', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[configFile]: stringify({ extends: 'airbnb' }),
	});

	task(getConfigGetter({ eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should add a custom preset (array)', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[configFile]: stringify({ extends: ['coffee', 'pizza'] }),
	});

	task(getConfigGetter({ eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should not add a custom preset if it’s already there (array)', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[configFile]: stringify({ extends: ['airbnb', 'pizza'] }),
	});

	task(getConfigGetter({ eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should add custom rules', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ eslintRules: { 'no-undef': 0 } }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
});

it('should install extra dependencies', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ eslintPeerDependencies: ['eslint-plugin-react'] }));

	expect(install).toBeCalledWith(['eslint', 'eslint-plugin-react']);
});

it('should remove obsolete dependencies', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				prettier: '*',
			},
		}),
	});

	task(getConfigGetter({ eslintObsoleteDependencies: ['prettier'] }));

	expect(uninstall).toBeCalledWith(['jslint', 'jshint', 'prettier']);
});

it('should keep custom extensions defined in a package.json script', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				lint: 'eslint --ext .ts',
				test: 'jest',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should not add custom extensions when they were not specified', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				lint: 'eslint . --cache --fix',
				test: 'jest',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should replace scripts.test.eslint with scripts.lint and scripts.pretest', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				test: 'eslint --ext .ts && jest',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should remove custom extension if it’s "js" (default value)', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				lint: 'eslint --ext .js',
				test: 'jest',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should add extra plugin, parser and extensions for a TypeScript project', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				typescript: '*',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith([
		'eslint',
		'@typescript-eslint/parser',
		'@typescript-eslint/eslint-plugin',
	]);
});

it('should turn on JSX support in TypeScript parser if TypeScript and React are installed', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			dependencies: {
				react: '*',
			},
			devDependencies: {
				typescript: '*',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should turn off TypeScript-specific eslint rules that conflict with Prettier if prettier is installed', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				typescript: '*',
				prettier: '*',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should turn on Prettier-specific eslint rules when prettier is installed', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				prettier: '*',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should migrate legacy config file', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[legacyConfigFile]: stringify({ rules: { 'no-foo': 2 } }),
	});

	task(getConfigGetter());

	expect(vol.toJSON()).toMatchSnapshot();
});
