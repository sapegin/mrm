// @ts-check
/* eslint-disable no-console */

const path = require('path');
const {
	firstResult,
	tryFile,
	tryResolve,
	getConfigFromFile,
	getConfigFromCommandLine,
	getConfig,
	getConfigGetter,
	runTask,
	runAlias,
	run,
	getAllAliases,
	getAllTasks,
} = require('../index');
const task1 = require('../../test/dir1/task1');
const task2 = require('../../test/dir1/task2');
const task3 = require('../../test/dir2/task3');
const task4 = require('../../test/dir2/task4');
const task5 = require('../../test/dir2/task5');

const configFile = 'config.json';
const directories = [
	path.resolve(__dirname, '../../test/dir1'),
	path.resolve(__dirname, '../../test/dir2'),
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

describe('getConfigGetter', () => {
	it('should return an API', () => {
		const result = getConfigGetter({});
		expect(result).toEqual(expect.any(Function));
		expect(result.require).toEqual(expect.any(Function));
		expect(result.defaults).toEqual(expect.any(Function));
		expect(result.values).toEqual(expect.any(Function));
	});

	it('config function should return a config option value', () => {
		const config = getConfigGetter(options);
		const result = config('pizza');
		expect(result).toBe('salami');
	});

	it('config function should return a default valueif if a config option is not defined', () => {
		const config = getConfigGetter({});
		const result = config('pizza', 'salami');
		expect(result).toBe('salami');
	});

	it('values function should return options object', () => {
		const options = { coffee: 'americano' };
		const config = getConfigGetter(options);
		const result = config.values();
		expect(result).toEqual(options);
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
			const params = { coffee: 'cappuccino' };

			runTask('task1', directories, options, params)
				.then(() => {
					expect(task1).toHaveBeenCalledWith(expect.any(Function), params);
					expect(task1.mock.calls[0][0]('pizza')).toEqual('salami');
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
		});
	});
});
