const { json, packageJson, install } = require('mrm-core');

function task(config) {
	config.defaults({
		stylelintExtensions: '.css',
		stylelintPreset: 'stylelint-config-standard',
	});
	const {
		stylelintRules,
		stylelintPreset,
		stylelintExtensions,
	} = config.values();

	const packages = ['stylelint'];

	if (stylelintPreset) {
		packages.push(stylelintPreset);
	}

	// .stylelintrc
	const stylelintrc = json('.stylelintrc');

	if (stylelintPreset) {
		stylelintrc.merge({
			extends: stylelintPreset,
		});
	}

	if (stylelintRules) {
		stylelintrc.merge({
			rules: stylelintRules,
		});
	}

	stylelintrc.save();

	// package.json
	const pkg = packageJson();

	pkg
		// Add lint script
		.setScript('lint:css', `stylelint '**/*${stylelintExtensions}'`)
		// Add pretest script
		.prependScript('pretest', 'npm run lint:css')
		.save();

	// Dependencies
	install(packages);
}

task.description = 'Adds Stylelint';
module.exports = task;
