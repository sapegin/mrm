// @ts-check
const isWindows = require('./isWindows');

/**
 * Escape the circumflex character when we are on Windows
 * since Batch will interpret it.
 *
 * @param {string[]} strings
 */
function escapeArguments(strings) {
	return isWindows() ? strings.map(arg => arg.replace(/\^/g, '^^^^')) : strings;
}

module.exports = escapeArguments;
