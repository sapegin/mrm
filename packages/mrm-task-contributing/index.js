const path = require('path');
const gitUsername = require('git-username');
const { template, packageJson } = require('mrm-core');

function task(config) {
	const { contributingFile } = config
		.defaults({
			contributingFile: 'Contributing.md',
		})
		.values();

	// Create Contributing.md (no update)
	const contributing = template(
		contributingFile,
		path.join(__dirname, 'templates/Contributing.md')
	);
	if (!contributing.exists()) {
		const { github, packageName } = config
			.defaults({
				github: gitUsername(),
				packageName: packageJson().get('name'),
			})
			.require('github', 'packageName')
			.values();

		contributing
			.apply({
				github,
				contributingFile,
				packageName,
			})
			.save();
	}
}

task.description = 'Adds contributing guidelines';
module.exports = task;
