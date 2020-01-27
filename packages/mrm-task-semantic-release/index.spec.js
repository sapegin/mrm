jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	uninstall: jest.fn(),
}));

const { uninstall } = require('mrm-core');
const { getConfigGetter } = require('mrm');
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

it('should add semantic-release', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
		'/Readme.md': readmeMd,
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add custom config to package.json', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		getConfigGetter({
			semanticConfig: { pizza: 42 },
		})
	);

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should remove custom config from package.json', () => {
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

	task(getConfigGetter({}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should add custom arguments to semantic-release command', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		getConfigGetter({
			semanticArgs: '--arg val',
		})
	);

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
});

it('should install extra dependencies on CI', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		getConfigGetter({
			semanticPeerDependencies: ['pizza'],
		})
	);

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
});

it('should crate semantic-release config and install extra dependencies when a preset is defined', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	task(
		getConfigGetter({
			semanticPreset: 'pizza',
		})
	);

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
	expect(vol.toJSON()['/.releaserc.json']).toMatchSnapshot();
});

it('should remove the official semantic-release runner', () => {
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

	task(getConfigGetter({}));

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
	expect(uninstall).toBeCalledWith(['semantic-release', 'travis-deploy-once']);
});

it('should throw when .travis.yml not found', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	const fn = () => task(getConfigGetter({}));

	expect(fn).toThrowError('Run travis task');
});
