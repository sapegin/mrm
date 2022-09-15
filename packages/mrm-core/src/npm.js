// @ts-check
const fs = require('fs-extra');
const _ = require('lodash');
const semver = require('semver');
const listify = require('listify');
const validateNpmPackageName = require('validate-npm-package-name');
const log = require('./util/log');
const execCommand = require('./util/execCommand');
const json = require('./formats/json');
const packageJson = require('./files/packageJson');
const MrmError = require('./error');

/**
 * @typedef Options
 * @property {boolean} [dev]
 * @property {boolean} [yarn]
 * @property {boolean} [yarnBerry]
 * @property {boolean} [pnpm]
 * @property {Record<string, string>} [versions]
 */

/**
 * @typedef RunOptions
 * @property {boolean} [dev]
 * @property {boolean} [remove]
 * @property {boolean} [stdio]
 * @property {string} [cwd]
 */

/**
 * Install or update given npm packages if needed
 * @param {Record<string, string> | string[] | string} deps
 * @param {Options} [options]
 * @param {Function} exec
 */
function install(deps, options = {}, exec) {
	const dev = options.dev !== false;
	const run = getRunFunction(options);

	// options.versions is a min versions mapping,
	// the list of packages to install will be taken from deps
	let versions = options.versions || {};

	/** @type string[] */
	let dependencies = [];

	if (typeof deps === 'string') {
		dependencies = [deps];
	} else if (Array.isArray(deps)) {
		dependencies = deps;
	} else if (typeof deps === 'object' && deps !== null) {
		// deps is an object with required versions
		// prettier-ignore
		versions = deps;
		dependencies = Object.keys(deps);
	}

	const newDeps = getUnsatisfiedDeps(dependencies, versions, { dev });
	if (newDeps.length === 0) {
		return;
	}

	log.info(`Installing ${listify(newDeps)}...`);
	const versionedDeps = newDeps.map(dep => getVersionedDep(dep, versions));

	// eslint-disable-next-line consistent-return
	return run(versionedDeps, { dev }, exec);
}

/**
 * Uninstall given npm packages
 * @param {string[] | string} deps
 * @param {Options} [options]
 * @param {Function} exec
 */
function uninstall(deps, options = {}, exec) {
	deps = _.castArray(deps);
	const dev = options.dev !== false;
	const run = getRunFunction(options);

	const installed = getOwnDependencies({ dev });

	const newDeps = deps.filter(dep => installed[dep]);

	if (newDeps.length === 0) {
		return;
	}

	log.info(`Uninstalling ${listify(newDeps)}...`);

	// eslint-disable-next-line consistent-return
	return run(newDeps, { remove: true, dev }, exec);
}

/**
 * Return suitable run function
 *
 * @param {Options} [options]
 */
function getRunFunction(options = {}) {
	if (options.yarnBerry || isUsingYarnBerry()) {
		return runYarnBerry;
	} else if (options.yarn || isUsingYarn()) {
		return runYarn;
	} else if (options.pnpm || isUsingPnpm()) {
		return runPnpm;
	} else {
		return runNpm;
	}
}

/**
 * Install or uninstall given npm packages
 *
 * @param {string[]} deps
 * @param {RunOptions} [options]
 * @param {Function} [exec]
 */
function runNpm(deps, options = {}, exec) {
	const args = [
		options.remove ? 'uninstall' : 'install',
		options.dev ? '--save-dev' : '--save',
	].concat(deps);

	return execCommand(exec, 'npm', args, {
		stdio: options.stdio === undefined ? 'inherit' : options.stdio,
		cwd: options.cwd,
	});
}

/**
 * Install or uninstall given Yarn packages
 *
 * This will use yarn's `--ignore-workspace-root-check` to allow additions of packages
 * inside a repository that is using yarn's workspaces feature. If the current
 * repository is _not_ using workspaces, then that flag is simply ignored.
 *
 * @see https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-ignore-workspace-root-check-w
 *
 * @param {string[]} deps
 * @param {RunOptions} [options]
 * @param {Function} [exec]
 */
function runYarn(deps, options = {}, exec) {
	const add = options.dev
		? ['add', '--dev', '--ignore-workspace-root-check']
		: ['add', '--ignore-workspace-root-check'];
	const remove = ['remove'];
	const args = (options.remove ? remove : add).concat(deps);

	return execCommand(exec, 'yarn', args, {
		stdio: options.stdio === undefined ? 'inherit' : options.stdio,
		cwd: options.cwd,
	});
}

/**
 * Install or uninstall given Yarn@berry packages
 *
 * @param {string[]} deps
 * @param {RunOptions} [options]
 * @param {Function} [exec]
 */
function runYarnBerry(deps, options = {}, exec) {
	const add = options.dev ? ['add', '--dev'] : ['add'];

	const remove = ['remove'];
	const args = (options.remove ? remove : add).concat(deps);

	return execCommand(exec, 'yarn', args, {
		stdio: options.stdio === undefined ? 'inherit' : options.stdio,
		cwd: options.cwd,
	});
}

/**
 * Install or uninstall given pnpm packages
 *
 * @param {string[]} deps
 * @param {RunOptions} [options]
 * @param {Function} [exec]
 */
function runPnpm(deps, options = {}, exec) {
	const args = [
		options.remove ? 'remove' : 'add',
		options.dev ? '--save-dev' : '--save-prod',
	].concat(deps);

	return execCommand(exec, 'pnpm', args, {
		stdio: options.stdio === undefined ? 'inherit' : options.stdio,
		cwd: options.cwd,
	});
}

/**
 * Add version or latest to package name
 * @param {string} dep
 * @param {Record<string, string>} versions
 */
function getVersionedDep(dep, versions) {
	// Handle non-registry packages (Github, bitbucket, etc.)
	if (!validateNpmPackageName(dep).validForNewPackages) {
		// If we were explicitly passed a version, attempt to
		// load it via the `#semver:<semver>` syntax.
		if (versions[dep]) {
			return `${dep}#semver:${versions[dep]}`;
		} else {
			return dep;
		}
	}
	const version = versions[dep] || 'latest';
	return `${dep}@${version}`;
}

/**
 *
 * @param {Options} options
 * @return {Record<string, string>}
 */
function getOwnDependencies(options) {
	const pkg = packageJson({
		dependencies: {},
		devDependencies: {},
	});

	return pkg.get(options.dev ? 'devDependencies' : 'dependencies') || {};
}

/**
 * Return version of installed npm package
 *
 * @param {string} name
 * @return {string}
 */
function getInstalledVersion(name) {
	return json(`./node_modules/${name}/package.json`).get('version');
}

/**
 * Return only not installed dependencies, or dependencies which installed
 * version doesn't satisfy range.
 *
 * @param {string[]} deps
 * @param {Record<string, string>} versions
 * @param {Options} options
 * @return {string[]}
 */
function getUnsatisfiedDeps(deps, versions, options) {
	const ownDependencies = getOwnDependencies(options);

	return deps.filter(dep => {
		const required = versions[dep];

		// Handle non-registry packages (github, bitbucket, etc.)
		// Because these packages can shift contents without updating version
		// numbers, always attempt an install
		if (!validateNpmPackageName(dep).validForNewPackages) {
			return true;
		}

		if (required && !semver.validRange(required)) {
			throw new MrmError(
				`Invalid npm version: ${required}. Use proper semver range syntax.`
			);
		}

		const installed = getInstalledVersion(dep);

		// Package isn’t installed yet
		if (!installed) {
			return true;
		}

		// Module is installed but not in package.json dependencies
		if (!ownDependencies[dep]) {
			return true;
		}

		// No required version specified
		if (!required) {
			// Install if the pacakge isn’t installed
			return !installed;
		}

		// Install if installed version doesn't satisfy range
		return !semver.satisfies(installed, required);
	});
}

/*
 * Is project using Yarn?
 */
function isUsingYarn() {
	return fs.existsSync('yarn.lock');
}

/*
 * Is project using Yarn@berry?
 */
function isUsingYarnBerry() {
	return isUsingYarn() && fs.existsSync('.yarnrc.yml');
}

/*
 * Is project using pnpm?
 */
function isUsingPnpm() {
	return fs.existsSync('pnpm-lock.yaml');
}

module.exports = {
	install,
	uninstall,
	isUsingYarnBerry,
};
