// @ts-check
'use strict';

const { json, install } = require('mrm-core');

const packages = ['lint-staged', 'husky'];

function task() {
	// package.json
	json('package.json')
		.merge({
			scripts: {
				precommit: 'lint-staged',
			},
			'lint-staged': {
				'*.js': ['eslint --fix', 'git add'],
			},
		})
		.save();

	// package.json: dependencies
	install(packages);
}

task.description = 'Adds lint-staged';
module.exports = task;
