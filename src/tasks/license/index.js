// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const { template, packageJson } = require('mrm-core');
const meta = require('user-meta');

const defaultLicense = 'mit';

function task(config) {
	const { name, email, url, licenseFile } = config
		.defaults({ licenseFile: 'License.md' })
		.defaults(meta)
		.require('name', 'email', 'url')
		.values();

	const pkg = packageJson();
	const license = pkg.get('license', defaultLicense);
	const templateFile = path.join(__dirname, `templates/${license}.md`);

	if (!fs.existsSync(templateFile)) {
		console.log(`No template for the "${license}" found, skipping`);
		return;
	}

	template(licenseFile, templateFile)
		.apply({
			name,
			email,
			url,
			year: new Date().getFullYear(),
		})
		.save();
}
task.description = 'Adds license file';

module.exports = task;
