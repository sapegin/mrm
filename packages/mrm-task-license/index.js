const fs = require('fs');
const path = require('path');
const meta = require('user-meta');
const { template, packageJson } = require('mrm-core');

function getAuthorName(pkg) {
	const authorRegExp = /\(.*\)|<.*>/g;

	if (typeof pkg.get('author') === 'string') {
		return pkg
			.get('author')
			.replace(authorRegExp, '')
			.trim();
	}

	return pkg.get('author.name');
}

function task({ license, name, email, licenseFile }) {
	const templateFile = path.join(__dirname, `templates/${license}.md`);

	if (!fs.existsSync(templateFile)) {
		console.log(`No template for the “${license}” license found, skipping`);
		return;
	}

	template(licenseFile, templateFile)
		.apply({
			name,
			email,
			year: new Date().getFullYear(),
		})
		.save();

	packageJson()
		.set('license', license)
		.save();
}

module.exports = task;
module.exports.description = 'Adds license file';
module.exports.getAuthorName = getAuthorName;

module.exports.parameters = {
	license: {
		type: 'input',
		message: 'Choose a license',
		default: () => packageJson().get('license', 'MIT'),
		choices: ['Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MIT', 'Unlicense'],
	},
	name: {
		type: 'input',
		message: 'Enter author name',
		default: () => getAuthorName(packageJson()) || meta.name,
		validate(value) {
			return value ? true : 'Author name is required';
		},
	},
	email: {
		type: 'input',
		message: 'Enter author email',
		default: meta.email,
		validate(value) {
			return value ? true : 'Email is required';
		},
	},
	licenseFile: {
		type: 'input',
		message: 'Enter filename for the license',
		default: 'License.md',
	},
};
