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
		'/package.json': packageJson,
		'/Readme.md': readmeMd,
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should remove custom config from package.json', async () => {
	vol.fromJSON({
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

it('should remove semantic-release runner from Travis CI config', async () => {
	vol.fromJSON({
		'/.travis.yml': `language: node_js
node_js:
  - 8
after_success:
  - bash <(curl -s https://codecov.io/bash)
  - npm run semantic-release
  - npx semantic-release
`,
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
	expect(uninstall).toBeCalledWith(['semantic-release', 'travis-deploy-once']);
});
