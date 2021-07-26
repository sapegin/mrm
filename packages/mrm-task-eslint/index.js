const _ = require('lodash');
const { existsSync } = require('fs');
const {
	json,
	packageJson,
	lines,
	install,
	uninstall,
	getExtsFromCommand,
} = require('mrm-core');

const getConfigName = (configName, scope, prefix) => {
	if (!scope && !configName.startsWith(prefix)) {
		return `${prefix}-${configName}`;
	} else if (scope && !configName) {
		return prefix;
	} else {
		return configName;
	}
};

const normalizePresetPackageName = presetName => {
	const prefix = 'eslint-config';
	const presetNameRegex = /^(?:(@[^/]+)\/?)?((?:eslint-config-)?[^/]*)(?:\/[^/]+)?$/;
	const match = presetName.match(presetNameRegex);

	if (!match) {
		throw new Error(
			`Invalid preset name is passed to the eslint task: ${presetName}`
		);
	}

	const [, scope = '', configNameRaw] = match;
	const configName = getConfigName(configNameRaw, scope, prefix);

	const packageName = `${scope ? `${scope}/` : ''}${configName}`;

	return packageName;
};

module.exports = function task({
	eslintPreset,
	eslintPeerDependencies = [],
	eslintObsoleteDependencies = [],
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

	if (existsSync('.eslintrc.js')) {
		throw new Error('ERROR: Please migrate .eslintrc.js to .eslintrc.json');
	}

	// Preset
	if (eslintPreset !== 'eslint:recommended') {
		packages.push(normalizePresetPackageName(eslintPreset));
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
	const rules = eslintrc.get('rules', {});

	const pkg = packageJson();

	// TODO: Babel
	// Not sure how to detect that we need it, checking for babel-core is not enough because
	// babel-eslint is only needed for experimental features and Flow (this one is easy to test)
	// Flow also needs this: https://github.com/gajus/eslint-plugin-flowtype
	// if (pkg.get('devDependencies.babel-core')) {
	// 	packages.push('babel-eslint');
	// 	eslintrc.set('parser', 'babel-eslint');
	// }

	// Jest
	if (pkg.get('devDependencies.jest')) {
		eslintrc.merge({
			env: {
				jest: true,
			},
			plugins: ['jest'],
		});
		packages.push('eslint-plugin-jest');
	}

	let extendList = eslintrc.get('extends', []);
	let vueParser = false;

	// TypeScript
	if (pkg.get('devDependencies.typescript')) {
		if (extendList.indexOf('plugin:@typescript-eslint/recommended') === -1) {
			extendList.push('plugin:@typescript-eslint/recommended');
		}

		const parser = eslintrc.get('parser');
		vueParser = parser === 'vue-eslint-parser';

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
		exts = ' --ext .ts,.tsx && tsc --noEmit';
		eslintrc.set('rules', _.omit(rules, 'prettier/prettier'));
	}

	const versions = {};
	if (pkg.get('devDependencies.prettier')) {
		packages.push('eslint-config-prettier');
		versions['eslint-config-prettier'] = '^8.3.0';
		extendList = extendList.filter(e => {
			if (e.indexOf('prettier') > -1) {
				console.log(`Removing old extends: ${e}`);
				return false;
			}
			return true;
		});
		const rules = eslintrc.get('rules', {});
		if (
			rules['prettier/prettier'] &&
			!pkg.get('devDependencies.eslint-plugin-prettier')
		) {
			// This breaks in the upgrade
			eslintrc.set('rules', _.omit(rules, 'prettier/prettier'));
		}
		extendList.push('prettier');
	}

	eslintrc.set('extends', extendList);

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
	let lintScript =
		pkg.getScript('lint', 'eslint') ||
		pkg.getScript('test', 'eslint') ||
		pkg.getScript('lint', 'vue-cli-service lint');
	if (lintScript) {
		if (!vueParser) {
			const lintExts = getExtsFromCommand(lintScript, 'ext');
			if (lintExts && lintExts.toString() !== 'js') {
				const extsPattern = lintExts.map(x => `.${x}`).join(',');
				exts = ` --ext ${extsPattern}`;
			}
		}
	} else {
		lintScript = 'eslint . --cache --fix' + exts;
	}
	const script = vueParser ? lintScript : 'eslint . --cache --fix' + exts;

	const pkgManager = existsSync('yarn.lock') ? 'yarn' : 'npm run';

	pkg
		// Remove existing JS linters
		.removeScript(/^(lint:js|eslint|jshint|jslint)$/)
		.removeScript('test', / (lint|lint:js|eslint|jshint|jslint)( |$)/) // npm run jest && npm run lint
		.removeScript('test', /\beslint|jshint|jslint\b/) // jest && eslint
		// Add lint script
		.setScript('lint', script)
		// Add pretest script
		.prependScript('pretest', `${pkgManager} lint`)
		.save();

	// Dependencies
	uninstall([...packagesToRemove, ...eslintObsoleteDependencies]);
	install(packages, { yarn: existsSync('yarn.lock'), dev: true, versions });
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
