// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const get = require('lodash/get');
const { MrmError } = require('mrm-core');
const directories = require('./directories');

/* eslint-disable no-console */

const CONFIG_FILE = 'config.json';

/**
 * Return all task and alias names and descriptions from all search directories.
 *
 * @return {Object}
 */
function getAllTasks() {
	const allTasks = config('aliases', {});
	for (const dir of directories) {
		const tasks = glob.sync(`${dir}/*/index.js`);
		tasks.forEach(filename => {
			const taskName = path.basename(path.dirname(filename));
			if (!allTasks[taskName]) {
				const module = require(filename);
				allTasks[taskName] = module.description || '';
			}
		});
	}
	return allTasks;
}

/**
 * Run an alias.
 *
 * @param {string} aliasName
 */
function runAlias(aliasName) {
	const tasks = config('aliases', {})[aliasName];
	if (!tasks) {
		throw new MrmError(`Alias "${aliasName}" not found.`);
	}

	console.log(chalk.yellow(`Running alias ${aliasName}...`));

	tasks.forEach(runTask);
}

/**
 * Run a task.
 *
 * @param {string} taskName
 * @param {object} [params]
 */
function runTask(taskName, params) {
	const filename = tryFile(`${taskName}/index.js`);
	if (!filename) {
		throw new MrmError(`Task "${taskName}" not found.`);
	}

	console.log(chalk.cyan(`Running ${taskName}...`));

	const module = require(filename);
	module(config, params);
}

/**
 * Return a config value.
 *
 * @param {string} [prop]
 * @param {any} [defaultValue]
 * @return {any}
 */
function config(prop, defaultValue) {
	if (!prop) {
		return getConfig();
	}

	return get(getConfig(), prop, defaultValue);
}

/**
 * Find and load config file.
 *
 * @param {string} [filename]
 * @return {Object}
 */
function getConfig(filename = CONFIG_FILE) {
	const filepath = tryFile(filename);
	if (!filepath) {
		throw new MrmError('Config not found.');
	}

	return require(filepath);
}

/**
 * Try to load a file from a list of folders.
 *
 * @param {string} filename
 * @return {string|undefined} Absolute path or undefined
 */
function tryFile(filename) {
	for (const dir of directories) {
		const filepath = path.resolve(dir, filename);
		if (fs.existsSync(filepath)) {
			return filepath;
		}
	}
	return undefined;
}

module.exports = {
	getAllTasks,
	runTask,
	runAlias,
	config,
	getConfig,
	tryFile,
};
