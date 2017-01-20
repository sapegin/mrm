'use strict';

const path = require('path');
const { template } = require('mrm-core');

module.exports = function(config) {
	// Create Contributing.md (no update)
	const filename = 'Contributing.md';
	const readme = template(filename, path.join(__dirname, filename));
	if (!readme.get()) {
		readme
			.apply(config(), {
				package: path.basename(process.cwd()),
			})
			.save()
		;
	}
};
module.exports.description = 'Adds contributing guidelines';
