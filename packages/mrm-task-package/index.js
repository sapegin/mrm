// @ts-check
const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { json } = require('mrm-core');

const rc = require('rc');

// Until may add to core
function config() {
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
		default: () => config().version || '1.0.0',
	},
	license: {
		type: 'input',
		message: 'Enter project license',
		default: () => config().license || 'MIT',
	},
};
