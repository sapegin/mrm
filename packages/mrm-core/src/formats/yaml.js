const _ = require('lodash');
const yaml = require('js-yaml');
const merge = require('../util/merge');
const base = require('./file');

module.exports = function(filename, defaultValues) {
	const file = base(filename);

	let json = yaml.safeLoad(file.get()) || defaultValues || {};

	return {
		/** Return true if a file exists */
		exists() {
			return file.exists();
		},

		/** Get a value at a given address */
		get(address, defaultValue) {
			if (!address) {
				return json;
			}

			return _.get(json, address, defaultValue);
		},

		/** Set a value at a given address */
		set(address, value) {
			if (value === undefined) {
				json = address;
			} else {
				_.set(json, address, value);
			}
			return this;
		},

		/** Remove a section with a given address */
		unset(address) {
			_.unset(json, address);
			return this;
		},

		/** Merge a given value with the current value */
		merge(value) {
			json = merge(json, value);
			return this;
		},

		/** Save file */
		save() {
			const content = yaml.safeDump(json, {
				lineWidth: 120,
			});
			file.save(content);
			return this;
		},

		/** Delete file */
		delete() {
			return file.delete();
		},
	};
};
