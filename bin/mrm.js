#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const minimist = require('minimist');
const chalk = require('chalk');
const longest = require('longest');
const padEnd = require('lodash/padEnd');
const sortBy = require('lodash/sortBy');
const { config, runAlias, runTask, getAllTasks } = require('../src/index');
const MrmError = require('../src/error');

process.on('uncaughtException', err => {
	if (err instanceof MrmError) {
		console.error(chalk.bold.red(err.message));
		console.log();
		process.exit(1);
	}
	else {
		throw err;
	}
});

const argv = minimist(process.argv.slice(2));
const command = argv._[0];

if (command === 'help' || !command) {
	commandHelp();
}
else {
	try {
		if (config('aliases', {})[command]) {
			runAlias(command);
		}
		else {
			runTask(command, argv);
		}
	}
	catch (err) {
		if (err instanceof MrmError && /(Alias|Command) ".*?" not found/.test(err.message)) {
			console.error(chalk.bold.red(err.message));
			console.log();
			commandHelp();
		}
		else {
			throw err;
		}
	}
}

function commandHelp() {
	console.log([
		chalk.underline('Usage'),
		'',
		'    ' + chalk.bold('mrm') + ' ' + chalk.cyan('<command>') + ' ' + chalk.yellow('[<options>]'),
		'',
		chalk.underline('Available commands'),
		'',
		getCommandsList(),
		'',
	].join('\n'));
}

function getCommandsList() {
	const tasks = getAllTasks();
	const names = sortBy(Object.keys(tasks));
	const nameColWidth = longest(names).length;

	return names.map(name => {
		const description = Array.isArray(tasks[name])
			? `Runs ${tasks[name].join(', ')}`
			: tasks[name]
		;
		return (
			'    ' +
			chalk.bold(padEnd(name, nameColWidth)) +
			'  ' +
			description
		);
	}).join('\n');
}
