const path = require('path');
const gitUsername = require('git-username');
const { template, packageJson } = require('mrm-core');

module.exports = function task({ contributingFile, github, packageName }) {
	// Create Contributing.md (no update)
	const contributing = template(
		contributingFile,
		path.join(__dirname, 'templates/Contributing.md')
	);
	if (!contributing.exists()) {
		contributing
			.apply({
				github,
				contributingFile,
				packageName,
			})
			.save();
	}
};

module.exports.description = 'Adds contributing guidelines';
module.exports.parameters = {
	contributingFile: {
		type: 'input',
		message: 'Enter filename for contributing guidelines',
		default: 'Contributing.md',
	},
	github: {
		type: 'input',
		message: 'Enter your GitHub username',
		default: gitUsername(),
		validate(value) {
			return value ? true : 'GitHub username is required';
		},
	},
	packageName: {
		type: 'input',
		message: 'Enter package name',
		default: () => packageJson().get('name'),
		validate(value) {
			return value ? true : 'Package name is required';
		},
	},
};
