const path = require('path');
const meta = require('user-meta');
const parseAuthor = require('parse-author');
const packageRepoUrl = require('package-repo-url');
const { template, packageJson } = require('mrm-core');

function getAuthorName(pkg) {
	const rawName = pkg.get('author.name') || pkg.get('author') || '';
	return parseAuthor(rawName).name;
}

function task({ packageName, name, url, readmeFile, licenseFile }) {
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
				github: packageRepoUrl(),
				license: licenseFile,
				package: packageName,
			})
			.save();
	}
}

module.exports = task;
module.exports.description = 'Adds readme file';

module.exports.parameters = {
	packageName: {
		type: 'input',
		message: 'Enter package name',
		default: () => packageJson().get('name'),
		validate(value) {
			return value ? true : 'Package name is required';
		},
	},
	name: {
		type: 'input',
		message: 'Enter author name',
		default: () => getAuthorName(packageJson()) || meta.name,
		validate(value) {
			return value ? true : 'Author name is required';
		},
	},
	url: {
		type: 'input',
		message: 'Enter author site URL',
		default: meta.url,
		validate(value) {
			return value ? true : 'Site URL is required';
		},
	},
	readmeFile: {
		type: 'input',
		message: 'Enter filename for the readme',
		default: 'Readme.md',
	},
	licenseFile: {
		type: 'input',
		message: 'Enter filename for the license',
		default: 'License.md',
	},
};
