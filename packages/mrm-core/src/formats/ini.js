// @ts-check
const propIni = require('prop-ini');
const base = require('./file');

/**
 * Adds (or removes) spaces before and after `=`.
 *
 * @param {string} content
 * @param {boolean} withSpaces
 * @returns {string}
 */
function prettify(content, withSpaces = true) {
	const replaceValue = withSpaces ? ' = ' : '=';
	return `${content}\n`.replace(/\s*=\s*/g, replaceValue);
}

const detectSpacesRegex = /^\w+(\s*=\s*)/gm;

/**
 * Detect withSpaces parameter for prettify.
 * Uses first line of file to see if it has spaces around = or not.
 *
 * @param {string} content
 * @returns {boolean}
 */
function detectWithSpaces(content) {
	const matchResult = detectSpacesRegex.exec(content);
	return !(matchResult && matchResult[1] === '=');
}

/**
 * @param {string} filename
 * @param {string} [comment]
 */
module.exports = function(filename, comment) {
	const file = base(filename);

	const ini = propIni.createInstance({});
	ini.decode({
		data: file.get(),
	});

	const originalWithSpaces = detectWithSpaces(file.get());

	return {
		/** Return true if a file exists */
		exists() {
			return file.exists();
		},

		/**
		 * Get a value of a given section
		 * @param {string} section
		 */
		get(section) {
			if (!section) {
				return ini.getSections();
			}

			return ini.getData(section);
		},

		/**
		 * Set a value of a given section
		 * @param {string} section
		 * @param {any} value
		 */
		set(section, value) {
			ini.addData(value, section);
			return this;
		},

		/**
		 * Remove a given section
		 * @param {string} section
		 */
		unset(section) {
			ini.removeData(section);
			return this;
		},

		/**
		 * Save file
		 * @param {{withSpaces: boolean}} options
		 */
		save({ withSpaces } = { withSpaces: originalWithSpaces }) {
			const encoded = prettify(ini.encode(), withSpaces);
			const content = comment ? `# ${comment}\n${encoded}` : encoded;
			file.save(content);
			return this;
		},

		/** Delete file */
		delete() {
			return file.delete();
		},
	};
};
