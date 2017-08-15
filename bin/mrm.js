#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const minimist = require('minimist');
const chalk = require('chalk');
const longest = require('longest');
const updateNotifier = require('update-notifier');
const padEnd = require('lodash/padEnd');
const sortBy = require('lodash/sortBy');
const { run, getConfig, getAllTasks } = require('../src/index');
const directories = require('../src/directories');

const isMrmEror = err => err.constructor.name === 'MrmError';

// Update notifier
const pkg = require('../package.json');
updateNotifier({ pkg }).notify();

process.on('uncaughtException', err => {
	if (isMrmEror(err)) {
		console.error(chalk.bold.red(err.message));
		console.log();
		process.exit(1);
	} else {
		throw err;
	}
});

const argv = minimist(process.argv.slice(2));
const command = argv._[0];

const options = getConfig(directories, 'config.json', argv);

if (command === 'help' || !command) {
	commandHelp();
} else {
	try {
		run(command, directories, options, argv);
	} catch (err) {
		if (isMrmEror(err) && /(Alias|Task) ".*?" not found/.test(err.message)) {
			console.error(chalk.bold.red(err.message));
			console.log();
			commandHelp();
		} else {
			throw err;
		}
	}
}

function commandHelp() {
	console.log(
		[
			chalk.underline('Usage'),
			'',
			'    ' + chalk.bold('mrm') + ' ' + chalk.cyan('<task or alias>'),
			'    ' +
				chalk.bold('mrm') +
				' ' +
				chalk.cyan('<task or alias>') +
				' ' +
				chalk.yellow('--config:foo coffee --config:bar pizza'),
			'',
			chalk.underline('Available tasks'),
			'',
			getTasksList(options),
			'',
		].join('\n')
	);
}

function getTasksList() {
	const tasks = getAllTasks(directories, options);
	const names = sortBy(Object.keys(tasks));
	const nameColWidth = longest(names).length;

	return names
		.map(name => {
			const description = Array.isArray(tasks[name])
				? `Runs ${tasks[name].join(', ')}`
				: tasks[name];
			return '    ' + chalk.bold(padEnd(name, nameColWidth)) + '  ' + description;
		})
		.join('\n');
}
