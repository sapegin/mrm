// @ts-check
/* eslint-disable no-console */

const path = require('path');
const {
	promiseFirst,
	tryFile,
	resolveUsingNpx,
	getConfigFromFile,
	getConfigFromCommandLine,
	getConfig,
	getTaskOptions,
	runTask,
	runAlias,
	run,
	getAllAliases,
	getAllTasks,
	getPackageName,
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

const configFile = 'config.json';
const directories = [
	path.resolve(__dirname, '../../test/dir1'),
	path.resolve(__dirname, '../../test/dir2'),
	path.resolve(__dirname, '../../test/dir3'),
	path.resolve(__dirname, '../../test/dir4'),
];
const presetDir = [path.resolve(__dirname, '../../test/dir6')];
const options = {
	pizza: 'salami',
};
const optionsWithAliases = {
	aliases: {
		alias1: ['task1', 'task3', 'task4'],
		alias2: ['task4', 'task5'],
		alias3: ['task1', 'alias2'],
	},
};
const argv = {
	_: [],
	div: '~/pizza',
	'config:foo': 42,
	'config:bar': 'coffee',
};

const file = name => path.join(__dirname, '../../test', name);

describe('promiseFirst', () => {
	it('should return the first resolving function', async () => {
		const result = await promiseFirst([
			() => Promise.reject(),
			() => Promise.reject(),
			() => Promise.resolve('pizza'),
			() => Promise.reject(),
			() => Promise.reject('cappuccino'),
		]);
		expect(result).toMatch('pizza');
	});

	it('should return reject if no resolving function is found', () => {
		const result = promiseFirst([
			() => Promise.reject(),
			() => Promise.reject(),
			() => Promise.reject(),
		]);
		return expect(result).rejects.toHaveProperty(
			'message',
			'None of the 3 thunks resolved.\n\n\n\n'
		);
	});
});

describe('tryFile', () => {
	it('should return an absolute file path if the file exists', async () => {
		let result;
		result = await tryFile(directories, 'task1/index.js');
		expect(result).toBe(file('dir1/task1/index.js'));
		result = await tryFile(directories, 'task3/index.js');
		expect(result).toBe(file('dir2/task3/index.js'));
	});

	it('should return undefined if the file doesn’t exist', () => {
		const result = tryFile([], 'pizza');

		// ideally we can use toThrowError but that works with >= jest@22
		// https://github.com/facebook/jest/issues/5076
		return expect(result).rejects.toHaveProperty(
			'message',
			'File “pizza” not found.'
		);
	});
});

describe('resolveUsingNpx', () => {
	it('should install an npm module transparently', async () => {
		const result = await resolveUsingNpx('yarnhook');
		expect(result).toMatch(
			/\.npm\/_npx\/\d*\/lib(64)?\/node_modules\/yarnhook\/index\.js$/
		);
	});

	it('should throw if npm module is not found on the registry', () => {
		const result = resolveUsingNpx('this-package-is-not-on-npm');
		return expect(result).rejects.toHaveProperty(
			'message',
			`Install for this-package-is-not-on-npm failed with code 1`
		);
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
	it('should return a config object', async () => {
		const result = await getConfigFromFile(directories, configFile);
		expect(result).toMatchObject(options);
	});

	it('should return an empty object when file not found', async () => {
		const result = await getConfigFromFile(directories, 'pizza');
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
	it('should return a config object', async () => {
		const result = await getConfig(directories, configFile, argv);
		expect(result).toMatchObject({
			pizza: 'salami',
			foo: 42,
			bar: 'coffee',
		});
	});

	it('should return an empty object when file not found and no CLI options provided', async () => {
		const result = await getConfig(directories, 'pizza', {});
		expect(result).toEqual({});
	});

	it('CLI options should override options from config file', async () => {
		const result = await getConfig(directories, configFile, {
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
		const pizza = runTask('this-does-not-exist-on-npm', directories, {}, {});

		// ideally we can use toThrowError but that works with >= jest@22
		// https://github.com/facebook/jest/issues/5076
		return expect(pizza).rejects.toHaveProperty(
			'message',
			'Task “this-does-not-exist-on-npm” not found.'
		);
	}, 20000);

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

	it('should run alias when referencing another alias', () => {
		return new Promise((resolve, reject) => {
			runAlias('alias3', directories, optionsWithAliases, { stack: [] })
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
					expect(task4).toHaveBeenCalledTimes(1);
					expect(task5).toHaveBeenCalledTimes(1);
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

	it('should run a task in a custom preset', () => {
		return new Promise((resolve, reject) => {
			run('task1', presetDir, optionsWithAliases, {})
				.then(() => {
					expect(task1).toHaveBeenCalledTimes(1);
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
			alias3: ['task1', 'alias2'],
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
			alias3: ['task1', 'alias2'],
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
