const fs = require('fs');
const gitUsername = require('git-username');
const {
	MrmError,
	packageJson,
	json,
	yaml,
	markdown,
	uninstall,
} = require('mrm-core');

function task(config) {
	const {
		github,
		readmeFile,
		semanticConfig,
		semanticArgs,
		semanticPeerDependencies,
		semanticPreset,
	} = config
		.defaults({
			github: gitUsername(),
			readmeFile: 'Readme.md',
			semanticArgs: '',
			semanticPeerDependencies: [],
			semanticPreset: null,
		})
		.values();

	// Require .travis.yml
	if (!fs.existsSync('.travis.yml')) {
		throw new MrmError(
			`Run travis task first:
  mrm travis`
		);
	}

	// package.json
	const pkg = packageJson();

	// Remove semantic-release script
	pkg.removeScript('semantic-release');
	pkg.removeScript('travis-deploy-once');

	// Add or remove custom semantic-release config
	if (semanticConfig) {
		pkg.merge({
			release: semanticConfig,
		});
	} else {
		pkg.unset('release');
	}

	// Save package.json
	pkg.save();

	const travisYml = yaml('.travis.yml');
	const afterSuccess = travisYml.get('after_success');

	// Remove the official semantic-release runner from commands list on .travis.yml
	if (Array.isArray(afterSuccess)) {
		travisYml.set(
			'after_success',
			afterSuccess.filter(cmd => cmd !== 'npm run semantic-release')
		);
	}

	// Add semantic-release runner to .travis.yml
	const dependencies = [
		...semanticPeerDependencies,
		semanticPreset ? `conventional-changelog-${semanticPreset}` : null,
	].filter(Boolean);
	const commands = [
		dependencies.length > 0
			? `npm install --no-save ${dependencies.join(' ')}`
			: null,
		`npx semantic-release ${semanticArgs}`.trim(),
	].filter(Boolean);
	travisYml
		.merge({
			after_success: commands,
			branches: {
				except: ['/^v\\d+\\.\\d+\\.\\d+$/'],
			},
		})
		.save();

	// Add semantic-release config if we’re using a preset
	if (semanticPreset) {
		json('.releaserc.json')
			.set({
				plugins: [
					[
						'@semantic-release/commit-analyzer',
						{
							preset: semanticPreset,
						},
					],
					[
						'@semantic-release/release-notes-generator',
						{
							preset: semanticPreset,
						},
					],
					'@semantic-release/npm',
					'@semantic-release/github',
				],
			})
			.save();
	}

	// Add npm package version badge to Readme.md
	const packageName = pkg.get('name');
	const readme = markdown(readmeFile);
	if (readme.exists()) {
		readme
			.addBadge(
				`https://img.shields.io/npm/v/${packageName}.svg`,
				`https://www.npmjs.com/package/${packageName}`,
				'npm'
			)
			.save();
	}

	// Remove semantic-release from project dependencies
	uninstall(['semantic-release', 'travis-deploy-once']);

	console.log(
		`Please setup semantic-release authentication on Travis CI:

1. Generate npm token:

   npm token create

   Note: Only the auth-only level of npm two-factor authentication is supported.

   More info: https://docs.npmjs.com/getting-started/working_with_tokens#how-to-create-new-tokens

2. Generate GitHub token:

   https://github.com/settings/tokens/new

   Select the “repo” scope.

   More info: https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line

3. Add environment variables to Travis CI:

   https://travis-ci.org/${github}/${packageName}/settings

   NPM_TOKEN = <Generated npm token>
   GH_TOKEN = <Generated GitHub token>

   DO NOT enable “Display value in build log”.

   More info: https://semantic-release.gitbook.io/semantic-release/usage/ci-configuration
`
	);
}

task.description = 'Adds semantic-release';
module.exports = task;
