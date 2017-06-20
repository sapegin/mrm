'use strict';

const fs = require('fs');
const path = require('path');
const { template, packageJson } = require('mrm-core');

module.exports = function(config) {
	const filename = config('license', 'License.md');

	const pkg = packageJson();
	const license = pkg.get('license');
	const templateFile = path.join(__dirname, `templates/${license}.md`);

	if (!fs.existsSync(templateFile)) {
		console.log(`No template for the "${license}" found, skipping`);
		return;
	}

	template(filename, templateFile)
		.apply(config(), {
			year: new Date().getFullYear(),
		})
		.save();
};
module.exports.description = 'Adds license file';
