const { json, packageJson, install } = require('mrm-core');

module.exports = function task({
	stylelintRules,
	stylelintPreset,
	stylelintExtensions,
}) {
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
};

module.exports.description = 'Adds Stylelint';
module.exports.parameters = {
	stylelintExtensions: {
		type: 'input',
		message: 'Enter file extensions to lint',
		default: '.css',
	},
	stylelintPreset: {
		type: 'input',
		message: 'Enter Stylelint preset name',
		default: 'stylelint-config-standard',
	},
	stylelintRules: {
		type: 'config',
	},
};
