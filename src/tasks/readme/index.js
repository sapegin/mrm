// @ts-check
'use strict';

const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { template, packageJson } = require('mrm-core');

function task(config) {
	const { name, url, github, readmeFile, licenseFile } = config
		.defaults({ github: gitUsername(), readmeFile: 'Readme.md', licenseFile: 'License.md' })
		.defaults(meta)
		.require('name', 'url', 'github')
		.values();

	// Create Readme.md (no update)
	const readme = template(readmeFile, path.join(__dirname, 'Readme.md'));
	if (!readme.exists()) {
		readme
			.apply({
				name,
				url,
				github,
				license: licenseFile,
				package: packageJson().get('name'),
			})
			.save();
	}
}

task.description = 'Adds readme file';
module.exports = task;
