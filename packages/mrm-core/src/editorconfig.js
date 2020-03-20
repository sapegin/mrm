// @ts-check
const path = require('path');
const editorconfig = require('editorconfig');
const findUp = require('find-up');
const detectIndent = require('detect-indent');
const readFile = require('./fs').readFile;

const EDITORCONFIG_FILE = '.editorconfig';
const TRAILING_NEW_LINE_REGEXP = /\r?\n$/;

/**
 * @typedef EditorConfigStyle
 * @property {'tab' | 'space' | 'unset'} [indent_style]
 * @property {number | 'tab' | 'unset'} [indent_size]
 * @property {true | false | 'unset'} [insert_final_newline]
 */

/**
 * Infer most common EditorConfig options from source code.
 *
 * Supports: indent_style, indent_size, insert_final_newline
 *
 * @param {string} source
 * @return {EditorConfigStyle}
 */
function inferStyle(source) {
	const style = {
		insert_final_newline: hasTrailingNewLine(source),
	};

	const indent = detectIndent(source);
	if (indent.type) {
		style.indent_style = indent.type;
		style.indent_size = indent.type === 'tab' ? 'tab' : indent.amount;
	}

	return style;
}

/**
 * Read EditorConfig for a given file.
 *
 * @param {string} filepath
 * @return {EditorConfigStyle}
 */
function getStyleForFile(filepath) {
	const editorconfigFile = findEditorConfig(filepath);
	if (editorconfigFile) {
		return editorconfig.parseFromFilesSync(filepath, [
			{ name: editorconfigFile, contents: readFile(editorconfigFile) },
		]);
	}

	return {};
}

/**
 * Reformat text according to a given EditorCofnig style.
 *
 * Suports: insert_final_newline
 *
 * @param {string} source
 * @param {EditorConfigStyle} style
 * @return {string}
 */
function format(source, style) {
	if (style.insert_final_newline !== undefined) {
		const has = hasTrailingNewLine(source);
		if (style.insert_final_newline && !has) {
			source += '\n';
		} else if (!style.insert_final_newline && has) {
			source = source.replace(TRAILING_NEW_LINE_REGEXP, '');
		}
	}

	return source;
}

/**
 * Find .editorconfig starting from a directory with a given file.
 *
 * @param {string} filepath
 * @return {string | null}
 */
function findEditorConfig(filepath) {
	return findUp.sync(EDITORCONFIG_FILE, { cwd: path.dirname(filepath) });
}

/**
 * Check is a string ends with a new line character.
 *
 * @param {string} string
 * @return {boolean}
 */
function hasTrailingNewLine(string) {
	return TRAILING_NEW_LINE_REGEXP.test(string);
}

/**
 * Get indentation string (e.g. '  ' or '\t') for a given EditorConfig style,
 * default is two spaces.
 *
 * @param {EditorConfigStyle} style
 */
function getIndent(style) {
	if (style.indent_style === 'tab') {
		return '\t';
	}

	return ' '.repeat(Number(style.indent_size) || 2);
}

module.exports = {
	format,
	getIndent,
	getStyleForFile,
	inferStyle,
	// Private
	findEditorConfig,
	hasTrailingNewLine,
};
