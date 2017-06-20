'use strict';

const { MrmError, yaml, markdown, packageJson } = require('mrm-core');

const uploadCommand = 'bash <(curl -s https://codecov.io/bash)';
const coverageScript = 'test:coverage';

module.exports = function(config) {
	const travisYml = yaml('.travis.yml');

	// Require .travis.yml
	if (!travisYml.exists()) {
		throw new MrmError(
			`Run travis task first:

  mrm travis`
		);
	}

	const pkg = packageJson();

	// Require coverage npm script
	if (!pkg.getScript(coverageScript)) {
		throw new MrmError(
			`${coverageScript} npm script not found. To add Jest run:

  mrm jest`
		);
	}

	// .travis.yml
	if (!travisYml.get('after_success', []).includes(uploadCommand)) {
		travisYml
			.merge({
				script: [`npm run ${coverageScript}`],
				after_success: [uploadCommand],
			})
			.save();
	}

	// Add Codecov badge to Readme
	const url = `https://codecov.io/gh/${config('github')}/${pkg.get('name')}`;
	markdown(config('readme', 'Readme.md'))
		.addBadge(`${url}/branch/master/graph/badge.svg`, url, 'Codecov')
		.save();
};
module.exports.description = 'Adds Codecov';
