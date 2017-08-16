// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { template, packageJson } = require('mrm-core');

const defaultLicense = 'mit';

function task(config) {
	config.require('name', 'email', 'url');

	const filename = config('license', 'License.md');

	const pkg = packageJson();
	const license = pkg.get('license', defaultLicense);
	const templateFile = path.join(__dirname, `templates/${license}.md`);

	if (!fs.existsSync(templateFile)) {
		console.log(`No template for the "${license}" found, skipping`);
		return;
	}

	template(filename, templateFile)
		.apply({
			name: config('name'),
			email: config('email'),
			url: config('url'),
			year: new Date().getFullYear(),
		})
		.save();
}
task.description = 'Adds license file';

module.exports = task;
