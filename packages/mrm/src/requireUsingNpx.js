const npx = require('libnpx');
const path = require('path');

const NPM_PATH = path.join(path.dirname(process.execPath), 'npm');

async function resolveUsingNpx(packageName) {
	const opts = { npm: NPM_PATH, q: true };
	const results = await npx._ensurePackages(packageName, opts);
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
