'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const glob = require('glob');
const chalk = require('chalk');
const get = require('lodash/get');
const codeFrame = require('babel-code-frame');
const stripBom = require('strip-bom');
const userHome = require('user-home');
const MrmError = require('./error');

/* eslint-disable no-console */

const DIRS = [
	path.resolve(userHome, 'dotfiles/mrm'),
	path.resolve(userHome, '.mrm'),
	path.resolve(__dirname, '../src/tasks'),
];

function applyTemplate(templateFile, context) {
	const template = readFile(templateFile).replace(/`/g, '\\`');
	try {
		return vm.runInNewContext('`' + template + '`', context);
	}
	catch (exception) {
		const m = exception.stack.match(/evalmachine\.<anonymous>:(\d+)(?::(\d+))?\n/);
		const line = m[1];
		const col = m[2] || 1;
		const code = codeFrame(template, Number(line), Number(col));
		throw new MrmError(`Error in template ${templateFile}:${line}:${col}\n${exception.message}\n\n${code}`);
	}
}

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

function printStatus(filename, updated) {
	const message = updated ? 'Updated' : 'Created';
	console.log(chalk.green(`${message} ${filename}`));
}

function readFile(filepath) {
	return stripBom(fs.readFileSync(filepath, 'utf8'));
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
		throw new MrmError(`Command "${taskName}" not found.`);
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

function updateFile(filename, content, originalContent, exists) {
	if (content.trim() !== originalContent.trim()) {
		fs.writeFileSync(filename, content);
		printStatus(filename, exists);
	}
}

module.exports = {
	applyTemplate,
	config,
	getAllTasks,
	getConfig,
	printStatus,
	readFile,
	runAlias,
	runTask,
	tryFile,
	updateFile,
};
