#!/usr/bin/env node

'use strict';

/* eslint-disable no-console */

const path = require('path');
const minimist = require('minimist');
const chalk = require('chalk');
const longest = require('longest');
const isDirectory = require('is-directory');
const listify = require('listify');
const updateNotifier = require('update-notifier');
const padEnd = require('lodash/padEnd');
const sortBy = require('lodash/sortBy');
const { random } = require('middleearth-names');
const { run, getConfig, getAllTasks, getBinaryName } = require('../src/index');
const directories = require('../src/directories');

const isMrmEror = err => err.constructor.name === 'MrmError';

const EXAMPLES = [
	['', '', 'List of available tasks'],
	['<task>', '', 'Run a task or an alias'],
	['<task>', '--dir ~/unicorn', 'Custom config and tasks folder'],
	['<task>', '--config:foo coffee --config:bar pizza', 'Override config options'],
];

// Update notifier
const pkg = require('../package.json');
updateNotifier({ pkg }).notify();

process.on('uncaughtException', err => {
	if (isMrmEror(err)) {
		printError(err.message);
		process.exit(1);
	} else {
		throw err;
	}
});

const argv = minimist(process.argv.slice(2));
const tasks = argv._;

const binaryName = process.env._.endsWith('/npx') ? 'npx mrm' : 'mrm';

// Custom config / tasks directory
if (argv.dir) {
	const dir = path.resolve(argv.dir);
	if (!isDirectory.sync(dir)) {
		printError(`Directory "${dir} not found.`);
		process.exit(1);
	}

	directories.unshift(dir);
}

const options = getConfig(directories, 'config.json', argv);
if (tasks.length === 0 || tasks[0] === 'help') {
	commandHelp();
} else {
	try {
		run(tasks, directories, options, argv);
	} catch (err) {
		if (isMrmEror(err) && /(Alias|Task) ".*?" not found/.test(err.message)) {
			printError(err.message);
			commandHelp();
		} else if (isMrmEror(err) && /Required config options are missed/.test(err.message)) {
			const unknown = err.extra;
			const values = unknown.map(name => [name, random()]);
			const userDirectories = directories.slice(0, -1);
			printError(
				`${err.message}

1. Create "config.json" file:

{
${values.map(([n, v]) => `  "${n}": "${v}"`).join(',\n')}
}

In one of these folders:

- ${userDirectories.join('\n- ')}

2. Or pass the option via command line:

${binaryName} ${tasks.join(' ')} ${values.map(([n, v]) => `--config:${n} "${v}"`).join(' ')}
	`
			);
		} else {
			throw err;
		}
	}
}

function commandHelp() {
	console.log(
		[
			chalk.underline('Usage'),
			getUsage(),
			chalk.underline('Available tasks'),
			getTasksList(options),
		].join('\n\n')
	);
}

function getUsage() {
	const bin = getBinaryName();
	const commands = EXAMPLES.map(x => x[0] + x[1]);
	const commandsWidth = longest(commands).length;
	return EXAMPLES.map(([command, options, description]) =>
		[
			'   ',
			chalk.bold(bin),
			chalk.cyan(command),
			chalk.yellow(options),
			padEnd('', commandsWidth - (command + options).length),
			description && `# ${description}`,
		].join(' ')
	).join('\n');
}

function getTasksList() {
	const tasks = getAllTasks(directories, options);
	const names = sortBy(Object.keys(tasks));
	const nameColWidth = longest(names).length;

	return names
		.map(name => {
			const description = Array.isArray(tasks[name]) ? `Runs ${listify(tasks[name])}` : tasks[name];
			return '    ' + chalk.cyan(padEnd(name, nameColWidth)) + '  ' + description;
		})
		.join('\n');
}

function printError(message) {
	console.error(chalk.bold.red(message));
	console.log();
}
