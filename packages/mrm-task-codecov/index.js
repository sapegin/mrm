const packageRepoUrl = require('package-repo-url');
const gitDefaultBranch = require('git-default-branch');
const { MrmError, yaml, markdown, packageJson } = require('mrm-core');

const coverageScript = 'test:coverage';

module.exports = function task({ workflowFile, readmeFile }) {
	const pkg = packageJson();

	// Require coverage npm script
	if (!pkg.getScript(coverageScript)) {
		throw new MrmError(
			`${coverageScript} npm script not found. To add Jest run:

  mrm jest`
		);
	}

	const defaultBranch = gitDefaultBranch();

	// Workflow file
	yaml(workflowFile)
		.set({
			name: 'Codecov',
			on: {
				push: { branches: [defaultBranch] },
				pull_request: { branches: [defaultBranch] },
			},
			jobs: {
				build: {
					'runs-on': 'ubuntu-latest',
					steps: [
						{
							uses: 'actions/checkout@v2',
						},
						{
							uses: 'actions/setup-node@v1',
						},
						{
							run: 'npm ci',
						},
						{
							run: `npm run ${coverageScript}`,
						},
						{
							uses: 'codecov/codecov-action@v1',
						},
					],
				},
			},
		})
		.save();

	// Add Codecov badge to Readme
	const github = packageRepoUrl().replace('https://github.com/', '');
	const url = `https://codecov.io/gh/${github}`;
	const readme = markdown(readmeFile);
	if (readme.exists()) {
		readme.addBadge(`${url}/graph/badge.svg`, url, 'Codecov').save();
	}
};

module.exports.description = 'Adds Codecov';
module.exports.parameters = {
	workflowFile: {
		type: 'input',
		message: 'Enter location of GitHub Actions workflow file',
		default: '.github/workflows/coverage.yml',
	},
	readmeFile: {
		type: 'input',
		message: 'Enter filename for the readme',
		default: 'Readme.md',
	},
};
