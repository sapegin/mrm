const path = require('path');
const meta = require('user-meta');
const gitUsername = require('git-username');
const { template, packageJson } = require('mrm-core');

function task(config) {
	const { name, url, github, readmeFile, licenseFile, packageName } = config
		.defaults({
			github: gitUsername(),
			readmeFile: 'Readme.md',
			licenseFile: 'License.md',
			packageName: packageJson().get('name'),
		})
		.defaults(meta)
		.require('name', 'url', 'github', 'packageName')
		.values();

	// Create Readme.md (no update)
	const readme = template(
		readmeFile,
		path.join(__dirname, 'templates/Readme.md')
	);
	if (!readme.exists()) {
		readme
			.apply({
				name,
				url,
				github,
				license: licenseFile,
				package: packageName,
			})
			.save();
	}
}

task.description = 'Adds readme file';
module.exports = task;
