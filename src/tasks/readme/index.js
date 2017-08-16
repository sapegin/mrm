'use strict';

const path = require('path');
const { template } = require('mrm-core');

module.exports = function(config) {
	config.require('name', 'url', 'github');

	// Create Readme.md (no update)
	const readme = template(config('readme', 'Readme.md'), path.join(__dirname, 'Readme.md'));
	if (!readme.exists()) {
		readme
			.apply({
				name: config('name'),
				url: config('url'),
				github: config('github'),
				license: config('license', 'License.md'),
				package: path.basename(process.cwd()),
			})
			.save();
	}
};
module.exports.description = 'Adds readme';
