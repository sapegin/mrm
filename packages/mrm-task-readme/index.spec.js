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

it('should add a readme', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/Readme.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Readme.md'))
			.toString(),
		[`${__dirname}/templates/Contributing.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Contributing.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
			repository: 'gandalf/unicorn',
		}),
	});

	task(
		await getTaskOptions(task, false, {
			name: 'Gandalf',
			url: 'https://middleearth.com',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});

it('should add a readme with custom file name', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/Readme.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Readme.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
			repository: 'gandalf/unicorn',
		}),
	});

	task(
		await getTaskOptions(task, false, {
			name: 'Gandalf',
			url: 'https://middleearth.com',
			license: 'MIT',
			licenseFile: "${('license-' + license).toUpperCase()}.md",
		})
	);

	expect(vol.toJSON()['/Readme.md']).toMatch(
		'[LICENSE-MIT.md](LICENSE-MIT.md)'
	);
});
