jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

const packageJson = stringify({
	name: 'unicorn',
	scripts: {
		'test:coverage': 'jest --coverage',
	},
});
const readmeMd = '# Unicorn';

afterEach(() => vol.reset());

it('should add CodeCov', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/Readme.md': readmeMd,
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should throw when coverage script not found', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
		}),
		'/Readme.md': readmeMd,
	});

	const options = await getTaskOptions(task);
	const fn = () => task(options);

	expect(fn).toThrowError('npm script not found');
});

it('should not throw when readme file not found', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	const options = await getTaskOptions(task);
	const fn = () => task(options);

	expect(fn).not.toThrowError();
});
