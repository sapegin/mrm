'use strict';

const minimist = require('minimist');
const { json, packageJson, install, uninstall } = require('mrm-core');

const oldPackages = ['jslint', 'jshint'];

module.exports = function(config) {
	const preset = config('eslintPreset', 'eslint:recommended');
	const packages = config('eslintPeerDependencies', []);
	packages.push('eslint');
	if (preset !== 'eslint:recommended') {
		packages.push(`eslint-config-${preset}`);
	}

	// .eslintrc
	const eslintrc = json('.eslintrc');
	if (!eslintrc.get('extends', '').startsWith(preset)) {
		eslintrc.set('extends', preset).save();
	}

	// package.json
	const pkg = packageJson();

	// Keep custom extensions
	let exts = '';
	const lintScript = pkg.getScript('lint');
	if (lintScript) {
		const args = minimist(lintScript.split(' ').slice(1));
		if (args.ext && args.ext !== 'js') {
			exts = ` --ext ${args.ext}`;
		}
	}

	pkg
		// Remove existing JS linters
		.removeScript(/^(lint:js|eslint|jshint|jslint)$/)
		.removeScript('test', / (lint|lint:js|eslint|jshint|jslint)( |$)/)
		// Add lint script
		.setScript('lint', 'eslint . --cache --fix' + exts)
		// Add pretest script
		.prependScript('pretest', 'npm run lint')
		.save();

	// Dependencies
	uninstall(oldPackages);
	install(packages);
};
module.exports.description = 'Adds ESLint';
