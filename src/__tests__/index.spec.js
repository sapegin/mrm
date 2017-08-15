// @ts-check
'use strict';
/* eslint-disable no-console */

const path = require('path');
const {
	tryFile,
	getConfigFromFile,
	getConfigFromCommandLine,
	getConfig,
	getConfigGetter,
	runTask,
	runAlias,
	run,
	getAllAliases,
	getAllTasks,
	getBinaryName,
} = require('../index');
const task1 = require('../../test/dir1/task1');
const task2 = require('../../test/dir1/task2');
const task3 = require('../../test/dir2/task3');

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
		alias1: ['task1', 'task3'],
	},
};
const argv = {
	_: [],
	div: '~/pizza',
	'config:foo': 42,
	'config:bar': 'coffee',
};

const file = name => path.join(__dirname, '../../test', name);

describe('tryFile', () => {
	it('should return an absolute file path if the file exists', () => {
		expect(tryFile(directories, 'task1/index.js')).toBe(file('dir1/task1/index.js'));
		expect(tryFile(directories, 'task3/index.js')).toBe(file('dir2/task3/index.js'));
	});

	it('should return undefined if the file doesn’t exist', () => {
		const result = tryFile([], 'pizza');
		expect(result).toBeFalsy();
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
		const result = getConfig(directories, configFile, { 'config:pizza': 'quattro formaggi' });
		expect(result).toMatchObject({
			pizza: 'quattro formaggi',
		});
	});
});

describe('getConfigGetter', () => {
	it('should return a function', () => {
		const result = getConfigGetter({}, 'pizza', directories);
		expect(result).toEqual(expect.any(Function));
	});

	it('should return a full config object if a property name wasn’t passed', () => {
		const config = getConfigGetter(options, 'pizza', directories);
		const result = config();
		expect(result).toEqual(options);
	});

	it('function should return a config option value', () => {
		const config = getConfigGetter(options, 'pizza', directories);
		const result = config('pizza');
		expect(result).toBe('salami');
	});

	it('function should return a default valueif if a config option is not defined', () => {
		const config = getConfigGetter({}, 'pizza', directories);
		const result = config('pizza', 'salami');
		expect(result).toBe('salami');
	});

	it('function should throw if a config option not defined and no default value provided', () => {
		const config = getConfigGetter({}, 'pizza', directories);
		const fn = () => config('pizza');
		expect(fn).toThrowError('Config option "pizza" is not defined');
	});
});

describe('runTask', () => {
	beforeEach(() => {
		task1.mockClear();
	});

	it('should run a module', () => {
		runTask('task1', directories, {}, {});
		expect(task1).toHaveBeenCalledTimes(1);
	});

	it('should pass a config function and a params object to a module', () => {
		const params = { coffee: 'cappuccino' };
		runTask('task1', directories, options, params);
		expect(task1).toHaveBeenCalledWith(expect.any(Function), params);
		expect(task1.mock.calls[0][0]()).toEqual(options);
	});

	it('should throw when module not found', () => {
		const fn = () => runTask('pizza', directories, {}, {});
		expect(fn).toThrowError('not found');
	});
});

describe('runAlias', () => {
	beforeEach(() => {
		task1.mockClear();
		task2.mockClear();
		task3.mockClear();
	});

	it('should run all tasks defined in an alias', () => {
		runAlias('alias1', directories, optionsWithAliases, {});
		expect(task1).toHaveBeenCalledTimes(1);
		expect(task2).toHaveBeenCalledTimes(0);
		expect(task3).toHaveBeenCalledTimes(1);
	});

	it('should throw when alias not found', () => {
		const fn = () => runAlias('pizza', directories, optionsWithAliases, {});
		expect(fn).toThrowError('not found');
	});
});

describe('run', () => {
	beforeEach(() => {
		task1.mockClear();
		task2.mockClear();
		task3.mockClear();
	});

	it('should run a task', () => {
		run('task1', directories, optionsWithAliases, {});
		expect(task1).toHaveBeenCalledTimes(1);
	});

	it('should run all tasks defined in an alias', () => {
		run('alias1', directories, optionsWithAliases, {});
		expect(task1).toHaveBeenCalledTimes(1);
		expect(task2).toHaveBeenCalledTimes(0);
		expect(task3).toHaveBeenCalledTimes(1);
	});

	it('should run multiple tasks', () => {
		run(['task1', 'task2'], directories, optionsWithAliases, {});
		expect(task1).toHaveBeenCalledTimes(1);
		expect(task2).toHaveBeenCalledTimes(1);
	});
});

describe('getAllAliases', () => {
	it('should return all aliases', () => {
		const result = getAllAliases(optionsWithAliases);
		expect(result).toEqual({
			alias1: ['task1', 'task3'],
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
			alias1: ['task1', 'task3'],
			task1: 'Taks 1.1',
			task2: 'Taks 1.2',
			task3: 'Taks 2.3',
		});
	});
});

describe('getBinaryName', () => {
	it('should return a binary name', () => {
		const result = getBinaryName();
		expect(result).toBe('mrm');
	});

	it('should return a binary name if ran via npx', () => {
		const _ = process.env._;
		process.env._ = '/bin/npx';

		const result = getBinaryName();
		expect(result).toBe('npx mrm');

		process.env._ = _;
	});
});
