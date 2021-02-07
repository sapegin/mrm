const _ = require('lodash');
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
	} else if (prefix === 'eslint-plugin') {
		return `${prefix}-${configName}`;
	} else {
		return configName;
	}
};

const normalizePresetPackageName = presetName => {
	const presetNameRegex = /^(plugin:)?(?:(@[^/]+)\/?)?((?:eslint-config-)?[^/]*)(?:\/[^/]+)?$/;
	const match = presetName.match(presetNameRegex);

	if (!match) {
		throw new Error(
			`Invalid preset name is passed to the eslint task: ${presetName}`
		);
	}

	const [, isPlugin, scope = '', configNameRaw] = match;
	const prefix = isPlugin ? 'eslint-plugin' : 'eslint-config';
	const configName = getConfigName(configNameRaw, scope, prefix);

	const packageName = `${scope ? `${scope}/` : ''}${configName}`;

	return packageName;
};

module.exports = function task({
	eslintPreset: eslintPresetRaw,
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
	const eslintPresets = eslintPresetRaw.split(/,\s*/);

	// Preset
	for (const eslintPreset of eslintPresets) {
		if (eslintPreset !== 'eslint:recommended') {
			packages.push(normalizePresetPackageName(eslintPreset));
		}
	}

	// Peer dependencies
	packages.push(...eslintPeerDependencies);

	// Migrate legacy config
	const legacyEslintrc = json(legacyConfigFile);
	const legacyConfig = legacyEslintrc.get();
	legacyEslintrc.delete();

	// .eslintrc.json
	const eslintrc = json(configFile, legacyConfig);
	const extnds = _.castArray(eslintrc.get('extends', []));
	const hasCustomPreset =
		extnds.length &&
		eslintPresets.every(eslintPreset =>
			extnds.some(x => x.startsWith(eslintPreset))
		);

	if (!hasCustomPreset) {
		const presets = eslintrc.get('extends');
		if (!presets) {
			eslintrc.set(
				'extends',
				eslintPresets.length > 1 ? eslintPresets : eslintPresets[0]
			);
		} else {
			eslintrc.set('extends', [
				...new Set([...eslintPresets, ..._.castArray(presets)]),
			]);
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
					...new Set([
						...(Array.isArray(extensions) ? extensions : [extensions]),
						'prettier',
						'prettier/@typescript-eslint',
					]),
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
	install([...new Set(packages)]);
};

module.exports.description = 'Adds ESLint';
module.exports.parameters = {
	eslintPreset: {
		type: 'input',
		message: 'Enter ESLint preset name (or a comma-separated list thereof)',
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
