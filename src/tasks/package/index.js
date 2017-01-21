'use strict';

const path = require('path');
const { json, markdown } = require('mrm-core');

module.exports = function(config) {
	const name = path.basename(process.cwd());
	const github = `https://github.com/${config('github')}`;

	// Create package.json (no update)
	json('package.json', {
		name,
		version: '1.0.0',
		description: '',
		author: {
			name: config('name'),
			url: config('url'),
		},
		homepage: `${github}/${name}`,
		repository: `${config('github')}/${name}`,
		license: 'MIT',
		engines: {
			node: '>=4',
		},
		main: 'index.js',
		files: [
			'index.js',
		],
		scripts: {},
		keywords: [],
	})
		.save()
	;

	// Add npm package badge to Readme
	markdown(config('readme', 'Readme.md'))
		.addBadge(
			`https://img.shields.io/npm/v/${name}.svg`,
			`https://www.npmjs.com/package/${name}`,
			'npm'
		)
		.save()
	;
};
module.exports.description = 'Adds package.json';
