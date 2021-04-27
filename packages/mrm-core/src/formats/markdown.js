// @ts-check
const addBadge = require('readme-badger').addBadge;
const MrmError = require('../error');
const base = require('./file');

// [![altText](imageUrl)](linkUrl)
const BADGE_REGEXP = /\s?\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;

/**
 * @param {string} filename
 */
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

		/**
		 * Add a badge
		 * @param {string} imageUrl
		 * @param {string} linkUrl
		 * @param {string} altText
		 */
		addBadge(imageUrl, linkUrl, altText) {
			if (!file.exists()) {
				throw new MrmError(`Can’t add badge: file “${filename}” not found.`);
			}

			if (content.includes(linkUrl)) {
				return this;
			}

			content = addBadge(content, 'md', imageUrl, linkUrl, altText);
			return this;
		},

		/**
		 * Remove a badge
		 * @param {predicate} Function
		 */
		removeBadge(predicate) {
			content = content.replace(
				BADGE_REGEXP,
				(match, altText, imageUrl, linkUrl) =>
					predicate({ altText, imageUrl, linkUrl }) ? '' : match
			);
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
