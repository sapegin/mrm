jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	uninstall: jest.fn(),
}));

const { uninstall } = require('mrm-core');
const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const console$log = console.log;

const stringify = o => JSON.stringify(o, null, '  ');

const travisYml = `language: node_js
node_js:
  - 8
`;
const packageJson = stringify({
	name: 'unicorn',
	scripts: {
		'semantic-release': 'semantic-release',
	},
});
const readmeMd = '# Unicorn';

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	vol.reset();
	uninstall.mockClear();
	console.log = console$log;
});

it('should add semantic-release', async () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
		'/Readme.md': readmeMd,
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add custom config to package.json', async () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			semanticConfig: { pizza: 42 },
		})
	);

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should remove custom config from package.json', async () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				'semantic-release': 'semantic-release',
			},
			release: {
				analyzeCommits: 'semantic-release-tamia/analyzeCommits',
			},
		}),
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should add custom arguments to semantic-release command', async () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			semanticArgs: '--arg val',
		})
	);

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
});

it('should install extra dependencies on CI', async () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			semanticPeerDependencies: ['pizza'],
		})
	);

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
});

it('should crate semantic-release config and install extra dependencies when a preset is defined', async () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			semanticPreset: 'pizza',
		})
	);

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
	expect(vol.toJSON()['/.releaserc.json']).toMatchSnapshot();
});

it('should remove the official semantic-release runner', async () => {
	vol.fromJSON({
		'/.travis.yml': `language: node_js
node_js:
  - 8
after_success:
  - bash <(curl -s https://codecov.io/bash)
  - npm run semantic-release
`,
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
	expect(uninstall).toBeCalledWith(['semantic-release', 'travis-deploy-once']);
});

it('should throw when .travis.yml not found', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	const options = await getTaskOptions(task, false, {});

	const fn = () => task(options);

	expect(fn).toThrowError('Run travis task');
});
