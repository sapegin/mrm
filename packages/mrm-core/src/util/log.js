// @ts-check
/* eslint-disable no-console */

const kleur = require('kleur');

/**
 * @param {string} message
 */
function info(message) {
	console.log(message);
}

/**
 * @param {string} message
 */
function added(message) {
	console.log(kleur.green(message));
}

/**
 * @param {string} message
 */
function removed(message) {
	console.log(kleur.yellow(message));
}

module.exports = {
	info,
	added,
	removed,
};
