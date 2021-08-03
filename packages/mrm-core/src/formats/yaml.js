// @ts-check
const _ = require('lodash');
const yaml = require('yaml');
const merge = require('../util/merge');
const base = require('./file');

const YAML_READ_OPTIONS = {
	prettyErrors: true,
};
const DEFAULT_INDENT = 2;

/**
 * @param {string} filename
 * @param {{}} [defaultValues]
 * @param {{}} [options]
 */
module.exports = function(filename, defaultValues, options) {
	const yamlOptions = _.pick(options, ['version']);
	const file = base(filename);

	const yamlReadOptions = _.defaults(yamlOptions, YAML_READ_OPTIONS);
	let json = yaml.parse(file.get(), yamlReadOptions) || defaultValues || {};

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
			const yamlWriteOptions = _.defaults(yamlOptions, {
				indent: file.getStyle().indent_size || DEFAULT_INDENT,
			});
			const content = yaml.stringify(json, yamlWriteOptions);
			file.save(content);
			return this;
		},

		/** Delete file */
		delete() {
			return file.delete();
		},
	};
};
