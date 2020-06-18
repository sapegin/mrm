// @ts-check
const path = require('path');
const { uniq, flatten } = require('lodash');
const editorConfigToPrettier = require('editorconfig-to-prettier');
const {
	json,
	packageJson,
	install,
	getStyleForFile,
	getExtsFromCommand,
} = require('mrm-core');

const packages = {
	prettier: '>=2',
};
const defaultOverrides = [
	{
		files: '*.md',
		options: {
			printWidth: 70,
			useTabs: false,
			trailingComma: 'none',
			arrowParens: 'avoid',
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
	quoteProps: 'as-needed',
	jsxSingleQuote: false,
	trailingComma: 'es5',
	bracketSpacing: true,
	jsxBracketSameLine: false,
	arrowParens: 'always',
	endOfLine: 'lf',
};

function getPattern(pkg) {
	// We want to keep any extra extensions
	const prettierExts = getExtsFromCommand(pkg.getScript('format'));

	// ESLint extensions > TypeScript (.ts,.tsx) > .js
	const eslintExts = getExtsFromCommand(pkg.getScript('lint'), 'ext');
	const typeScriptExts = pkg.get('devDependencies.typescript') && ['ts', 'tsx'];
	const scriptExts = eslintExts || typeScriptExts || ['js'];

	// Stylelint extensions > .css
	const stylelintExts = getExtsFromCommand(pkg.getScript('lint:css'));
	const styleExts = stylelintExts || ['css'];

	const exts = uniq(
		flatten([prettierExts, scriptExts, styleExts, ['md']]).filter(Boolean)
	);
	return `**/*.{${exts.join(',')}}`;
}

module.exports = function task({
	indent,
	prettierPattern,
	prettierOptions,
	prettierOverrides,
}) {
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

	const pattern =
		prettierPattern === 'auto' ? getPattern(pkg) : prettierPattern;

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
};

module.exports.description = 'Adds Prettier';
module.exports.parameters = {
	indent: {
		type: 'input',
		message: 'Choose indentation style (tabs or number of spaces)',
		default: 'tab',
		choices: ['tab', 2, 4, 8],
	},
	prettierPattern: {
		type: 'input',
		message: 'Enter Prettier file glob pattern',
		default: 'auto',
	},
	prettierOptions: {
		type: 'config',
	},
	prettierOverrides: {
		type: 'config',
	},
};
