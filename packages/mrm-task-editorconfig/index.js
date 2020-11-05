const { ini } = require('mrm-core');

const jsonRules = {
	indent_style: 'space',
	indent_size: 2,
};
const jsonExtensions = [
	'json',
	'yml',
	'md',
	'babelrc',
	'remarkrc',
	'prettierrc',
];

module.exports = function task({ indent }) {
	const generalRules = Object.assign(
		indent === 'tab'
			? {
					indent_style: 'tab',
			  }
			: {
					indent_style: 'space',
					indent_size: indent,
			  },
		{
			end_of_line: 'lf',
			charset: 'utf-8',
			trim_trailing_whitespace: true,
			insert_final_newline: true,
		}
	);

	// .editorconfig
	const editorconfig = ini('.editorconfig', 'editorconfig.org');
	editorconfig.set('_global', { root: true }).set('*', generalRules);

	// Set/update JSON-like section
	const jsonSection = editorconfig.get().find(section => /json/.test(section));
	if (jsonSection) {
		editorconfig.unset(jsonSection);
	}

	if (indent !== jsonRules.indent_size) {
		editorconfig.set('*.{' + jsonExtensions.join(',') + '}', jsonRules);
	}

	editorconfig.save();
};

module.exports.description = 'Adds EditorConfig';
module.exports.parameters = {
	indent: {
		type: 'input',
		message: 'Choose indentation style (tabs or number of spaces)',
		default: 'tab',
		choices: ['tab', 2, 4, 8],
	},
};
