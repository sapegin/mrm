// @ts-check
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const kleur = require('kleur');
const { get, forEach, partition } = require('lodash');
const inquirer = require('inquirer');
const {
	MrmUnknownTask,
	MrmInvalidTask,
	MrmUnknownAlias,
	MrmUndefinedOption,
} = require('./errors');
const npx = require('libnpx');

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
 * Runs an array of promises in series
 *
 * @method promiseSeries
 *
 * @param  {Array} items
 * @param  {Function} iterator
 * @return {Promise}
 */
function promiseSeries(items, iterator) {
	return items.reduce((iterable, name) => {
		return iterable.then(() => iterator(name));
	}, Promise.resolve());
}

/**
 *
 * @param {string|string[]} name
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} argv
 * @returns {Promise}
 */
function run(name, directories, options, argv) {
	if (Array.isArray(name)) {
		return new Promise((resolve, reject) => {
			promiseSeries(name, n => {
				return run(n, directories, options, argv);
			})
				.then(() => resolve())
				.catch(reject);
		});
	}

	if (getAllAliases(options)[name]) {
		return runAlias(name, directories, options, argv);
	}
	return runTask(name, directories, options, argv);
}

/**
 * Run an alias.
 *
 * @param {string} aliasName
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} [argv]
 * @returns {Promise}
 */
function runAlias(aliasName, directories, options, argv) {
	return new Promise((resolve, reject) => {
		const tasks = getAllAliases(options)[aliasName];
		if (!tasks) {
			reject(new MrmUnknownAlias(`Alias “${aliasName}” not found.`));
			return;
		}

		console.log(kleur.yellow(`Running alias ${aliasName}...`));

		promiseSeries(tasks, name => {
			return runTask(name, directories, options, argv);
		})
			.then(() => resolve())
			.catch(reject);
	});
}

/**
 * Returns the correct `mrm-` prefixed package name
 *
 * @param {"task" | "preset"} type
 * @param {string} packageName
 * @returns {string}
 */
function getPackageName(type, packageName) {
	const [scopeOrTask, scopedTaskName] = packageName.split('/');
	return scopedTaskName
		? `${scopeOrTask}/mrm-${type}-${scopedTaskName}`
		: `mrm-${type}-${scopeOrTask}`;
}

/**
 * Run a task.
 *
 * @param {string} taskName
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} [argv]
 * @returns {Promise}
 */
async function runTask(taskName, directories, options, argv) {
	const taskPackageName = getPackageName('task', taskName);
	let modulePath;
	try {
		modulePath = await promiseFirst([
			() => tryFile(directories, `${taskName}/index.js`),
			() => resolveUsingNpx(taskPackageName),
			() => resolveUsingNpx(taskName),
		]);
	} catch {
		modulePath = null;
	}
	return new Promise((resolve, reject) => {
		if (!modulePath) {
			reject(
				new MrmUnknownTask(`Task “${taskName}” not found.`, {
					taskName,
				})
			);
			return;
		}

		const module = require(modulePath);
		if (typeof module !== 'function') {
			reject(
				new MrmInvalidTask(`Cannot call task “${taskName}”.`, { taskName })
			);
			return;
		}

		console.log(kleur.cyan(`Running ${taskName}...`));

		Promise.resolve(getTaskOptions(module, argv.interactive, options))
			.then(getConfigGetter)
			.then(config => module(config, argv))
			.then(resolve)
			.catch(reject);
	});
}

/**
 * Get task specific options, either by running Inquirer.js in interactive mode,
 * or using defaults.
 *
 * @param {Function} task
 * @param {boolean} interactive? Whether or not interactive mode is enabled.
 * @param {Record<string, any>} options? Default available options passed into the task.
 */
async function getTaskOptions(task, interactive = false, options = {}) {
	// If no parameters set, resolve to default options (from config file or command line).
	if (!task.parameters) {
		return options;
	}

	const parameters = Object.entries(task.parameters);

	const allOptions = await Promise.all(
		parameters.map(async ([name, param]) => ({
			...param,
			name,
			default:
				// Merge available default options with parameter initial values
				typeof options[name] !== 'undefined'
					? options[name]
					: typeof param.default === 'function'
					? await param.default(options)
					: param.default,
		}))
	);

	// Split interactive and static options
	const [prompts, statics] = partition(
		allOptions,
		option => interactive && option.type !== 'config'
	);

	// Validate static options
	const invalid = statics.filter(param =>
		param.validate ? param.validate(param.default) !== true : false
	);
	if (invalid.length > 0) {
		const names = invalid.map(({ name }) => name);
		throw new MrmUndefinedOption(
			`Missing required config options: ${names.join(', ')}.`,
			{
				unknown: names,
			}
		);
	}

	// Run Inquirer.js with interactive options
	const answers = prompts.length > 0 ? await inquirer.prompt(prompts) : {};

	// Merge answers with static defaults
	const values = { ...answers };
	for (const param of statics) {
		values[param.name] = param.default;
	}

	return values;
}

/**
 * Return a config getter.
 *
 * @param {Object} options
 * @return {any}
 */
function getConfigGetter(options) {
	const config = { ...options };

	/**
	 * Return an object with all config values.
	 *
	 * @return {Object}
	 */
	function values() {
		console.warn(
			'Warning: calling config.values() is deprecated. Access values directly instead'
		);
		return options;
	}

	/**
	 * Mark config options as required.
	 *
	 * @param {...string} names
	 * @return {Object} this
	 */
	function require(...names) {
		console.warn(
			'Warning: calling config.require() is deprecated. Use the validate() method instead'
		);
		const unknown = names.filter(name => !options[name]);
		if (unknown.length > 0) {
			throw new MrmUndefinedOption(
				`Required config options are missed: ${unknown.join(', ')}.`,
				{
					unknown,
				}
			);
		}
		return config;
	}

	/**
	 * Set default values.
	 *
	 * @param {Object} defaultOptions
	 * @return {any}
	 */
	function defaults(defaultOptions) {
		console.warn(
			'Warning: calling config.defaults() is deprecated. Use the default property instead'
		);
		options = Object.assign({}, defaultOptions, options);
		return config;
	}

	config.require = require;
	config.defaults = defaults;
	config.values = values;
	return config;
}

/**
 *
 * @param {string[]} directories
 * @param {string} filename
 * @param {Object} argv
 * @return {Object}
 */
async function getConfig(directories, filename, argv) {
	const configFromFile = await getConfigFromFile(directories, filename);
	return Object.assign({}, configFromFile, getConfigFromCommandLine(argv));
}

/**
 * Find and load config file.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {Object}
 */
async function getConfigFromFile(directories, filename) {
	try {
		const filepath = await tryFile(directories, filename);
		return require(filepath);
	} catch {
		return {};
	}
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
	return promiseFirst(
		directories.map(dir => {
			const filepath = path.resolve(dir, filename);
			return () => fs.promises.access(filepath).then(() => filepath);
		})
	).catch(() => {
		throw new Error(`File “${filename}” not found.`);
	});
}

/**
 * Executes promise-returning thunks in series until one is resolved
 *
 * @method promiseFirst
 *
 * @param  {Array} thunks
 * @return {Promise}
 */
async function promiseFirst(thunks, errors = []) {
	if (thunks.length === 0) {
		throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join('\n')}`);
	} else {
		const [thunk, ...rest] = thunks;
		try {
			return await thunk();
		} catch (error) {
			return promiseFirst(rest, [...errors, error]);
		}
	}
}

/**
 * Resolve a module on-the-fly using npx under the hood
 *
 * @method resolveUsingNpx
 *
 * @param  {String} packageName
 * @return {Promise}
 */
async function resolveUsingNpx(packageName) {
	const npm = path.join(path.dirname(process.execPath), 'npm');
	const { prefix } = await npx._ensurePackages(packageName, { npm, q: true });
	const packagePath = path.join(prefix, 'lib', 'node_modules', packageName);
	return packagePath;
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
	getTaskOptions,
	tryFile,
	getPackageName,
	promiseFirst,
	resolveUsingNpx,
};
