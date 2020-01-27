const fs = require('fs');
const { range } = require('lodash');
const semverUtils = require('semver-utils');
const gitUsername = require('git-username');
const { yaml, json, markdown } = require('mrm-core');

function task(config) {
	const { github, readmeFile, maxNode } = config
		.defaults({ github: gitUsername(), readmeFile: 'Readme.md', maxNode: 9 })
		.require('github')
		.values();

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

	// Node versions range
	const requireNodeVersion = pkg.get('engines.node');
	const minNodeVersion = requireNodeVersion
		? semverUtils.parseRange(requireNodeVersion)[0].major
		: maxNode;

	// Only LTS or latest
	const nodeVersions = range(minNodeVersion, maxNode + 1).filter(
		ver => ver % 2 === 0 || ver === maxNode
	);
	travisYml.set('node_js', nodeVersions);

	travisYml.save();

	// Add Travis package badge to Readme
	const url = `https://travis-ci.org/${github}/${pkg.get('name')}`;
	const readme = markdown(readmeFile);
	if (readme.exists()) {
		readme.addBadge(`${url}.svg`, url, 'Build Status').save();
	}

	console.log(`
1. Activate your repository on Travis CI:
${url}

2. Commit and push your changes
`);
}

task.description = 'Adds Travis CI';
module.exports = task;
