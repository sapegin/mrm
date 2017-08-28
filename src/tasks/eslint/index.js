'use strict';

const minimist = require('minimist');
const { json, packageJson, lines, install, uninstall } = require('mrm-core');

const ignores = ['node_modules/'];
const oldPackages = ['jslint', 'jshint'];

module.exports = function(config) {
	let exts = '';
	const preset = config('eslintPreset', 'eslint:recommended');
	const packages = config('eslintPeerDependencies', []);
	const rules = config('eslintRules');
	packages.push('eslint');
	if (preset !== 'eslint:recommended') {
		packages.push(`eslint-config-${preset}`);
	}

	const pkg = packageJson();

	// .eslintrc
	const eslintrc = json('.eslintrc');
	if (rules) {
		eslintrc.merge({ rules });
	}
	if (!eslintrc.get('extends', '').startsWith(preset)) {
		eslintrc.set('extends', preset);
	}

	// TypeScript
	if (pkg.get('devDependencies.typescript')) {
		const parser = 'typescript-eslint-parser';
		packages.push(parser);
		eslintrc.merge({
			parser,
			rules: rules || {
				// Disable rules not supported by TypeScript parser
				// https://github.com/eslint/typescript-eslint-parser#known-issues
				'no-undef': 0,
				'no-unused-vars': 0,
				'no-useless-constructor': 0,
			},
		});
		exts = ' --ext .{ts,tsx}';
	}

	eslintrc.save();

	// .eslintignore
	lines('.eslintignore').add(ignores).save();

	// Keep custom extensions
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
