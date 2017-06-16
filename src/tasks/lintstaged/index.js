'use strict';

const { json, install } = require('mrm-core');

const packages = ['lint-staged', 'husky'];

module.exports = function() {
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
};
module.exports.description = 'Adds lint-staged';
