const fs = require('fs');
const path = require('path');
const meta = require('user-meta');
const { template, packageJson } = require('mrm-core');

const defaultLicense = 'MIT';

const ANONYMOUS_LICENSES = ['Unlicense'];

const isAnonymouseLicense = name => ANONYMOUS_LICENSES.indexOf(name) > -1;

function task(config) {
	const pkg = packageJson();
	config
		.defaults({ licenseFile: 'License.md' })
		.defaults({ name: pkg.get('author.name') })
		.defaults(meta);

	const configLicense = config.values().license;

	if (!isAnonymouseLicense(configLicense)) {
		config.require('name', 'email');
	}

	const { name, email, licenseFile } = config.values();

	let license = configLicense;
	let shouldUpdatePkgLicense = false;
	if (!license) {
		license = pkg.get('license', defaultLicense);
		shouldUpdatePkgLicense = true;
	}

	const templateFile = path.join(__dirname, `templates/${license}.md`);

	if (!fs.existsSync(templateFile)) {
		console.log(`No template for the "${license}" license found, skipping`);
		return;
	}

	if (shouldUpdatePkgLicense) {
		pkg.set('license', license);
		pkg.save();
	}

	template(licenseFile, templateFile)
		.apply({
			name,
			email,
			year: new Date().getFullYear(),
		})
		.save();
}
task.description = 'Adds license file';

module.exports = task;
