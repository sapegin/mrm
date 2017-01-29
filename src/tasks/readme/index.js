'use strict';

const path = require('path');
const { template } = require('mrm-core');

module.exports = function(config) {
	// Create Readme.md (no update)
	const readme = template(config('readme', 'Readme.md'), path.join(__dirname, 'Readme.md'));
	if (!readme.exists()) {
		readme
			.apply({
				package: path.basename(process.cwd()),
				license: config('license', 'License.md'),
			}, config())
			.save()
		;
	}
};
module.exports.description = 'Adds readme';
