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
const { getTaskOptions } = require('mrm');
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

it('should add ESLint', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint']);
});

it.each([
	['airbnb', 'eslint-config-airbnb'],
	['airbnb/whitespace', 'eslint-config-airbnb'],
	['eslint-config-airbnb', 'eslint-config-airbnb'],
	['eslint-config-airbnb/whitespace', 'eslint-config-airbnb'],
	['@scoped', '@scoped/eslint-config'],
	['@scoped/eslint-config', '@scoped/eslint-config'],
	['@scoped/eslint-config/variant', '@scoped/eslint-config'],
	['@scoped/custom-config-name', '@scoped/custom-config-name'],
	['@scoped/eslint-config-alt', '@scoped/eslint-config-alt'],
	['@scoped/eslint-config-alt/variant', '@scoped/eslint-config-alt'],
	['@scoped/custom-config-name/variant', '@scoped/custom-config-name'],
])('should use custom preset `%s`', async (presetName, packageName) => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, { eslintPreset: presetName }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', packageName]);
});

it('should throw when given a file path for the preset name', async () => {
	const options = await getTaskOptions(task, false, {
		eslintPreset: './path/to/config',
	});
	expect(() => task(options)).toThrow();
});

it('should not add a custom preset if it’s already there', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[configFile]: stringify({ extends: 'airbnb' }),
	});

	task(await getTaskOptions(task, false, { eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should add a custom preset (array)', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[configFile]: stringify({ extends: ['coffee', 'pizza'] }),
	});

	task(await getTaskOptions(task, false, { eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should not add a custom preset if it’s already there (array)', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[configFile]: stringify({ extends: ['airbnb', 'pizza'] }),
	});

	task(await getTaskOptions(task, false, { eslintPreset: 'airbnb' }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
	expect(install).toBeCalledWith(['eslint', 'eslint-config-airbnb']);
});

it('should add custom rules', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, { eslintRules: { 'no-undef': 0 } }));

	expect(vol.toJSON()[configFile]).toMatchSnapshot();
});

it('should install extra dependencies', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			eslintPeerDependencies: ['eslint-plugin-react'],
		})
	);

	expect(install).toBeCalledWith(['eslint', 'eslint-plugin-react']);
});

it('should remove obsolete dependencies', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				prettier: '*',
			},
		}),
	});

	task(
		await getTaskOptions(task, false, {
			eslintObsoleteDependencies: ['prettier'],
		})
	);

	expect(uninstall).toBeCalledWith(['jslint', 'jshint', 'prettier']);
});

it('should keep custom extensions defined in a package.json script', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				lint: 'eslint --ext .ts',
				test: 'jest',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should not add custom extensions when they were not specified', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				lint: 'eslint . --cache --fix',
				test: 'jest',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should replace scripts.test.eslint with scripts.lint and scripts.pretest', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				test: 'eslint --ext .ts && jest',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should remove custom extension if it’s "js" (default value)', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				lint: 'eslint --ext .js',
				test: 'jest',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should add extra plugin, parser and extensions for a TypeScript project', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				typescript: '*',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith([
		'eslint',
		'@typescript-eslint/parser',
		'@typescript-eslint/eslint-plugin',
	]);
});

it('should turn on JSX support in TypeScript parser if TypeScript and React are installed', async () => {
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

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should turn off TypeScript-specific eslint rules that conflict with Prettier if prettier is installed', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				typescript: '*',
				prettier: '*',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should turn off TypeScript-specific eslint rules that conflict with Prettier if prettier is installed (merge extends array)', async () => {
	vol.fromJSON({
		'/.eslintrc.json': stringify({
			extends: ['ash-nazg'],
		}),
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				typescript: '*',
				prettier: '*',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should migrate legacy config file', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		[legacyConfigFile]: stringify({ rules: { 'no-foo': 2 } }),
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});
