const _ = require('lodash');
const minimist = require('minimist');

const unquote = s => _.trim(s, `'"`);
const unbracket = s => _.trim(s, `{}`);
const undot = s => s.replace(/\./g, '');

function getExtsFromCommand(command, arg) {
	if (!command) {
		return undefined;
	}

	const args = command.split(' ');

	let exts;
	if (arg) {
		const parsedArgs = minimist(args);
		exts = undot(unquote(parsedArgs[arg]));
	} else {
		// If no argument is specified, assume that the pattern is the last section
		const pattern = unquote(args.pop());
		exts = unbracket(pattern.split('.').pop());
	}

	return exts ? exts.split(',') : undefined;
}

module.exports = {
	getExtsFromCommand,
};
