// @ts-check
const os = require('os');

/**
 * Rerturn true when we are in a win32 environement
 */
function isWindows() {
	return os.platform() === 'win32';
}

module.exports = isWindows;
