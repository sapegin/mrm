jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const fs = jest.requireActual('fs');
const path = require('path');
const { omitBy } = require('lodash');
const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

afterEach(() => vol.reset());

it('should throw when bad `packageName`', () => {
	expect(
		getTaskOptions(task, false, {
			packageName: '',
			github: 'gendalf',
		})
	).rejects.toThrow('Missing required config options: packageName.');
});

it('should throw when bad `github`', () => {
	expect(
		getTaskOptions(task, false, {
			github: '',
		})
	).rejects.toThrow('Missing required config options: github, packageName.');
});

it('should add a Contributing.md file', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/Contributing.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Contributing.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
		}),
	});

	task(
		await getTaskOptions(task, false, {
			github: 'gendalf',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();

	// Ensure repeated access works
	vol.fromJSON({
		[`${__dirname}/templates/Contributing.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Contributing.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
		}),
	});

	task(
		await getTaskOptions(task, false, {
			github: 'gendalf',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});
