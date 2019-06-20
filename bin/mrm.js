#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path');
const minimist = require('minimist');
const kleur = require('kleur');
const longest = require('longest');
const isDirectory = require('is-directory');
const userHome = require('user-home');
const listify = require('listify');
const updateNotifier = require('update-notifier');
const { padEnd, sortBy, map } = require('lodash');
const { random } = require('middleearth-names');
const { run, getConfig, getAllTasks, tryResolve, getAllPersets } = require('../src/index');
const { MrmUnknownTask, MrmUnknownAlias, MrmUndefinedOption } = require('../src/errors');
const prompts = require('prompts');

let directories = [path.resolve(userHome, 'dotfiles/mrm'), path.resolve(userHome, '.mrm')];
let options;
let preset;

const EXAMPLES = [
	['', '', 'List of available tasks'],
	['<task>', '', 'Run a task or an alias'],
	['<task>', '--dir ~/unicorn', 'Custom config and tasks folder'],
	['<task>', '--preset unicorn', 'Load config and tasks from a preset'],
	['<task>', '--config:foo coffee --config:bar pizza', 'Override config options'],
	['      ', '--prompt', 'Prompt mode'],
];

// Update notifier
const pkg = require('../package.json');
updateNotifier({ pkg }).notify();

process.on('unhandledRejection', err => {
	if (err.constructor.name === 'MrmError') {
		printError(err.message);
		process.exit(1);
	} else {
		throw err;
	}
});

const argv = minimist(process.argv.slice(2));

const binaryPath = process.env._;
const binaryName = binaryPath && binaryPath.endsWith('/npx') ? 'npx mrm' : 'mrm';


if (argv.prompt) {
	prompts([
		{
			type: 'select',
			name: 'preset',
			message: 'Select preset',
			choices: [],
			load: (answer, answers, question) => {
				question.choices = getAllPersets()
			},
		},
		{
			type: 'multiselect',
			name: 'tasks',
			message: 'Select tasks or alias',
			choices: [{title:'1', value:'1'}],
			min: 1,
			load (answer, answers, question) {
				preset = checkPreset(answers.preset)
				options = getConfig(directories, 'config.json', argv);

				const tasks = getAllTasks(directories, options);
				const names = sortBy(Object.keys(tasks));
				const nameColWidth = longest(names).length;

				question.choices = map(names, name => ({
					title: formatDescriptionForName(name, tasks, nameColWidth),
					value: name
				}))
				question.initial = 0
			}
		},
	]).then(response => {
		if (response.tasks) {
			runTasks(response.tasks, directories, options, argv, preset)
		}
	})
	return
}

// Custom config / tasks directory
if (argv.dir) {
	const dir = path.resolve(argv.dir);
	if (!isDirectory.sync(dir)) {
		printError(`Directory “${dir}” not found.`);
		process.exit(1);
	}

	directories.unshift(dir);
}

// Preset
preset = checkPreset(argv.preset)

// runTasks
options = getConfig(directories, 'config.json', argv);
runTasks(argv._	, directories, options, argv, preset)


function checkDefaultPreseet (preset) {
	return preset === 'default';
}

function checkPreset (preset) {
	preset = preset || 'default';
	const isDefaultPreset = checkDefaultPreseet(preset)
	if (isDefaultPreset) {
		directories.push(path.dirname(require.resolve('mrm-preset-default')));
	} else {
		const presetPath = tryResolve(`mrm-preset-${preset}`, preset);
		if (!presetPath) {
			printError(`Preset “${preset}” not found.

	We’ve tried to load “mrm-preset-${preset}” and “${preset}” globally installed npm packages.`);
			process.exit(1);
		}
		directories = [path.dirname(presetPath)];
	}

	return preset
}

function runTasks (tasks, directories, options, argv, preset) {
	if (tasks.length === 0 || tasks[0] === 'help') {
		commandHelp(options);
		return
	}
	const isDefaultPreset = checkDefaultPreseet(preset)
	run(tasks, directories, options, argv).catch(err => {
		if (err.constructor === MrmUnknownAlias) {
			printError(err.message);
		} else if (err.constructor === MrmUnknownTask) {
			const { taskName } = err.extra;
			if (isDefaultPreset) {
				const modules = directories
					.slice(0, -1)
					.map(d => `${d}/${taskName}/index.js`)
					.concat([
						`“${taskName}” in the default mrm tasks`,
						`npm install -g mrm-task-${taskName}`,
						`npm install -g ${taskName}`,
					]);
				printError(
					`${err.message}

We’ve tried these locations:

- ${modules.join('\n- ')}`
				);
			} else {
				printError(`Task “${taskName}” not found in the “${preset}” preset.

Note that when a preset is specified no default search locations are used.`);
			}
		} else if (err.constructor === MrmUndefinedOption) {
			const { unknown } = err.extra;
			const values = unknown.map(name => [name, random()]);
			const heading = `Required config options are missed: ${listify(unknown)}.`;
			const cliHelp = `  ${binaryName} ${tasks.join(' ')} ${values
				.map(([n, v]) => `--config:${n} "${v}"`)
				.join(' ')}`;
			if (isDefaultPreset) {
				const userDirectories = directories.slice(0, -1);
				printError(
					`${heading}

1. Create a “config.json” file:

{
${values.map(([n, v]) => `  "${n}": "${v}"`).join(',\n')}
}

In one of these folders:

- ${userDirectories.join('\n- ')}

2. Or pass options via command line:

${cliHelp}
	`
				);
			} else {
				printError(
					`${heading}

You can pass the option via command line:

${cliHelp}

Note that when a preset is specified no default search locations are used.`
				);
			}
		} else {
			throw err;
		}
	});
}

function commandHelp(options) {
	console.log(
		[
			kleur.underline('Usage'),
			getUsage(),
			kleur.underline('Available tasks'),
			getTasksList(options),
		].join('\n\n')
	);
}

function getUsage() {
	const commands = EXAMPLES.map(x => x[0] + x[1]);
	const commandsWidth = longest(commands).length;
	return EXAMPLES.map(([command, options, description]) =>
		[
			'   ',
			kleur.bold(binaryName),
			kleur.cyan(command),
			kleur.yellow(options),
			padEnd('', commandsWidth - (command + options).length),
			description && `# ${description}`,
		].join(' ')
	).join('\n');
}

function getTasksList(options) {
	const tasks = getAllTasks(directories, options);
	const names = sortBy(Object.keys(tasks));
	const nameColWidth = longest(names).length;

	return names
		.map(name => formatDescriptionForName(name, tasks, nameColWidth))
		.join('\n');
}

function formatDescriptionForName (name, tasks, nameColWidth) {
	const description = Array.isArray(tasks[name]) ? `Runs ${listify(tasks[name])}` : tasks[name];
	return '    ' + kleur.cyan(padEnd(name, nameColWidth)) + '  ' + description;
}

function printError(message) {
	console.log();
	console.error(kleur.bold.red(message));
	console.log();
}
