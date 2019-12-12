const os = require('os');

/**
 * Define if we are running in a win32 environement.
 */
function isWindows() {
	return os.platform() === 'win32';
}

module.exports = isWindows;
