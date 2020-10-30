const { range } = require('lodash');
const got = require('got');
const packageRepoUrl = require('package-repo-url');
const semverUtils = require('semver-utils');
const { yaml, packageJson, markdown } = require('mrm-core');

const NODE_DIST_URL = 'https://nodejs.org/dist/index.json';

async function getNodeVersionsRange(pkg) {
	// Fetch current LTS version
	const allNodeVersions = await got(NODE_DIST_URL).json();
	const ltsVersionRaw = allNodeVersions.find(v => v.lts);
	const ltsVersion = semverUtils.parseRange(ltsVersionRaw.version)[0].major;

	// Minimum supported version
	const minNodeVersionRaw = pkg.get('engines.node');
	const minNodeVersion = minNodeVersionRaw
		? semverUtils.parseRange(minNodeVersionRaw)[0].major
		: ltsVersion;

	// Range of LTS versions from min to current LTS
	return range(Number(minNodeVersion), Number(ltsVersion) + 1).filter(
		v => v % 2 === 0
	);
}

module.exports = async function task({ workflowFile, readmeFile }) {
	const nodeVersions = await getNodeVersionsRange(packageJson());

	// Workflow file
	yaml(workflowFile)
		.set({
			name: 'Node.js CI',
			on: {
				push: { branches: ['master'] },
				pull_request: { branches: ['master'] },
			},
			jobs: {
				build: {
					'runs-on': 'ubuntu-latest',
					strategy: {
						matrix: {
							'node-version': nodeVersions.map(v => `${v}.x`),
						},
					},
					steps: [
						{
							uses: 'actions/checkout@v2',
						},
						{
							name: 'Use Node.js ${{ matrix.node-version }}',
							uses: 'actions/setup-node@v1',
							with: {
								'node-version': '${{ matrix.node-version }}',
							},
						},
						{
							run: 'npm ci',
						},
						{
							run: 'npm run build --if-present',
						},
						{
							run: 'npm test',
						},
					],
				},
			},
		})
		.save();

	// Add status badge to Readme
	const readme = markdown(readmeFile);
	if (readme.exists()) {
		const github = packageRepoUrl();
		readme
			.addBadge(
				`${github}/workflows/Node.js%20CI/badge.svg`,
				`${github}/actions`,
				'Node.js CI status'
			)
			.save();
	}
};

module.exports.description =
	'Adds GitHub Actions workflow to run Node.js tests';
module.exports.parameters = {
	workflowFile: {
		type: 'input',
		message: 'Enter location of GitHub Actions workflow file',
		default: '.github/workflows/node.js.yml',
	},
	readmeFile: {
		type: 'input',
		message: 'Enter filename for the readme',
		default: 'Readme.md',
	},
};
