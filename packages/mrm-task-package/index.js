const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { json } = require('mrm-core');

function task(config) {
	const { name, url, github, minNode, license } = config
		.defaults({ github: gitUsername(), minNode: 6.9, license: 'MIT' })
		.defaults(meta)
		.require('name', 'url', 'github')
		.values();

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
}

task.description = 'Adds package.json';
module.exports = task;
