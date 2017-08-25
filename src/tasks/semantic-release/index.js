'use strict';

const fs = require('fs');
const { MrmError, packageJson, lines, yaml, markdown, uninstall } = require('mrm-core');

const PACKAGE_NAME = 'semantic-release';

module.exports = function(config) {
	// Require .travis.yml
	if (!fs.existsSync('.travis.yml')) {
		throw new MrmError(
			`Run travis task first:
  mrm travis`
		);
	}

	// package.json
	const pkg = packageJson();

	if (!pkg.getScript('semantic-release')) {
		throw new MrmError(
			`Setup semantic-release first:
  npx semantic-release-cli setup
  
semantic-release needs to add required auth keys to Travis CI.
WARNING: Do not agree to update your .travis.yml when asked.

More info:
https://github.com/semantic-release/semantic-release#setup
`
		);
	}

	// Remove semantic-release devDependency
	pkg.unset(`devDependencies.${PACKAGE_NAME}`);

	// Remove semantic-release script
	pkg.removeScript(PACKAGE_NAME);

	// Save package.json
	pkg.save();

	const travisYml = yaml('.travis.yml');
	const travisCommands = travisYml.get('after_success');
	// Remove the official semantic-release runner from commands list on .travis.yml
	if (Array.isArray(travisCommands)) {
		travisYml.set(
			'after_success',
			travisCommands.filter(cmd => cmd !== 'npm run semantic-release')
		);
	}
	travisYml
		// Add global semantic-release runner to .travis.yml
		.merge({
			after_success: [
				`npm install -g semantic-release`,
				'semantic-release pre && npm publish && semantic-release post',
			],
			branches: {
				except: ['/^v\\d+\\.\\d+\\.\\d+$/'],
			},
		})
		.save();

	// Add Changelog.md to .gitignore
	lines('.gitignore').add(config('changelog', 'Changelog.md')).save();

	// Add npm package version badge to Readme.md
	const name = pkg.get('name');
	const readme = markdown(config('readme', 'Readme.md'));
	if (readme.exists()) {
		readme
			.addBadge(
				`https://img.shields.io/npm/v/${name}.svg`,
				`https://www.npmjs.com/package/${name}`,
				'npm'
			)
			.save();
	}

	// Dependencies
	uninstall(PACKAGE_NAME);
};
module.exports.description = 'Adds semantic-release';
