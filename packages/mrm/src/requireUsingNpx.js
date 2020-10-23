const npx = require('libnpx');
const path = require('path');

const NPM_PATH = path.join(path.dirname(process.execPath), 'npm');

async function resolveUsingNpx(packageName) {
	const results = await npx._ensurePackages(packageName, { npm: NPM_PATH });
	const packagePath = path.join(
		results.prefix,
		'lib',
		'node_modules',
		packageName
	);
	return packagePath;
}

async function requireUsingNpx(packageName) {
	const packagePath = await resolveUsingNpx(packageName);
	return require(packagePath);
}

requireUsingNpx.resolve = resolveUsingNpx;

module.exports = requireUsingNpx;
