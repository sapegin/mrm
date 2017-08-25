// @ts-check
'use strict';

const { json, packageJson, install } = require('mrm-core');

function task(config) {
	config.default({
		stylelintExtensions: '.css',
		stylelintPreset: 'stylelint-config-standard',
	});
	const { indent } = config.values();
	const ext = config.values().stylelintExtensions;
	const preset = config.values().stylelintPreset;

	const packages = ['stylelint', preset];

	// .stylelintrc
	const stylelintrc = json('.stylelintrc');
	if (stylelintrc.get('extends') !== preset) {
		stylelintrc
			.merge({
				extends: preset,
				rules: {
					indentation: indent,
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
}

task.description = 'Adds Stylelint';
module.exports = task;
