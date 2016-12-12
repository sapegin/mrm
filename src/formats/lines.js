'use strict';

const fs = require('fs');
const concat = require('lodash/fp/concat');
const uniq = require('lodash/fp/uniq');
const flow = require('lodash/fp/flow');
const splitLines = require('split-lines');
const { readFile, updateFile } = require('../index');

module.exports = function(filename, defaultValue = []) {
	const exists = fs.existsSync(filename);

	let originalContent = '';
	let lines = defaultValue;
	if (exists) {
		originalContent = readFile(filename);
		lines = splitLines(originalContent);
	}

	return {
		get() {
			return lines;
		},

		append(...values) {
			lines = flow(concat(values), uniq)(lines);
			return this;
		},

		save() {
			const content = lines.join('\n');
			updateFile(filename, content, originalContent, exists);
			return this;
		},
	};
};
