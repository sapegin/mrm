'use strict';

const path = require('path');
const { template } = require('mrm-core');

module.exports = function(config) {
	// Create Readme.md (no update)
	const filename = 'Readme.md';
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
module.exports.description = 'Adds readme';
