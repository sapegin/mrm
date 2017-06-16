'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const get = require('lodash/get');
const userHome = require('user-home');
const { MrmError } = require('mrm-core');

/* eslint-disable no-console */

const DIRS = [
	path.resolve(userHome, 'dotfiles/mrm'),
	path.resolve(userHome, '.mrm'),
	path.resolve(__dirname, '../src/tasks'),
];

function config(prop, defaultValue) {
	if (!prop) {
		return getConfig();
	}

	return get(getConfig(), prop, defaultValue);
}

function getAllTasks() {
	const allTasks = config('aliases', {});
	for (const dir of DIRS) {
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

function getConfig() {
	const filename = tryFile('config.json');
	if (!filename) {
		throw new MrmError('Config not found.');
	}

	return require(filename);
}

function runAlias(aliasName) {
	const tasks = config('aliases', {})[aliasName];
	if (!tasks) {
		throw new MrmError(`Alias "${aliasName}" not found.`);
	}

	console.log(chalk.yellow(`Running alias ${aliasName}...`));

	tasks.forEach(runTask);
}

function runTask(taskName, params) {
	const filename = tryFile(`${taskName}/index.js`);
	if (!filename) {
		throw new MrmError(`Task "${taskName}" not found.`);
	}

	console.log(chalk.cyan(`Running ${taskName}...`));

	const module = require(filename);
	return module(config, params);
}

function tryFile(filename) {
	for (const dir of DIRS) {
		const filepath = path.resolve(dir, filename);
		if (fs.existsSync(filepath)) {
			return filepath;
		}
	}
	return false;
}

module.exports = {
	config,
	getAllTasks,
	getConfig,
	runAlias,
	runTask,
	tryFile,
};
