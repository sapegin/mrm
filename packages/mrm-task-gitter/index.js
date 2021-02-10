const { markdown, packageJson } = require('mrm-core');

module.exports = function task({ packageName, readme }) {
	const url = `https://gitter.im/${packageName}`;
	const badge = `https://badges.gitter.im/${packageName}.svg`;
	markdown(readme)
		.addBadge(badge, url, 'Gitter chat')
		.save();
};

module.exports.description = 'Adds Gitter badge to the readme';
module.exports.parameters = {
	packageName: {
		type: 'input',
		message: 'Enter package name',
		default: () => packageJson().get('name'),
		validate(value) {
			return value ? true : 'Package name is required';
		},
	},
	readme: {
		type: 'input',
		message: 'Enter filename for the readme',
		default: 'Readme.md',
	},
};
