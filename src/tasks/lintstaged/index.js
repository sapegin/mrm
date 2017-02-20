'use strict';

const { json, install } = require('mrm-core');

const packages = [
	'lint-staged',
	'pre-commit',
];

module.exports = function() {
	// .lintstagedrc
	json('.lintstagedrc')
		.merge({
			'*.js': ['eslint --fix', 'git add'],
		})
		.save()
	;

	// package.json
	json('package.json')
		.merge({
			scripts: {
				'lint-staged': 'lint-staged',
			},
			'pre-commit': 'lint-staged',
		})
		.save()
	;

	// package.json: dependencies
	install(packages);
};
module.exports.description = 'Adds lint-staged';
