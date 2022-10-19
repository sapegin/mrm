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
const { padEnd, sortBy } = require('lodash');
const { random } = require('middleearth-names');
const {
	run,
	getConfig,
	getAllTasks,
	resolveUsingNpx,
	getPackageName,
	promiseFirst,
} = require('../src/index');
const {
	MrmUnknownTask,
	MrmInvalidTask,
	MrmUnknownAlias,
	MrmUndefinedOption,
} = require('../src/errors');

const defaultDirectories = [
	path.resolve(userHome, 'dotfiles/mrm'),
	path.resolve(userHome, '.mrm'),
];

const EXAMPLES = [
	['', '', 'List of available tasks'],
	['<task>', '', 'Run a task or an alias'],
	['<task>', '--dir ~/unicorn', 'Custom config and tasks folder'],
	['<task>', '--preset unicorn', 'Load config and tasks from a preset'],
	[
		'<task>',
		'--config:foo coffee --config:bar pizza',
		'Override config options',
	],
];

// Update notifier
const pkg = require('../package.json');
updateNotifier({ pkg }).notify();

process.on('unhandledRejection', (err) => {
	if (err.constructor.name === 'MrmError') {
		printError(err.message);
		process.exit(1);
	} else {
		throw err;
	}
});

async function main() {
	const argv = minimist(process.argv.slice(2), { alias: { i: 'interactive' } });
	const tasks = argv._;

	const binaryPath = process.env._;
	const binaryName =
		binaryPath && binaryPath.endsWith('/npx') ? 'npx mrm' : 'mrm';

	// Preset
	const preset = argv.preset || 'default';
	const isDefaultPreset = preset === 'default';
	const directories = await resolveDirectories(defaultDirectories);
	const options = await getConfig(directories, 'config.json', argv);
	if (tasks.length === 0 || tasks[0] === 'help') {
		commandHelp();
	} else {
		run(tasks, directories, options, argv).catch((err) => {
			if (err.constructor === MrmUnknownAlias) {
				printError(err.message);
			} else if (err.constructor === MrmUnknownTask) {
				const { taskName } = err.extra;
				if (isDefaultPreset) {
					const modules = directories
						.slice(0, -1)
						.map((d) => `${d}/${taskName}/index.js`)
						.concat([
							`“${taskName}” in the default mrm tasks`,
							`mrm-task-${taskName} package in local node_modules`,
							`${taskName} package in local node_modules`,
							`mrm-task-${taskName} package on the npm registry`,
							`${taskName} package on the npm registry`,
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
			} else if (err.constructor === MrmInvalidTask) {
				printError(`${err.message}

Make sure your task module exports a function.`);
			} else if (err.constructor === MrmUndefinedOption) {
				const { unknown } = err.extra;
				const values = unknown.map((name) => [name, random()]);
				const heading = `Required config options are missed: ${listify(
					unknown
				)}.`;
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

	async function resolveDirectories(paths) {
		// Custom config / tasks directory
		if (argv.dir) {
			const dir = path.resolve(argv.dir);
			if (!isDirectory.sync(dir)) {
				printError(`Directory “${dir}” not found.`);
				process.exit(1);
			}

			paths.unshift(dir);
		}

		const presetPackageName = getPackageName('preset', preset);
		try {
			const presetPath = await promiseFirst([
				() => require.resolve(presetPackageName),
				() => require.resolve(preset),
				() => resolveUsingNpx(presetPackageName),
				() => resolveUsingNpx(preset),
			]);
			return [...paths, path.dirname(presetPath)];
		} catch {
			printError(`Preset “${preset}” not found.

We’ve tried to load “${presetPackageName}” and “${preset}” npm packages.`);
			return process.exit(1);
		}
	}

	function commandHelp() {
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
		const commands = EXAMPLES.map((x) => x[0] + x[1]);
		const commandsWidth = longest(commands).length;
		return EXAMPLES.map(([command, opts, description]) =>
			[
				'   ',
				kleur.bold(binaryName),
				kleur.cyan(command),
				kleur.yellow(opts),
				padEnd('', commandsWidth - (command + opts).length),
				description && `# ${description}`,
			].join(' ')
		).join('\n');
	}

	function getTasksList() {
		const allTasks = getAllTasks(directories, options);
		const names = sortBy(Object.keys(allTasks));
		const nameColWidth = names.length > 0 ? longest(names).length : 0;

		return names
			.map((name) => {
				const description = Array.isArray(allTasks[name])
					? `Runs ${listify(allTasks[name])}`
					: allTasks[name];
				return (
					'    ' + kleur.cyan(padEnd(name, nameColWidth)) + '  ' + description
				);
			})
			.join('\n');
	}
}

function printError(message) {
	console.log();
	console.error(kleur.bold().red(message));
	console.log();
}

main();
