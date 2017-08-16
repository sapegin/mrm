'use strict';

const { json, packageJson, install } = require('mrm-core');

module.exports = function(config) {
	const ext = config('stylelintExtensions', '.css');
	const preset = config('stylelintPreset', 'stylelint-config-standard');
	const packages = ['stylelint', preset];

	// .stylelintrc
	const stylelintrc = json('.stylelintrc');
	if (stylelintrc.get('extends') !== preset) {
		stylelintrc
			.merge({
				extends: preset,
				rules: {
					indentation: config('indent', 'tab'),
					'selector-pseudo-class-no-unknown': [
						true,
						{
							ignorePseudoClasses: [
								// CSS Modules
								'global',
							],
						},
					],
				},
			})
			.save();
	}

	// package.json
	const pkg = packageJson();

	pkg
		// Add lint script
		.setScript('lint:css', `stylelint '**/*${ext}'`)
		// Add pretest script
		.prependScript('pretest', 'npm run lint:css')
		.save();

	// Dependencies
	install(packages);
};
module.exports.description = 'Adds Stylelint';
