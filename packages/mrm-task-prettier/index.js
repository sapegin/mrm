const path = require('path');
const editorConfigToPrettier = require('editorconfig-to-prettier');
const { json, packageJson, install } = require('mrm-core');
const { getStyleForFile, getExtsFromCommand } = require('mrm-core');

const defaultPattern = '**/*.{js,css,md}';
const defaultOverrides = [
	{
		files: '*.md',
		options: {
			printWidth: 70,
			useTabs: false,
			trailingComma: 'none',
			proseWrap: 'never',
		},
	},
];
const defaultPrettierOptions = {
	printWidth: 80,
	tabWidth: 2,
	useTabs: false,
	semi: true,
	singleQuote: false,
	trailingComma: 'none',
	bracketSpacing: true,
	jsxBracketSameLine: false,
};

function task(config) {
	const packages = ['prettier'];

	const { indent, prettierPattern, prettierOptions, prettierOverrides } = config
		.defaults({
			indent: 'tab',
			prettierPattern: defaultPattern,
		})
		.values();

	// Try to read options from EditorConfig
	const testJsFile = path.join(process.cwd(), 'test.js');
	const editorconfigOptions = editorConfigToPrettier(
		getStyleForFile(testJsFile)
	);

	const pkg = packageJson();

	const overrides = prettierOverrides || defaultOverrides;
	const options = Object.assign(
		{},
		prettierOptions
			? {}
			: {
					useTabs: indent === 'tab',
			  },
		editorconfigOptions,
		prettierOptions,
		overrides && { overrides }
	);

	// Remove options that have the same values as Prettier defaults
	for (const option in options) {
		if (options[option] === defaultPrettierOptions[option]) {
			delete options[option];
		}
	}

	// .prettierrc
	json('.prettierrc')
		.merge(options)
		.save();

	// Keep custom pattern
	let pattern = prettierPattern;
	const formatScript = pkg.getScript('format');
	if (formatScript) {
		const exts = getExtsFromCommand(formatScript);
		if (exts) {
			pattern = `**/*.{${exts}}`;
		}
	}

	pkg
		// Add format script
		// Double quotes are essential to support Windows:
		// https://github.com/prettier/prettier/issues/4086#issuecomment-370228517
		.setScript('format', `prettier --loglevel warn --write "${pattern}"`)
		// Add pretest script
		.appendScript('posttest', 'npm run format')
		.save();

	// Dependencies
	install(packages);
}

task.description = 'Adds Prettier';
module.exports = task;
