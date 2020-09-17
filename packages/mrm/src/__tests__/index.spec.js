// @ts-check
/* eslint-disable no-console */
jest.mock('cross-spawn');

const path = require('path');
const spawn = require('cross-spawn');
const {
	firstResult,
	tryFile,
	tryResolve,
	getConfigFromFile,
	getConfigFromCommandLine,
	getConfig,
	getConfigGetter,
	getTaskOptions,
	runTask,
	runAlias,
	run,
	getAllAliases,
	getAllTasks,
	getPackageName,
	getGlobalPackageName,
	installGlobalPackage,
} = require('../index');
const configureInquirer = require('../../test/inquirer-mock');
const task1 = require('../../test/dir1/task1');
const task2 = require('../../test/dir1/task2');
const task3 = require('../../test/dir2/task3');
const task4 = require('../../test/dir2/task4');
const task5 = require('../../test/dir2/task5');
// interactive config tasks
const task6 = require('../../test/dir3/task6');
const task8 = require('../../test/dir5/task8');

const spawnOnErrorMock = jest.fn();
const spawnOnCloseMock = jest.fn();
spawnOnErrorMock.mockReturnValue({ on: spawnOnCloseMock });
spawnOnCloseMock.mockImplementation((_, cb) => {
	cb();
});

const configFile = 'config.json';
const directories = [
	path.resolve(__dirname, '../../test/dir1'),
	path.resolve(__dirname, '../../test/dir2'),
	path.resolve(__dirname, '../../test/dir3'),
	path.resolve(__dirname, '../../test/dir4'),
];
const options = {
	pizza: 'salami',
};
const optionsWithAliases = {
	aliases: {
		alias1: ['task1', 'task3', 'task4'],
		alias2: ['task4', 'task5'],
	},
};
const argv = {
	_: [],
	div: '~/pizza',
	'config:foo': 42,
	'config:bar': 'coffee',
};

const file = name => path.join(__dirname, '../../test', name);

afterEach(() => {
	spawn.mockClear();
	spawnOnErrorMock.mockClear();
	spawnOnCloseMock.mockClear();
});

describe('firstResult', () => {
	it('should return the first truthy result', () => {
		const result = firstResult(
			[0, undefined, 'pizza', false, 'cappuccino'],
			a => a
		);
		expect(result).toMatch('pizza');
	});

	it('should return undefined if no truthy results found', () => {
		const result = firstResult([0, undefined, false, ''], a => a);
		expect(result).toBeFalsy();
	});
});

describe('tryFile', () => {
	it('should return an absolute file path if the file exists', () => {
		expect(tryFile(directories, 'task1/index.js')).toBe(
			file('dir1/task1/index.js')
		);
		expect(tryFile(directories, 'task3/index.js')).toBe(
			file('dir2/task3/index.js')
		);
	});

	it('should return undefined if the file doesn’t exist', () => {
		const result = tryFile([], 'pizza');
		expect(result).toBeFalsy();
	});
});

describe('tryResolve', () => {
	it('should resolve an npm module if it’s installed', () => {
		const result = tryResolve('listify');
		expect(result).toMatch('node_modules/listify/index.js');
	});

	it('should resolve the first installed npm module', () => {
		const result = tryResolve('pizza', 'listify');
		expect(result).toMatch('node_modules/listify/index.js');
	});

	it('should return undefined if none of the npm mudules are installed', () => {
		const result = tryResolve('pizza', 'cappuccino');
		expect(result).toBeFalsy();
	});

	it('should not throw when undefined was passed instead of a module name', () => {
		const fn = () => tryResolve(undefined);
		expect(fn).not.toThrowError();
	});
});

describe('installGlobalPackage', () => {
	it('should resolve to true if able to install the package', async () => {
		spawn.mockReturnValueOnce({ on: spawnOnErrorMock });
		const pkgName = String(Date.now());
		const result = await installGlobalPackage(pkgName);
		expect(spawn).toBeCalledWith('npm', ['install', '--global', pkgName], {
			stdio: 'inherit',
		});
		expect(spawnOnErrorMock.mock.calls[0][0]).toBe('error');
		expect(spawnOnErrorMock.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(spawnOnCloseMock.mock.calls[0][0]).toBe('close');
		expect(spawnOnCloseMock.mock.calls[0][1]).toBeInstanceOf(Function);
		expect(result).toBeTruthy();
	});

	it('should reject if unable able to install the package', async () => {
		spawn.mockReturnValueOnce({ on: spawnOnErrorMock });
		const error = Date.now();
		spawnOnErrorMock.mockImplementation((_, cb) => {
			cb(error);
		});
		spawnOnCloseMock.mockImplementation(() => {});
		const pkgName = String(Date.now());

		try {
			await installGlobalPackage(pkgName);
			throw new Error('Should have thrown');
		} catch (err) {
			expect(err).toBe(error);
		}
	});
});
describe('getGlobalPackageName', () => {
	it('should resolve to the package name if selected by the user and it can be installed', async () => {
		configureInquirer({ pkgName: 'mrm-preset-default' });
		const result = await getGlobalPackageName(
			'mrm-preset-default',
			'pizza',
			''
		);
		expect(result).toMatch('mrm-preset-default');
	});

	it('should resolve to undefined if none of the packages are selected', async () => {
		configureInquirer({ pkgName: '' });
		const result = await getGlobalPackageName('pizza', 'cappuccino');
		expect(result).toBeFalsy();
	});

	it('should resolve to undefined if none of the npm modules exist', async () => {
		const result = await getGlobalPackageName('');
		expect(result).toBeFalsy();
	});
});

describe('getPackageName', () => {
	it('should resolve non-scoped task names', () => {
		const result = getPackageName('task', 'pizza');
		expect(result).toEqual('mrm-task-pizza');
	});
	it('should resolve non-scoped preset names', () => {
		const result = getPackageName('preset', 'default');
		expect(result).toEqual('mrm-preset-default');
	});
	it('should resolve scoped task names', () => {
		const result = getPackageName('task', '@myorg/pizza');
		expect(result).toEqual('@myorg/mrm-task-pizza');
	});
	it('should resolve scoped preset names', () => {
		const result = getPackageName('preset', '@myorg/default');
		expect(result).toEqual('@myorg/mrm-preset-default');
	});
});

describe('getConfigFromFile', () => {
	it('should return a config object', () => {
		const result = getConfigFromFile(directories, configFile);
		expect(result).toMatchObject(options);
	});

	it('should return an empty object when file not found', () => {
		const result = getConfigFromFile(directories, 'pizza');
		expect(result).toEqual({});
	});
});

describe('getConfigFromCommandLine', () => {
	it('should return a config object', () => {
		const result = getConfigFromCommandLine(argv);
		expect(result).toEqual({
			foo: 42,
			bar: 'coffee',
		});
	});

	it('should return an empty object when no config options found', () => {
		const result = getConfigFromCommandLine({
			_: [],
			div: '~/pizza',
		});
		expect(result).toEqual({});
	});
});

describe('getConfig', () => {
	it('should return a config object', () => {
		const result = getConfig(directories, configFile, argv);
		expect(result).toMatchObject({
			pizza: 'salami',
			foo: 42,
			bar: 'coffee',
		});
	});

	it('should return an empty object when file not found and no CLI options provided', () => {
		const result = getConfig(directories, 'pizza', {});
		expect(result).toEqual({});
	});

	it('CLI options should override options from config file', () => {
		const result = getConfig(directories, configFile, {
			'config:pizza': 'quattro formaggi',
		});
		expect(result).toMatchObject({
			pizza: 'quattro formaggi',
		});
	});
});

describe('getTaskOptions', () => {
	const third = task6.parameters['third-config'];

	beforeEach(() => third.default.mockClear());

	describe('interactive mode', () => {
		it('should prompt values', async () => {
			configureInquirer({
				'first-config': 'first value',
				'second-config': 'second value',
				// 'third-config': keep default
			});

			const answers = await getTaskOptions(task6, true, {
				'second-config': 'second value',
			});

			expect(answers).toEqual({
				'first-config': 'first value',
				'second-config': 'second value',
				'third-config': 'eulav dnoces',
			});
		});

		it('should respect parameters default values', async () => {
			configureInquirer({});

			const answers = await getTaskOptions(task6, true);

			expect(answers).toEqual({
				'first-config': '',
				'second-config': 'default value',
				'third-config': '',
			});
		});

		it('should be possible to override parameters default values', async () => {
			configureInquirer({});

			const answers = await getTaskOptions(task6, true, {
				'first-config': 'initial',
			});

			expect(answers).toEqual({
				'first-config': 'initial',
				'second-config': 'default value',
				'third-config': '',
			});
		});

		it('should use default values for static options and do not propmpt them', async () => {
			configureInquirer({
				'interactive-config': 'pizza',
				'static-config': 'second value', // this value shouldn't be used
			});

			const answers = await getTaskOptions(task8, true);

			expect(answers).toEqual({
				'interactive-config': 'pizza',
				'static-config': 'default value',
			});
		});
	});

	describe('non-interactive mode', () => {
		it('should use default values for static options', async () => {
			const answers = await getTaskOptions(task6, false);
			expect(answers).toEqual({
				'first-config': undefined,
				'second-config': 'default value',
				'third-config': undefined,
			});
		});

		it('should NOT prompt when interactive mode is disabled', async () => {
			configureInquirer({
				'first-config': 'should not be used',
				'second-config': 'should not be used',
				'third-config': 'should not be used',
			});

			const answers = await getTaskOptions(task6, false);
			expect(answers).toEqual({
				'first-config': undefined,
				'second-config': 'default value',
				'third-config': undefined,
			});
		});

		it('should validate options: valid', async () => {
			const answers = await getTaskOptions(task8, false, {
				'interactive-config': 'pizza',
			});
			expect(answers).toEqual({
				'interactive-config': 'pizza',
				'static-config': 'default value',
			});
		});

		it('should validate options: invalid', async () => {
			try {
				await getTaskOptions(task8, false);
			} catch (err) {
				expect(err.message).toBe(
					'Missing required config options: interactive-config.'
				);
			}
		});
	});
});

describe('getConfigGetter', () => {
	it('config should return config values', () => {
		const config = getConfigGetter(options);
		expect(config).toMatchObject({ pizza: 'salami' });
	});
});

describe('getConfigGetter (deprecated)', () => {
	it('should return an API', () => {
		const result = getConfigGetter({});
		expect(result.require).toEqual(expect.any(Function));
		expect(result.defaults).toEqual(expect.any(Function));
		expect(result.values).toEqual(expect.any(Function));
	});

	it('values function should return options object', () => {
		const opts = { coffee: 'americano' };
		const config = getConfigGetter(opts);
		const result = config.values();
		expect(result).toEqual(opts);
	});

	it('require function should not throw if all config options are defined', () => {
		const config = getConfigGetter({ coffee: 'americano' });
		const fn = () => config.require('coffee');
		expect(fn).not.toThrowError();
	});

	it('require function should throw if some config options are not defined', () => {
		const config = getConfigGetter({ coffee: 'americano' });
		const fn = () => config.require('pizza', 'coffee');
		expect(fn).toThrowError('Required config options are missed: pizza');
	});

	it('require function should throw if some config options are "undefined", "null" or ""', () => {
		const config = getConfigGetter({ a: undefined, b: null, c: '' });
		const fn = () => config.require('a', 'b', 'c');
		expect(fn).toThrowError('Required config options are missed: a, b, c');
	});

	it('defaults function should update not defined options', () => {
		const config = getConfigGetter({ coffee: 'americano' });
		config.defaults({ coffee: 'cappuccino', pizza: 'salami' });
		expect(config.values()).toEqual({ coffee: 'americano', pizza: 'salami' });
	});
});

describe('runTask', () => {
	beforeEach(() => {
		task1.mockClear();
		task4.mockClear();
		task6.mockClear();
	});

	it('should run a module', () => {
		return new Promise((resolve, reject) => {
			runTask('task1', directories, {}, {})
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should pass a config function and a params object to a module', () => {
		return new Promise((resolve, reject) => {
			runTask('task1', directories, options, { interactive: false })
				.then(() => {
					expect(task1).toHaveBeenCalledWith(
						expect.objectContaining({ pizza: 'salami' }),
						{ interactive: false }
					);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should throw when module not found', () => {
		const pizza = runTask('pizza', directories, {}, {});

		// ideally we can use toThrowError but that works with >= jest@22
		// https://github.com/facebook/jest/issues/5076
		return expect(pizza).rejects.toHaveProperty(
			'message',
			'Task “pizza” not found.'
		);
	});

	it('should throw when task module is invalid', () => {
		const result = runTask('task7', directories, {}, {});

		// ideally we can use toThrowError but that works with >= jest@22
		// https://github.com/facebook/jest/issues/5076
		return expect(result).rejects.toHaveProperty(
			'message',
			'Cannot call task “task7”.'
		);
	});

	it('should run an async module', () => {
		return new Promise((resolve, reject) => {
			runTask('task4', directories, {}, { stack: [] })
				.then(() => {
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task4.mock.calls[0][1].stack).toEqual(['Task 2.4']);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should prompt interactive configs when interactive mode is on', async () => {
		configureInquirer({
			'first-config': 'value',
			'second-config': 'other value',
		});

		await runTask('task6', directories, {}, { interactive: true });

		expect(task6).toHaveBeenCalledTimes(1);
		expect(task6).toHaveBeenCalledWith(
			expect.objectContaining({
				'first-config': 'value',
				'second-config': 'other value',
			}),
			{ interactive: true }
		);
	});

	it('should respect config defaults from task parameters when interactive mode is on', async () => {
		configureInquirer({ 'first-config': 'value' });

		await runTask('task6', directories, {}, { interactive: true });

		expect(task6).toHaveBeenCalledTimes(1);
		expect(task6).toHaveBeenCalledWith(
			expect.objectContaining({
				'first-config': 'value',
				'second-config': 'default value',
			}),
			{ interactive: true }
		);
	});

	it('should respect config defaults from task parameters when interactive mode is off', async () => {
		await runTask('task6', directories, {}, { interactive: false });

		expect(task6).toHaveBeenCalledTimes(1);
		expect(task6).toHaveBeenCalledWith(
			expect.objectContaining({
				'first-config': undefined,
				'second-config': 'default value',
			}),
			{ interactive: false }
		);
	});

	it('should run normally when interactive mode is on but task has no interactive parameters', async () => {
		await runTask('task3', directories, {}, { interactive: true });
		expect(task3).toHaveBeenCalledTimes(1);
	});
});

describe('runAlias', () => {
	beforeEach(() => {
		task1.mockClear();
		task2.mockClear();
		task3.mockClear();
		task4.mockClear();
		task5.mockClear();
	});

	it('should run all tasks defined in an alias', () => {
		return new Promise((resolve, reject) => {
			runAlias('alias1', directories, optionsWithAliases, { stack: [] })
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
					expect(task2).toHaveBeenCalledTimes(0);
					expect(task3).toHaveBeenCalledTimes(1);
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task4.mock.calls[0][1].stack).toEqual(['Task 2.4']);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should throw when alias not found', () => {
		const pizza = runAlias('pizza', directories, optionsWithAliases, {});
		return expect(pizza).rejects.toHaveProperty(
			'message',
			'Alias “pizza” not found.'
		);
	});

	it('should run alias tasks in sequence', () => {
		return new Promise((resolve, reject) => {
			const stack = [];

			runAlias(['alias2'], directories, optionsWithAliases, { stack })
				.then(() => {
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task5).toHaveBeenCalledTimes(1);
					expect(stack).toEqual(['Task 2.4', 'Task 2.5']);
					resolve();
				})
				.catch(reject);
		});
	});
});

describe('run', () => {
	beforeEach(() => {
		task1.mockClear();
		task2.mockClear();
		task3.mockClear();
		task4.mockClear();
		task5.mockClear();
	});

	it('should run a task', () => {
		return new Promise((resolve, reject) => {
			run('task1', directories, optionsWithAliases, {})
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should run all tasks defined in an alias', () => {
		return new Promise((resolve, reject) => {
			run('alias1', directories, optionsWithAliases, { stack: [] })
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
					expect(task2).toHaveBeenCalledTimes(0);
					expect(task3).toHaveBeenCalledTimes(1);
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task4.mock.calls[0][1].stack).toEqual(['Task 2.4']);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should run multiple tasks', () => {
		return new Promise((resolve, reject) => {
			run(['task1', 'task2', 'task4'], directories, optionsWithAliases, {
				stack: [],
			})
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
					expect(task2).toHaveBeenCalledTimes(1);
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task4.mock.calls[0][1].stack).toEqual(['Task 2.4']);
					resolve();
				})
				.catch(reject);
		});
	});

	it('should run multiple tasks in sequence', () => {
		return new Promise((resolve, reject) => {
			const stack = [];
			run(['task4', 'task5'], directories, optionsWithAliases, { stack })
				.then(() => {
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task5).toHaveBeenCalledTimes(1);
					expect(stack).toEqual(['Task 2.4', 'Task 2.5']);
					resolve();
				})
				.catch(reject);
		});
	});
});

describe('getAllAliases', () => {
	it('should return all aliases', () => {
		const result = getAllAliases(optionsWithAliases);
		expect(result).toEqual({
			alias1: ['task1', 'task3', 'task4'],
			alias2: ['task4', 'task5'],
		});
	});

	it('should return an empty object when no aliases defined', () => {
		const result = getAllAliases(options);
		expect(result).toEqual({});
	});
});

describe('getAllTasks', () => {
	it('should return all available tasks', () => {
		const result = getAllTasks(directories, optionsWithAliases);
		expect(result).toEqual({
			alias1: ['task1', 'task3', 'task4'],
			alias2: ['task4', 'task5'],
			task1: 'Taks 1.1',
			task2: 'Taks 1.2',
			task3: 'Taks 2.3',
			task4: 'Taks 2.4',
			task5: 'Taks 2.5',
			task6: 'Taks 3.6',
			task7: '',
		});
	});
});
