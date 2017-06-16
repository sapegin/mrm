'use strict';

const path = require('path');
const { template } = require('mrm-core');

module.exports = function(config) {
	template(config('license', 'License.md'), path.join(__dirname, 'License.md'))
		.apply(config(), {
			year: new Date().getFullYear(),
		})
		.save();
};
module.exports.description = 'Adds MIT license file';
