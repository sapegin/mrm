// @ts-check
'use strict';

const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { json } = require('mrm-core');

function task(config) {
	const { name, url, github } = config
		.defaults({ github: gitUsername(), readmeFile: 'Readme.md' })
		.defaults(meta)
		.require('name', 'url', 'github')
		.values();

	const packageName = path.basename(process.cwd());
	const repository = `${github}/${name}`;

	// Create package.json (no update)
	json('package.json', {
		name: packageName,
		version: '1.0.0',
		description: '',
		author: {
			name,
			url,
		},
		homepage: `https://github.com/${repository}`,
		repository,
		license: 'MIT',
		engines: {
			node: '>=4',
		},
		main: 'index.js',
		files: ['index.js'],
		scripts: {},
		keywords: [],
	}).save();
}

task.description = 'Adds package.json';
module.exports = task;
