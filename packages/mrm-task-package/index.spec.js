jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const path = require('path');
const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const options = {
	name: 'Gendalf',
	url: 'https://middleearth.com',
	github: 'gendalf',
};

afterEach(() => {
	vol.reset();
	process.chdir('/');
});

it('should throw when bad `name`', () => {
	expect(
		getTaskOptions(task, false, {
			name: '',
		})
	).rejects.toThrow('Missing required config options: name.');
});

it('should throw when bad `github`', () => {
	expect(
		getTaskOptions(task, false, {
			github: '',
		})
	).rejects.toThrow('Missing required config options: github.');
});

it('should add package.json', async () => {
	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(await getTaskOptions(task, false, options));

	expect(vol.toJSON()[path.join(__dirname, 'package.json')]).toMatchSnapshot();
});

it('should add package-lock.json if packageManager is npm', async () => {
	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				packageManager: 'npm',
			})
		)
	);

	expect(vol.toJSON()[path.join(__dirname, 'package-lock.json')]).toBeDefined();
});

it('should not add package-lock.json if npmrc has false for package-lock.json', async () => {
	vol.fromJSON({
		[`${__dirname}/.npmrc`]: 'package-lock=false',
	});

	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				packageManager: 'npm',
			})
		)
	);

	expect(
		vol.toJSON()[path.join(__dirname, 'package-lock.json')]
	).not.toBeDefined();
});

it('should add package-lock.json if npmrc has true for package-lock.json', async () => {
	vol.fromJSON({
		[`${__dirname}/.npmrc`]: 'package-lock=true',
	});

	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				packageManager: 'npm',
			})
		)
	);

	expect(vol.toJSON()[path.join(__dirname, 'package-lock.json')]).toBeDefined();
});

it('should add yarn.lock if packageManager is Yarn', async () => {
	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				packageManager: 'Yarn',
			})
		)
	);

	expect(vol.toJSON()[path.join(__dirname, 'yarn.lock')]).toBeDefined();
});

it('should add .yarnrc.yml if packageManager is Yarn Berry', async () => {
	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				packageManager: 'Yarn Berry',
			})
		)
	);

	expect(vol.toJSON()[path.join(__dirname, '.yarnrc.yml')]).toBeDefined();
});

it('should add pnpm-lock.yaml if packageManager is pnpm', async () => {
	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				packageManager: 'pnpm',
			})
		)
	);

	expect(vol.toJSON()[path.join(__dirname, 'pnpm-lock.yaml')]).toBeDefined();
});

it('should set custom Node.js version', async () => {
	vol.fromJSON({
		[`${__dirname}/package-lock.json`]: '',
	});
	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				minNode: '9.1',
			})
		)
	);
	expect(vol.toJSON()['/package.json']).toMatchSnapshot();

	// Ok with already-existing
	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				minNode: '9.1',
			})
		)
	);
	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should set custom license', async () => {
	vol.fromJSON({
		[`${__dirname}/package-lock.json`]: '',
	});
	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				license: 'BSD',
			})
		)
	);
	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});
