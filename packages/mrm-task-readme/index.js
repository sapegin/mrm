const path = require('path');
const meta = require('user-meta');
const parseAuthor = require('parse-author');
const packageRepoUrl = require('package-repo-url');
const { template, packageJson } = require('mrm-core');
const { template: smplTemplate, templateFromFile } = require('smpltmpl');

function getAuthorName(pkg) {
	const rawName = pkg.get('author.name') || pkg.get('author') || '';
	return parseAuthor(rawName).name;
}

function task({
	packageName,
	name,
	url,
	readmeFile,
	licenseFile,
	license,
	includeContributing,
	contributingFile,
}) {
	// Create Readme.md (no update)
	const readme = template(
		readmeFile,
		path.join(__dirname, 'templates/Readme.md')
	);
	if (!readme.exists()) {
		const contributingTemplate = includeContributing
			? templateFromFile(path.join(__dirname, 'templates/Contributing.md'), {
					contributingFile,
			  })
			: '';
		readme
			.apply({
				name,
				url,
				github: packageRepoUrl(),
				license: smplTemplate(licenseFile, {
					license,
				}),
				package: packageName,
				contributing: '\n' + contributingTemplate,
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
	includeContributing: {
		type: 'confirm',
		message: 'Include Contributing section linking to Contributing file?',
		default: true,
	},
	contributingFile: {
		type: 'input',
		message: 'Enter filename for the contributing file',
		default: 'Contributing.md',
	},
	readmeFile: {
		type: 'input',
		message: 'Enter filename for the readme',
		default: 'Readme.md',
	},
	license: {
		type: 'input',
		message: 'Choose a license',
		default: () => packageJson().get('license', 'MIT'),
		choices: ['Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MIT', 'Unlicense'],
	},
	licenseFile: {
		type: 'input',
		message: 'Enter filename for the license',
		default: 'License.md',
	},
};
