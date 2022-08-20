const { packageJson, install } = require('mrm-core');

module.exports = () => {
	// package.json
	packageJson()
		.appendScript('start', 'tsx ./src/index.ts')
		.save();

	// Dependencies
	install(['tsx']);
};

module.exports.description = 'Adds TSX for running TypeScript files.';
