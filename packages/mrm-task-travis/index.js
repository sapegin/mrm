const fs = require('fs');
const { range } = require('lodash');
const semverUtils = require('semver-utils');
const packageRepoUrl = require('package-repo-url');
const { yaml, json, markdown } = require('mrm-core');

module.exports = function task({ readmeFile, maxNode }) {
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
	const github = packageRepoUrl().replace('https://github.com/', '');
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
};

module.exports.description = 'Adds Travis CI';
module.exports.parameters = {
	readmeFile: {
		type: 'input',
		message: 'Enter filename for the readme',
		default: 'Readme.md',
	},
	maxNode: {
		type: 'input',
		message: 'Enter the maximum Node.js versions to run tests on',
		default: 12,
	},
};
