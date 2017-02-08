'use strict';

const { json, lines, install } = require('mrm-core');

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
	if (!eslintrc.get('extends', '').startsWith(preset)) {
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
	const pkg = json('package.json')
		.merge({
			scripts: {
				lint: 'eslint . --fix',
			},
		})
	;

	// package.json: pretest command
	const lintCommand = 'npm run lint';
	const pretest = pkg.get('scripts.pretest');
	if (!pretest) {
		pkg.set('scripts.pretest', lintCommand);
	}
	else if (!pretest.includes(lintCommand)) {
		pkg.set('scripts.pretest', `${lintCommand} && ${pretest}`);
	}

	pkg.save();

	// package.json: dependencies
	install(packages);
};
module.exports.description = 'Adds ESLint';
