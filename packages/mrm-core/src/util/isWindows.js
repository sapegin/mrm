// @ts-check
const os = require('os');

/**
 * Return true when we are in a win32 environment
 */
function isWindows() {
	return os.platform() === 'win32';
}

module.exports = isWindows;
