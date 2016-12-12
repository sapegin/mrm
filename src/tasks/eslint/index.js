'use strict';

const json = require('../../formats/json');
const lines = require('../../formats/lines');
const { install } = require('../../npm');

const defaultTest = 'echo "Error: no test specified" && exit 1';
const packages = [
	'eslint',
	'eslint-config-tamia',
];

module.exports = function() {
	// .eslintrc
	const eslintrc = json('.eslintrc');
	if (!eslintrc.get('extends').startsWith('tamia')) {
		eslintrc
			.set('extends', 'tamia')
			.save()
		;
	}

	// .eslintignore
	const eslintignore = lines('.eslintignore');
	eslintignore
		.append('node_modules')
		.save()
	;

	// package.json
	const packageJson = json('package.json')
		.merge({
			scripts: {
				lint: 'eslint . --ext .js --fix',
			},
		})
	;

	// package.json: test command
	const test = packageJson.get('scripts.test');
	if (!test || test === defaultTest) {
		packageJson.set('scripts.test', 'npm run lint');
	}
	else if (!test.includes('lint')) {
		packageJson.set('scripts.test', `npm run lint && ${test}`);
	}

	packageJson.save();

	// package.json: dependencies
	if (!packageJson.get('dependencies.eslint-config-tamia')) {
		install(packages);
	}
};
module.exports.description = 'Adds ESLint with a custom preset';
