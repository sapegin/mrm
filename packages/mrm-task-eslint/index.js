const _ = require('lodash');
const {
	json,
	packageJson,
	lines,
	install,
	uninstall,
	getExtsFromCommand,
} = require('mrm-core');

module.exports = function task({
	eslintPreset,
	eslintPeerDependencies,
	eslintObsoleteDependencies,
	eslintRules,
}) {
	let exts = '';
	const legacyConfigFile = '.eslintrc';
	const configFile = '.eslintrc.json';
	const ignores = ['node_modules/'];
	const ignoresToRemove = ['node_modules'];
	const gitIgnores = ['.eslintcache'];
	const packages = ['eslint'];
	const packagesToRemove = ['jslint', 'jshint'];

	// Preset
	if (eslintPreset !== 'eslint:recommended') {
		packages.push(`eslint-config-${eslintPreset}`);
	}

	// Peer dependencies
	packages.push(...eslintPeerDependencies);

	// Migrate legacy config
	const legacyEslintrc = json(legacyConfigFile);
	const legacyConfig = legacyEslintrc.get();
	legacyEslintrc.delete();

	// .eslintrc.json
	const eslintrc = json(configFile, legacyConfig);
	const hasCustomPreset = _.castArray(eslintrc.get('extends', [])).find(x =>
		x.startsWith(eslintPreset)
	);
	if (!hasCustomPreset) {
		const presets = eslintrc.get('extends');
		if (!presets) {
			eslintrc.set('extends', eslintPreset);
		} else {
			eslintrc.set('extends', [eslintPreset, ..._.castArray(presets)]);
		}
	}
	if (eslintRules) {
		eslintrc.merge({
			rules: eslintRules,
		});
	}

	const pkg = packageJson();

	// TODO: Babel
	// Not sure how to detect that we need it, checking for babel-core is not enough because
	// babel-eslint is only needed for experimental features and Flow (this one is easy to test)
	// Flow also needs this: https://github.com/gajus/eslint-plugin-flowtype
	// if (pkg.get('devDependencies.babel-core')) {
	// 	packages.push('babel-eslint');
	// 	eslintrc.set('parser', 'babel-eslint');
	// }

	// TypeScript
	if (pkg.get('devDependencies.typescript')) {
		const parser = '@typescript-eslint/parser';
		const plugin = '@typescript-eslint/eslint-plugin';
		packages.push(parser, plugin);
		eslintrc.merge({
			parser,
			plugins: [plugin],
			parserOptions: {
				// If using React, turn on JSX support in the TypeScript parser.
				...(pkg.get('dependencies.react') && {
					ecmaFeatures: {
						jsx: true,
					},
				}),
				project: './tsconfig.json',
			},
			rules: eslintRules || {},
		});
		exts = ' --ext .ts,.tsx';

		if (pkg.get('devDependencies.prettier')) {
			packages.push('eslint-config-prettier');
			const extensions = eslintrc.get('extends', []);
			eslintrc.merge({
				extends: [
					...(Array.isArray(extensions) ? extensions : [extensions]),
					'prettier',
					'prettier/@typescript-eslint',
				],
			});
		}
	}

	eslintrc.save();

	// .eslintignore
	lines('.eslintignore')
		.remove(ignoresToRemove)
		.add(ignores)
		.save();

	// .gitignore
	lines('.gitignore')
		.add(gitIgnores)
		.save();

	// Keep custom extensions
	const lintScript =
		pkg.getScript('lint', 'eslint') || pkg.getScript('test', 'eslint');
	if (lintScript) {
		const lintExts = getExtsFromCommand(lintScript, 'ext');
		if (lintExts && lintExts.toString() !== 'js') {
			const extsPattern = lintExts.map(x => `.${x}`).join(',');
			exts = ` --ext ${extsPattern}`;
		}
	}

	pkg
		// Remove existing JS linters
		.removeScript(/^(lint:js|eslint|jshint|jslint)$/)
		.removeScript('test', / (lint|lint:js|eslint|jshint|jslint)( |$)/) // npm run jest && npm run lint
		.removeScript('test', /\beslint|jshint|jslint\b/) // jest && eslint
		// Add lint script
		.setScript('lint', 'eslint . --cache --fix' + exts)
		// Add pretest script
		.prependScript('pretest', 'npm run lint')
		.save();

	// Dependencies
	uninstall([...packagesToRemove, ...eslintObsoleteDependencies]);
	install(packages);
};

module.exports.description = 'Adds ESLint';
module.exports.parameters = {
	eslintPreset: {
		type: 'input',
		message: 'Enter ESLint preset name',
		default: 'eslint:recommended',
	},
	eslintPeerDependencies: {
		type: 'config',
		default: [],
	},
	eslintObsoleteDependencies: {
		type: 'config',
		default: [],
	},
	eslintRules: {
		type: 'config',
	},
};
