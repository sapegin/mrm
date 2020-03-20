// @ts-check
const _ = require('lodash');
const minimist = require('minimist');

const unquote = (/** @type {string} */ s) => _.trim(s, `'"`);
const unbracket = (/** @type {string} */ s) => _.trim(s, `{}`);
const undot = (/** @type {string} */ s) => s.replace(/\./g, '');

/**
 *
 * @param {string[]} args
 * @param {string} [arg]
 * @returns {string}
 */
function getExtsFromArgs(args, arg) {
	if (arg) {
		const parsedArgs = minimist(args);
		return undot(unquote(parsedArgs[arg]));
	} else {
		// If no argument is specified, assume that the pattern is the last section
		const pattern = unquote(args.pop());
		return unbracket(pattern.split('.').pop());
	}
}

/**
 *
 * @param {string} command
 * @param {string} [arg]
 * @returns {string[]|undefined}
 */
function getExtsFromCommand(command, arg) {
	if (!command) {
		return undefined;
	}

	const args = command.split(' ');
	const exts = getExtsFromArgs(args, arg);
	return exts ? exts.split(',') : undefined;
}

module.exports = {
	getExtsFromCommand,
};
