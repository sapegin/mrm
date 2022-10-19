const fs = require('fs');
const path = require('path');
const meta = require('user-meta');
const parseAuthor = require('parse-author');
const { template, packageJson } = require('mrm-core');
const { template: smplTemplate } = require('smpltmpl');

function getAuthorName(pkg) {
	const rawName = pkg.get('author.name') || pkg.get('author') || '';
	return parseAuthor(rawName).name;
}

function task({ license, name, email, licenseFile }) {
	const templateFile = path.join(__dirname, `templates/${license}.md`);

	if (!fs.existsSync(templateFile)) {
		console.log(`No template for the “${license}” license found, skipping`);
		return;
	}

	template(
		smplTemplate(licenseFile, {
			license,
		}),
		templateFile
	)
		.apply({
			name,
			email,
			year: new Date().getFullYear(),
		})
		.save();

	packageJson().set('license', license).save();
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
