const path = require('path');
const { packageJson, template, install } = require('mrm-core');

const configFile = 'styleguide.config.js';

function task() {
	const prodPackages = ['react', 'react-dom'];
	const packages = ['react-styleguidist'];
	let templateFile = configFile;

	const pkg = packageJson();
	const isCra = pkg.get('dependencies.react-scripts');

	// Create React App has its own webpack
	if (!isCra) {
		packages.push('webpack');
	}

	// TypeScript
	if (pkg.get('devDependencies.typescript')) {
		packages.push('react-docgen-typescript');
		templateFile = 'styleguide.config.typescript.js';
	}

	// Style guide config
	if (!isCra) {
		template(configFile, path.join(__dirname, 'templates', templateFile))
			.apply()
			.save();
	}

	// package.json
	pkg
		.appendScript('styleguide', 'styleguidist server')
		.appendScript('styleguide:build', 'styleguidist build');

	if (!pkg.getScript('start')) {
		pkg.setScript('start', 'styleguidist server');
	}

	pkg.save();

	// Dependencies
	install(prodPackages, { dev: false });
	install(packages);
}

task.description = 'Adds React Styleguidist';
module.exports = task;
