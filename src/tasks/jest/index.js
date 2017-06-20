'use strict';

const fs = require('fs');
const { lines, packageJson, copyFiles, install, uninstall } = require('mrm-core');

const packages = ['jest'];
const oldPackages = ['mocha', 'chai', 'ava'];

module.exports = function() {
	// package.json
	const pkg = packageJson().merge({
		scripts: {
			'test:jest': 'jest',
			'test:watch': 'jest --watch',
			'test:coverage': 'jest --coverage',
		},
	});

	const needsMigration = oldPackages.some(name => pkg.get(`devDependencies.${name}`));
	const hasBabel = pkg.get(`devDependencies.babel-core`);

	// Babel
	if (hasBabel) {
		packages.push('babel-jest');
		pkg.merge({
			jest: {
				testPathIgnorePatterns: ['<rootDir>/lib/'],
			},
		});
	}

	// Clean up old scripts
	pkg.removeScript(/^mocha|ava|test:mocha|test:ava$/).removeScript('test', /mocha|ava/);

	// package.json: test command
	pkg.appendScript('test', 'npm run test:jest');

	pkg.save();

	// .gitignore
	lines('.gitignore').add('coverage/').save();

	// .npmignore
	lines('.npmignore').add('__tests__/').save();

	// ESLint
	if (pkg.get(`devDependencies.eslint`)) {
		const eslintignore = lines('.eslintignore').add('coverage/*');
		if (hasBabel) {
			eslintignore.add('lib/*');
		}
		eslintignore.save();
	}

	// Test template for small projects
	if (fs.existsSync('index.js') && !fs.existsSync('test')) {
		copyFiles(__dirname, 'test.js');
	}

	// Dependencies
	uninstall(oldPackages);
	install(packages);

	// Suggest jest-codemods if projects used other test frameworks
	if (needsMigration) {
		console.log(`\nMigrate your tests to Jest:

  npm i -g jest-codemods@latest
  jest-codemods

More info:
https://github.com/skovhus/jest-codemods
`);
	}
};
module.exports.description = 'Adds Jest';
