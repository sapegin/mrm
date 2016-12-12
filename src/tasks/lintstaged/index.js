'use strict';

const json = require('../../formats/json');
const { install } = require('../../npm');

const packages = [
	'lint-staged',
	'pre-commit',
];

module.exports = function() {
	// .lintstagedrc
	json('.lintstagedrc')
		.set('*.js', ['eslint --fix', 'git add'])
		.save()
	;

	// package.json
	const packageJson = json('package.json')
		.merge({
			scripts: {
				'lint-staged': 'lint-staged',
			},
			'pre-commit': 'lint-staged',
		})
		.save()
	;

	// package.json: dependencies
	if (!packageJson.get('dependencies.eslint-config-tamia')) {
		install(packages);
	}
};
module.exports.description = 'Adds lint-staged';
