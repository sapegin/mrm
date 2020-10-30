jest.mock('fs');
jest.mock('git-username');
jest.mock('got', () => () => ({
	json: () =>
		Promise.resolve([
			{ version: 'v15.0.1', date: '2020-10-21', lts: false },
			{ version: 'v14.15.0', date: '2020-10-27', lts: 'Fermium' },
			{ version: 'v10.23.0', date: '2020-10-27', lts: 'Dubnium' },
		]),
}));
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const console$log = console.log;

const stringify = o => JSON.stringify(o, null, '  ');

const packageJson = stringify({
	name: 'unicorn',
	engines: {
		node: 4,
	},
	scripts: {
		test: 'jest',
	},
});

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	vol.reset();
	console.log = console$log;
});

it('should add GitHub Action workflow', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add latest Node version if engines field is not defined', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				test: 'jest',
			},
		}),
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/.github/workflows/node.js.yml']).toMatchSnapshot();
});

it('should add a badge to the Readme', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/Readme.md': '# Unicorn',
	});

	await task(await getTaskOptions(task));

	expect(vol.toJSON()['/Readme.md']).toMatchSnapshot();
});
