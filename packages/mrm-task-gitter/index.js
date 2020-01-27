const { markdown, packageJson } = require('mrm-core');

function task(config) {
	const pkg = packageJson();
	const { packageName } = config
		.defaults({ packageName: pkg.get('name') })
		.require('packageName')
		.values();

	const url = `https://gitter.im/${packageName}`;
	markdown(config('readme', 'Readme.md'))
		.addBadge(`https://badges.gitter.im/${packageName}.svg`, url, 'Gitter chat')
		.save();
}

task.description = 'Adds Gitter badge to the readme';
module.exports = task;
