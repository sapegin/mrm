jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const mockPackageJson = jest.requireActual('mrm-core/src/files/packageJson');
const packageJson = require('mrm-core/src/files/packageJson');
jest.mock('mrm-core/src/files/packageJson');

const innerWrapMock = cb => {
	packageJson.mockImplementation((...args) => {
		const pkg = mockPackageJson(...args);
		const get = pkg.get.bind(pkg.get);
		pkg.get = prop => {
			return cb(prop, get);
		};
		return pkg;
	});
};

// Default
innerWrapMock((prop, get) => get(prop));

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
			name: 'Gandalf',
			url: 'https://middleearth.com',
		})
	).rejects.toThrow('Missing required config options: packageName.');
});

it('should throw when bad `url`', () => {
	expect(
		getTaskOptions(task, false, {
			name: 'Gandalf',
			url: '',
		})
	).rejects.toThrow('Missing required config options: packageName, url.');
});

it('should throw when bad `name`', () => {
	expect(
		getTaskOptions(task, false, {
			name: '',
			url: 'https://middleearth.com',
		})
	).rejects.toThrow('Missing required config options: packageName, name.');
});

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

	// Re-run task to check that existent README is ok
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

it('should add a readme with no name but author.name', async () => {
	innerWrapMock((prop, get) => {
		return prop === 'author.name' ? 'Frodo' : get(prop);
	});

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
			url: 'https://middleearth.com',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});

it('should add a readme with no name but author', async () => {
	innerWrapMock((prop, get) => {
		return prop === 'author.name'
			? ''
			: prop === 'author'
			? 'Frodo'
			: get(prop);
	});

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
			url: 'https://middleearth.com',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});

it('should add a readme with no name and no author', async () => {
	innerWrapMock((prop, get) => {
		return prop === 'author.name' || prop === 'author' ? '' : get(prop);
	});

	vol.fromJSON({
		[`${__dirname}/templates/Readme.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Readme.md'))
			.toString()
			.replace('[${name}](${url})', '[Placeholder](${url})'),
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
			license: 'MIT',
			licenseFile: "${('license-' + license).toUpperCase()}.md",
		})
	);

	expect(vol.toJSON()['/Readme.md']).toMatch(
		'[LICENSE-MIT.md](LICENSE-MIT.md)'
	);
});

it('should add a readme without contributing', async () => {
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
			includeContributing: false,
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});

it('should add a readme with custom contributing', async () => {
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
			contributingFile: 'CONTRIBUTIONS.md',
		})
	);

	expect(
		omitBy(vol.toJSON(), (v, k) => k.startsWith(__dirname))
	).toMatchSnapshot();
});
