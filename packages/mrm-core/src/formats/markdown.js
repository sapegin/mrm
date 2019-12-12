const addBadge = require('readme-badger').addBadge;
const MrmError = require('../error');
const base = require('./file');

module.exports = function(filename) {
	const file = base(filename);

	let content = file.get();

	return {
		/** Return true if a file exists */
		exists() {
			return file.exists();
		},

		/** Get file content */
		get() {
			return content;
		},

		/** Add a badge */
		addBadge(imageUrl, linkUrl, altText) {
			if (!content) {
				throw new MrmError(`Can’t add badge: file "${filename}" not found.`);
			}

			if (content.includes(linkUrl)) {
				return this;
			}

			content = addBadge(content, 'md', imageUrl, linkUrl, altText);
			return this;
		},

		/** Save file */
		save() {
			file.save(content);
			return this;
		},

		/** Delete file */
		delete() {
			return file.delete();
		},
	};
};
