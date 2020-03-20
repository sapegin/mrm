// @ts-check
const { spawnSync } = require('child_process');
const isWindows = require('./isWindows');
const escapeArguments = require('./escapeArguments');

/**
 * Execute a given command while being compatible with Windows.
 *
 * @param {Function} exec
 * @param {string} command
 * @param  {...any} args
 */
function execCommand(exec, command, ...args) {
	exec = exec || spawnSync;
	command = isWindows() ? `${command}.cmd` : command;
	args[0] = escapeArguments(args[0]);

	return exec(command, ...args);
}

module.exports = execCommand;
