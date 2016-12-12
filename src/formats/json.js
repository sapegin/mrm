'use strict';

const fs = require('fs');
const get = require('lodash/get');
const set = require('lodash/set');
const parseJson = require('parse-json');
const merge = require('webpack-merge');
const { readFile, updateFile } = require('../index');

module.exports = function(filename, defaultValue = {}) {
	const exists = fs.existsSync(filename);

	let originalContent = '';
	let json = defaultValue;
	if (exists) {
		originalContent = readFile(filename);
		json = parseJson(originalContent);
	}

	return {
		get(address, defaultValue) {
			if (!address) {
				return json;
			}

			return get(json, address, defaultValue);
		},

		set(address, value) {
			set(json, address, value);
			return this;
		},

		merge(value) {
			json = merge(json, value);
			return this;
		},

		save() {
			const content = JSON.stringify(json, null, '  ');
			updateFile(filename, content, originalContent, exists);
			return this;
		},
	};
};
