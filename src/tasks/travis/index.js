'use strict';

const path = require('path');
const last = require('lodash/last');
const { yaml, markdown } = require('mrm-core');

const nodeVersions = [
	4,
	6,
	7,
];

module.exports = function(config) {
	const name = path.basename(process.cwd());

	// .travis.yml
	const travisYml = yaml('.travis.yml');

	if (travisYml.get('node_js', []).length === 1) {
		// Project uses single Node version, update to the latest
		travisYml
			.merge({
				node_js: last(nodeVersions),
			})
		;
	}
	else {
		// Create of update
		travisYml
			.set('language', 'node_js')
			.set('node_js', nodeVersions)  // Overwrite current value if it exists
		;
	}

	travisYml.save();

	// Add Travis package badge to Readme
	const url = `https://travis-ci.org/${config('github')}/${name}`;
	markdown(config('readme', 'Readme.md'))
		.addBadge(
			`${url}.svg`,
			url,
			'Build Status'
		)
		.save()
	;

	console.log(`
1. Activate your repository on Travis CI:
${url}

2. Push your changes
`);
};
module.exports.description = 'Adds Travis CI';
