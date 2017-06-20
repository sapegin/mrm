// @ts-check
'use strict';
/* eslint-disable no-console */

jest.mock('../directories');

const path = require('path');
const { tryFile, getConfig, config, runTask, runAlias, getAllTasks } = require('../index');
const task1 = require('../../test/dir1/task1');
const task2 = require('../../test/dir1/task2');
const task3 = require('../../test/dir2/task3');

const file = name => path.join(__dirname, '../../test', name);

describe('tryFile', () => {
	it('should return an absolute file path if the file exists', () => {
		expect(tryFile('task1/index.js')).toBe(file('dir1/task1/index.js'));
		expect(tryFile('task3/index.js')).toBe(file('dir2/task3/index.js'));
	});

	it('should return undefined if the file doesn’t exist', () => {
		const result = tryFile('pizza');
		expect(result).toBeFalsy();
	});
});

describe('getConfig', () => {
	it('should return a config object', () => {
		const result = getConfig();
		expect(result).toMatchObject({ pizza: 'salami' });
	});

	it('should throw when file not found', () => {
		const fn = () => getConfig('pizza');
		expect(fn).toThrowError('not found');
	});
});

describe('config', () => {
	it('should return a config object', () => {
		const result = config();
		expect(result).toMatchObject({ pizza: 'salami' });
	});

	it('should return a config option value', () => {
		const result = config('pizza');
		expect(result).toBe('salami');
	});

	it('should return a default value when option is not defined', () => {
		const result = config('coffee', 'americano');
		expect(result).toBe('americano');
	});
});

describe('runTask', () => {
	afterAll(() => {
		task1.mockClear();
	});

	it('should run a module', () => {
		runTask('task1');
		expect(task1).toHaveBeenCalledTimes(1);
	});

	it('should pass a config function and a params object to a module', () => {
		const params = { coffee: 'cappuccino' };
		runTask('task1', params);
		expect(task1).toHaveBeenCalledWith(expect.any(Function), params);
	});

	it('should throw when module not found', () => {
		const fn = () => runTask('pizza');
		expect(fn).toThrowError('not found');
	});
});

describe('runAlias', () => {
	afterAll(() => {
		task1.mockClear();
		task2.mockClear();
		task3.mockClear();
	});

	it('should run all tasks defined in an alias', () => {
		runAlias('alias1');
		expect(task1).toHaveBeenCalledTimes(1);
		expect(task2).toHaveBeenCalledTimes(0);
		expect(task3).toHaveBeenCalledTimes(1);
	});

	it('should throw when alias not found', () => {
		const fn = () => runAlias('pizza');
		expect(fn).toThrowError('not found');
	});
});

describe('getAllTasks', () => {
	it('should run all tasks defined in an alias', () => {
		const result = getAllTasks();
		expect(result).toEqual({
			alias1: ['task1', 'task3'],
			task1: 'Taks 1.1',
			task2: 'Taks 1.2',
			task3: 'Taks 2.3',
		});
	});
});
