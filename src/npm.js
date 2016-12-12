'use strict';

const yarnInstall = require('yarn-install');

/* eslint-disable no-console */

function install(deps, options = {}) {
	console.log(`Installing ${deps.join(', ')}...`);
	yarnInstall(deps, Object.assign({ dev: true }, options));
}

module.exports = {
	install,
};
