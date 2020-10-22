const npx = require('libnpx');
const path = require('path');

async function requirex_(packageName) {
	const NPM_PATH = path.join(
		__dirname,
		'..',
		'node_modules',
		'npm',
		'bin',
		'npm-cli.js'
	);
	const results = await npx._ensurePackages(packageName, { npm: NPM_PATH });
	const packagePath = path.join(
		results.prefix,
		'lib',
		'node_modules',
		packageName
	);
	return packagePath;
}

async function requirex(packageName) {
	const packagePath = await requirex_(packageName);
	return require(packagePath);
}

requirex.resolve = async function(packageName) {
	const packagePath = await requirex_(packageName);
	return require.resolve(packagePath);
};

module.exports = requirex;
