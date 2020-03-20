// @ts-check
const _ = require('lodash');
const commentsJson = require('comment-json');
const merge = require('../util/merge');
const base = require('./file');

/**
 * @param {string} filename
 * @param {{}} [defaultValues]
 */
module.exports = function(filename, defaultValues) {
	const file = base(filename);
	let json = file.get() ? commentsJson.parse(file.get()) : defaultValues || {};

	return {
		/** Return true if a file exists */
		exists() {
			return file.exists();
		},

		/**
		 * Get a value at a given address
		 * @param {string | string[]} address
		 * @param {{}} [defaultValue]
		 */
		get(address, defaultValue) {
			if (!address) {
				return json;
			}

			return _.get(json, address, defaultValue);
		},

		/**
		 * Set a value at a given address
		 * @param {string | string[]} address
		 * @param {any} value
		 */
		set(address, value) {
			if (value === undefined) {
				json = address;
			} else {
				_.set(json, address, value);
			}
			return this;
		},

		/**
		 * Remove a section with a given address
		 * @param {string | string[]} address
		 */
		unset(address) {
			_.unset(json, address);
			return this;
		},

		/**
		 * Merge a given value with the current value
		 * @param {any} value
		 */
		merge(value) {
			json = merge(json, value);
			return this;
		},

		/** Save file */
		save() {
			const content = commentsJson.stringify(json, null, file.getIndent());
			file.save(content);
			return this;
		},

		/** Delete file */
		delete() {
			return file.delete();
		},
	};
};
