'use strict';

const fs = require('fs');
const propIni = require('prop-ini');
const { readFile, updateFile } = require('../index');

/**
 * Adds spaces before and after `=`.
 *
 * @param {string} content
 * @returns {string}
 */
function prettify(content) {
	return `${content}\n`
		.replace(/\s*=\s*/g, ' = ')
	;
}

module.exports = function(filename, comment) {
	const ini = propIni.createInstance();
	const exists = fs.existsSync(filename);

	let originalContent = '';
	if (exists) {
		originalContent = readFile(filename);
		ini.decode({
			data: originalContent,
		});
	}
	else {
		ini.decode({
			data: '',
		});
	}

	return {
		get(section) {
			if (!section) {
				return ini.getSections();
			}

			return ini.getData(section);
		},

		set(section, value) {
			ini.addData(value, section);
			return this;
		},

		unset(section) {
			ini.removeData(section);
			return this;
		},

		save() {
			const encoded = prettify(ini.encode());
			const content = comment
				? `# ${comment}\n${encoded}`
				: encoded
			;
			updateFile(filename, content, originalContent, exists);
			return this;
		},
	};
};
