// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const get = require('lodash/get');
const forEach = require('lodash/forEach');
const { MrmError } = require('mrm-core');

/* eslint-disable no-console */

/**
 * Return all task and alias names and descriptions from all search directories.
 *
 * @param {string[]} directories
 * @param {Object} options
 * @return {Object}
 */
function getAllTasks(directories, options) {
	const allTasks = getAllAliases(options);
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
 *
 * @param {Object} options
 * @return {Object}
 */
function getAllAliases(options) {
	return get(options, 'aliases', {});
}

/**
 *
 * @param {string} name
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} argv
 */
function run(name, directories, options, argv) {
	if (getAllAliases(options)[name]) {
		runAlias(name, directories, options, argv);
	} else {
		runTask(name, directories, options, argv);
	}
}

/**
 * Run an alias.
 *
 * @param {string} aliasName
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} [argv]
 */
function runAlias(aliasName, directories, options, argv) {
	const tasks = getAllAliases(options)[aliasName];
	if (!tasks) {
		throw new MrmError(`Alias "${aliasName}" not found.`);
	}

	console.log(chalk.yellow(`Running alias ${aliasName}...`));

	tasks.forEach(name => runTask(name, directories, options, argv));
}

/**
 * Run a task.
 *
 * @param {string} taskName
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} [argv]
 */
function runTask(taskName, directories, options, argv) {
	const filename = tryFile(directories, `${taskName}/index.js`);
	if (!filename) {
		throw new MrmError(`Task "${taskName}" not found.`);
	}

	console.log(chalk.cyan(`Running ${taskName}...`));

	const module = require(filename);
	module(getConfigGetter(options, taskName, directories), argv);
}

/**
 * Return a config getter.
 *
 * @param {Object} options
 * @param {string} taskName
 * @param {string[]} directories
 * @return {Function}
 */
function getConfigGetter(options, taskName, directories) {
	/**
	 * Return a config value.
	 *
	 * @param {string} [prop]
	 * @param {any} [defaultValue]
	 * @return {any}
	 */
	return (prop, defaultValue) => {
		if (!prop) {
			return options;
		}

		const value = get(options, prop, defaultValue);
		if (value === undefined && defaultValue === undefined) {
			throw new MrmError(
				`Config option "${prop}" is not defined.

1. Create "config.json" file:

  {
    "${prop}": "Gandalf the Grey"
  }

In one of these folders:

- ${directories.slice(0, -1).join('\n- ')}

2. Or pass the option via command line:

  mrm ${taskName} --config:${prop} "Gandalf the Grey"
`
			);
		}

		return value;
	};
}

/**
 *
 * @param {string[]} directories
 * @param {string} filename
 * @param {Object} argv
 * @return {Object}
 */
function getConfig(directories, filename, argv) {
	return Object.assign(
		{},
		getConfigFromFile(directories, filename),
		getConfigFromCommandLine(argv)
	);
}

/**
 * Find and load config file.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {Object}
 */
function getConfigFromFile(directories, filename) {
	const filepath = tryFile(directories, filename);
	if (!filepath) {
		return {};
	}

	return require(filepath);
}

/**
 * Get config options from command line, passed as --config:foo bar.
 *
 * @param {Object} argv
 * @return {Object}
 */
function getConfigFromCommandLine(argv) {
	const options = {};
	forEach(argv, (value, key) => {
		if (key.startsWith('config:')) {
			options[key.replace(/^config:/, '')] = value;
		}
	});
	return options;
}

/**
 * Try to load a file from a list of folders.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {string|undefined} Absolute path or undefined
 */
function tryFile(directories, filename) {
	for (const dir of directories) {
		const filepath = path.resolve(dir, filename);
		if (fs.existsSync(filepath)) {
			return filepath;
		}
	}
	return undefined;
}

module.exports = {
	getAllAliases,
	getAllTasks,
	run,
	runTask,
	runAlias,
	getConfigGetter,
	getConfig,
	getConfigFromFile,
	getConfigFromCommandLine,
	tryFile,
};
