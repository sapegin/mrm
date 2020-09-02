// @ts-check
const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { json } = require('mrm-core');

module.exports = function task({ name, url, github, minNode, license }) {
	const packageName = path.basename(process.cwd());
	const repository = `${github}/${packageName}`;

	// Create package.json
	const pkg = json('package.json', {
		name: packageName,
		version: '1.0.0',
		description: '',
		author: {
			name,
			url,
		},
		homepage: `https://github.com/${repository}`,
		repository,
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
	license: {
		type: 'input',
		message: 'Enter project license',
		default: 'MIT',
	},
};
