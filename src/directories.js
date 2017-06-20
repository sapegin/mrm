// @ts-check
'use strict';

const path = require('path');
const userHome = require('user-home');

module.exports = [
	path.resolve(userHome, 'dotfiles/mrm'),
	path.resolve(userHome, '.mrm'),
	path.resolve(__dirname, '../src/tasks'),
];
