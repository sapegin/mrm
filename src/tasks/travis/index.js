'use strict';

const fs = require('fs');
const range = require('lodash/range');
const semverUtils = require('semver-utils');
const { yaml, json, markdown } = require('mrm-core');

const latestNodeVersion = 8;

module.exports = function(config) {
	const pkg = json('package.json');

	// .travis.yml
	const travisYml = yaml('.travis.yml');

	travisYml.merge({
		language: 'node_js',
		cache: {
			directories: ['node_modules'],
		},
	});

	// Enable caching for Yarn
	if (fs.existsSync('yarn.lock')) {
		travisYml.set('cache.yarn', true);
	}

	// Install latest npm
	if (fs.existsSync('package-lock.json') && !travisYml.get('before_install')) {
		travisYml.set('before_install', [
			'if [[ `npm -v` != 5* ]]; then npm install -g npm@latest; fi',
		]);
	}

	// Node versions range
	const requireNodeVersion = pkg.get('engines.node');
	const minNodeVersion = requireNodeVersion
		? semverUtils.parseRange(requireNodeVersion)[0].major
		: latestNodeVersion;
	// Only LTS or latest
	const nodeVersions = range(minNodeVersion, latestNodeVersion + 1).filter(
		ver => ver % 2 === 0 || ver === latestNodeVersion
	);
	travisYml.set('node_js', nodeVersions);

	travisYml.save();

	// Add Travis package badge to Readme
	const url = `https://travis-ci.org/${config('github')}/${pkg.get('name')}`;
	markdown(config('readme', 'Readme.md')).addBadge(`${url}.svg`, url, 'Build Status').save();

	console.log(`
1. Activate your repository on Travis CI:
${url}

2. Commit and push your changes
`);
};
module.exports.description = 'Adds Travis CI';
