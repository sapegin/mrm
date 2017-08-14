// @ts-check
'use strict';

const { json, packageJson, install } = require('mrm-core');

const packages = ['typescript'];

function task() {
	// tsconfig.json
	json('tsconfig.json')
		.merge({
			compilerOptions: {
				target: 'es6',
				module: 'commonjs',
				moduleResolution: 'node',
				strict: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				noUnusedLocals: true,
				pretty: true,
				lib: ['esnext'],
			},
		})
		.save();

	// package.json
	packageJson().appendScript('pretest', 'tsc --noEmit').save();

	// Dependencies
	install(packages);
}
task.description = 'Adds TypeScript';

module.exports = task;
