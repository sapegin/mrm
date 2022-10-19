const fs = require('fs');
const path = require('path');
const { camelCase } = require('lodash');
const {
	lines,
	packageJson,
	template,
	install,
	uninstall,
} = require('mrm-core');

function task() {
	const packages = ['jest'];
	const oldPackages = ['mocha', 'chai', 'ava'];

	// package.json
	const pkg = packageJson().merge({
		scripts: {
			'test:jest': 'jest',
			'test:watch': 'jest --watch',
			'test:coverage': 'jest --coverage',
		},
	});

	const needsMigration = oldPackages.some((name) =>
		pkg.get(`devDependencies.${name}`)
	);
	const hasBabel = pkg.get('devDependencies.babel-core');
	const hasTypeScript = pkg.get('devDependencies.typescript');
	const hasReact = pkg.get('dependencies.react');

	// Babel
	if (hasBabel) {
		packages.push('babel-jest');
		pkg.merge({
			jest: {
				testPathIgnorePatterns: ['/node_modules/', '<rootDir>/lib/'],
			},
		});
	}

	// TypeScript
	if (hasTypeScript) {
		packages.push('ts-jest', '@types/jest');
		pkg.merge({
			jest: {
				testPathIgnorePatterns: ['/node_modules/', '<rootDir>/lib/'],
				transform: {
					'^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
				},
				testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
				moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
			},
		});
	}

	// React
	if (hasReact) {
		packages.push(
			'react-test-renderer',
			'enzyme',
			'enzyme-adapter-react-16',
			'enzyme-to-json'
		);

		pkg.merge({
			jest: {
				snapshotSerializers: ['enzyme-to-json/serializer'],
			},
		});

		const templateFile = path.join(__dirname, 'templates/jestsetup.js');
		const jestSetupFile = './test/jestsetup.js';
		if (!fs.existsSync(jestSetupFile)) {
			pkg.merge({
				jest: {
					setupFiles: [jestSetupFile],
				},
			});
			template(jestSetupFile, templateFile).apply().save();
		} else {
			const contents = fs.readFileSync(jestSetupFile, 'utf8');
			if (!contents.includes('enzyme-adapter-react-')) {
				console.log(`\nCannot setup Enzyme. Add these lines to your Jest setup file:

${fs.readFileSync(templateFile, 'utf8')}

More info:
http://blog.sapegin.me/all/react-jest
`);
			}
		}
	}

	// Clean up old scripts
	pkg
		.removeScript(/^mocha|mocha:.*?|ava|ava:.*?|test:mocha|test:ava$/)
		.removeScript('test', /mocha|ava/);

	// package.json: test command
	pkg.appendScript('test', 'npm run test:jest --');

	pkg.save();

	// .gitignore
	lines('.gitignore').add('coverage/').save();

	// .npmignore
	if (!pkg.get('private')) {
		lines('.npmignore').add('__tests__/').save();
	}

	// ESLint
	if (pkg.get(`devDependencies.eslint`)) {
		const eslintignore = lines('.eslintignore').add('coverage/*');
		if (hasBabel) {
			eslintignore.add('lib/*');
		}
		eslintignore.save();
	}

	// Test template for small projects
	if (fs.existsSync('index.js') && !fs.existsSync('test.js')) {
		template('test.js', path.join(__dirname, 'templates/test.js'))
			.apply({
				func: camelCase(pkg.get('name')),
			})
			.save();
	}

	// Dependencies
	uninstall(oldPackages);
	install(packages);

	// Suggest jest-codemods if projects used other test frameworks
	if (needsMigration) {
		console.log(`\nMigrate your tests to Jest:

  npx jest-codemods --force [--dry]

More info:
https://github.com/skovhus/jest-codemods
`);
	}
}

task.description = 'Adds Jest';
module.exports = task;
