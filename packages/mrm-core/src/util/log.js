/* eslint-disable no-console */

const kleur = require('kleur');

function info(message) {
	console.log(message);
}

function added(message) {
	console.log(kleur.green(message));
}

function removed(message) {
	console.log(kleur.yellow(message));
}

module.exports = {
	info,
	added,
	removed,
};
