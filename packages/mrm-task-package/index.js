// @ts-check
const fs = require('fs');
const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { json } = require('mrm-core');
const rc = require('rc');

const rc = require('rc');

function getConfig() {
	const npm = rc('npm', null, []);
	return {
		version: npm['init-version'],
		license: npm['init-license'],
	};
}

module.exports = function task({
	name,
	url,
	github,
	minNode,
	license,
	version,
	packageManager,
}) {
	const packageName = path.basename(process.cwd());
	const repository = `${github}/${packageName}`;

	// Create package.json
	const pkg = json('package.json', {
		name: packageName,
		version,
		description: '',
		author: {
			name,
			url,
		},
		contributors: [],
		homepage: `https://github.com/${repository}`,
		bugs: `https://github.com/${repository}/issues`,
		repository: `https://github.com/${repository}`,
		license,
		engines: {
			node: `>=${minNode}`,
		},
		main: 'index.js',
		files: ['index.js'],
		scripts: {},
		keywords: [],
		dependencies: {},
		devDependencies: {},
	});

	let lockFileBase;
	switch (packageManager) {
		case 'npm':
			lockFileBase = 'package-lock.json';
			break;
		case 'pnpm':
			lockFileBase = 'pnpm-lock.yaml';
			break;
		case 'Yarn':
			lockFileBase = 'yarn.lock';
			break;
		case 'Yarn Berry':
			lockFileBase = '.yarnrc.yml';
			break;
	}

	const lockFile = path.join(__dirname, lockFileBase);
	if (!fs.existsSync(lockFile)) {
		const npmrc = rc('npm', null, []);
		if (packageManager !== 'npm' || !npmrc || npmrc['package-lock'] !== false) {
			fs.closeSync(fs.openSync(lockFile, 'w'));
		}
	}

	// Update
	if (pkg.exists()) {
		pkg.merge({
			engines: {
				node: `>=${minNode}`,
			},
		});
	}

	pkg.save();
};

module.exports.description = 'Adds package.json';
module.exports.parameters = {
	name: {
		type: 'input',
		message: 'Enter your name',
		default: meta.name,
		validate(value) {
			return value ? true : '`name` option is required';
		},
	},
	url: {
		type: 'input',
		message: 'Enter your site address',
		default: meta.url,
	},
	github: {
		type: 'input',
		message: 'Enter your GitHub usename or organization name',
		default: gitUsername(),
		validate(value) {
			return value ? true : '`github` option is required';
		},
	},
	minNode: {
		type: 'input',
		message: 'Enter minimum supported Node.js version',
		default: 10,
	},
	version: {
		type: 'input',
		message: 'Enter project version',
		default: () => getConfig().version || '1.0.0',
	},
	license: {
		type: 'input',
		message: 'Enter project license',
		default: () => getConfig().license || 'MIT',
	},
	packageManager: {
		type: 'list',
		message: 'Enter the package manager to use',
		choices: ['npm', 'pnpm', 'Yarn', 'Yarn Berry'],
		default: 'npm',
	},
};
