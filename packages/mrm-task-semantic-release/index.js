const packageRepoUrl = require('package-repo-url');
const { packageJson, yaml, markdown, uninstall } = require('mrm-core');

module.exports = function task({ workflowFile, readmeFile }) {
	// Create workflow file (no update)
	const workflowYml = yaml(workflowFile);
	if (!workflowYml.exists()) {
		workflowYml
			.merge({
				name: 'Semantic Release',
				on: {
					push: {
						branches: ['master'],
					},
				},
				jobs: {
					release: {
						name: 'Release',
						'runs-on': 'ubuntu-latest',
						steps: [
							{
								uses: 'actions/checkout@v2',
							},
							{
								uses: 'actions/setup-node@v2',
								with: {
									'node-version': 'lts/*',
								},
							},
							{
								run: 'npm ci',
							},
							{
								env: {
									GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
									NPM_TOKEN: '${{ secrets.NPM_TOKEN }}',
								},
								run: 'npx semantic-release',
							},
						],
					},
				},
			})
			.save();
	}

	// package.json
	const pkg = packageJson();

	// Remove semantic-release script
	pkg.removeScript('semantic-release');
	pkg.removeScript('travis-deploy-once');

	// Remove custom semantic-release config
	pkg.unset('release');

	// Save package.json
	pkg.save();

	// Remove semantic-release from project dependencies
	uninstall(['semantic-release', 'travis-deploy-once']);

	// Remove semantic-release runner from commands list on .travis.yml
	const travisYml = yaml('.travis.yml');
	if (travisYml.exists()) {
		const afterSuccess = travisYml.get('after_success');
		if (Array.isArray(afterSuccess)) {
			travisYml.set(
				'after_success',
				afterSuccess.filter(cmd => !cmd.includes('semantic-release'))
			);
		}
		travisYml.save();
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

	console.log(
		`Please add secrets on GitHub:

1. Generate npm token:

   npm token create

   Note: Only the auth-only level of npm two-factor authentication is supported.

   More info: https://docs.npmjs.com/getting-started/working_with_tokens#how-to-create-new-tokens

2. Generate GitHub token:

   https://github.com/settings/tokens/new

   Select the “repo” scope.

   More info: https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line

3. Add environment variables to GitHub repository:

   ${packageRepoUrl()}/settings/secrets

   NPM_TOKEN = <Generated npm token>
   GH_TOKEN = <Generated GitHub token>

   More info: https://github.com/semantic-release/semantic-release/blob/beta/docs/recipes/github-actions.md
`
	);
};

module.exports.description = 'Adds semantic-release';
module.exports.parameters = {
	workflowFile: {
		type: 'input',
		message: 'Enter location of GitHub Actions workflow file',
		default: '.github/workflows/release.yml',
	},
	readmeFile: {
		type: 'input',
		message: 'Enter filename for readme',
		default: 'Readme.md',
	},
};
