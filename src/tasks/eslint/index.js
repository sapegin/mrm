'use strict';

const { json, lines, install } = require('mrm-core');

const defaultTest = 'echo "Error: no test specified" && exit 1';

module.exports = function(config) {
	const preset = config('eslintPreset', 'eslint:recommended');
	const presetPkg = preset !== 'eslint:recommended' ? `eslint-config-${preset}` : null;
	const packages = [
		'eslint',
	];
	if (presetPkg) {
		packages.push(presetPkg);
	}

	// .eslintrc
	const eslintrc = json('.eslintrc');
	if (!eslintrc.get('extends').startsWith(preset)) {
		eslintrc
			.set('extends', preset)
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
	if (!packageJson.get(`devDependencies.${packages[0]}`)) {
		install(packages);
	}
};
module.exports.description = 'Adds ESLint';
