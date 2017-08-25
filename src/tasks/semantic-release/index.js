'use strict';

const fs = require('fs');
const { MrmError, packageJson, lines, yaml, markdown, uninstall } = require('mrm-core');

const PACKAGE_NAME = 'semantic-release';

function hasSemanticRelease() {
	const commands = yaml('.travis.yml').get('after_success');
	return commands && commands.find(cmd => cmd.includes(PACKAGE_NAME)).length > 0;
}

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

	if (!hasSemanticRelease()) {
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
	travisYml
		// Remove the official semantic-release runner from commands list on .travis.yml
		.set(
			'after_success',
			travisYml.get('after_success').filter(cmd => cmd !== 'npm run semantic-release')
		)
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
