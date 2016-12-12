'use strict';

const json = require('../../formats/json');
const lines = require('../../formats/lines');
const yaml = require('../../formats/yaml');
const { install } = require('../../npm');
const MrmError = require('../../error');

const packages = [
	'semantic-release-tamia',
];

module.exports = function() {
	// package.json
	const packageJson = json('package.json');

	if (!packageJson.get('dependencies.semantic-release')) {
		throw new MrmError('Install semantic-release first:\nhttps://github.com/semantic-release/semantic-release');
	}

	if (packageJson.get('dependencies.semantic-release-tamia')) {
		return;
	}

	packageJson
		.merge({
			scripts: {
				'semantic-release': 'semantic-release pre && npm publish && semantic-release post',
			},
			release: {
				analyzeCommits: 'semantic-release-tamia/analyzeCommits',
				generateNotes: 'semantic-release-tamia/generateNotes',
				verifyRelease: 'semantic-release-tamia/verifyReleas',
			},
		})
		.save()
	;

	// .travis.yml
	yaml('.travis.yml')
		.merge({
			after_success: [
				'curl -Lo travis_after_all.py https://git.io/vXXtr',
				'python travis_after_all.py',
				'export $(cat .to_export_back) &> /dev/null',
				'npm run semantic-release',
			],
			branches: {
				except: [
					'/^v\\d+\\.\\d+\\.\\d+$/',
				],
			},
		})
		.save()
	;

	// .gitignore
	lines('.gitignore')
		.append('Changelog.md')
		.save()
	;

	// package.json: dependencies
	install(packages);
};
module.exports.description = 'Customizes semantic-release';
