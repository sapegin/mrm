jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	install: jest.fn(),
	uninstall: jest.fn(),
}));

const fs = jest.requireActual('fs');
const path = require('path');
const { install, uninstall } = require('mrm-core');
const vol = require('memfs').vol;
const task = require('./index');

const console$log = console.log;

const stringify = o => JSON.stringify(o, null, '  ');

const packageJson = stringify({
	name: 'unicorn',
});

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	vol.reset();
	install.mockClear();
	uninstall.mockClear();
	console.log = console$log;
});

it('should add Jest', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task({});

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['jest']);
});

it('should add Babel specific configuration if projects depends on Babel', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				'babel-core': '*',
			},
		}),
	});

	task({});

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['jest', 'babel-jest']);
});

it('should add TypeScript specific configuration if projects depends on TypeScript', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				typescript: '*',
			},
		}),
	});

	task({});

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['jest', 'ts-jest', '@types/jest']);
});

it('should add React specific configuration if projects depends on React', () => {
	vol.fromJSON({
		[`${__dirname}/templates/jestsetup.js`]: fs
			.readFileSync(path.join(__dirname, 'templates/jestsetup.js'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
			dependencies: {
				react: '*',
			},
		}),
	});
	task({});

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
	expect(vol.toJSON()['/test/jestsetup.js']).toMatchSnapshot();
	expect(install).toBeCalledWith(expect.arrayContaining(['jest', 'enzyme']));
});

it('should not overwrite Jest setup file', () => {
	vol.fromJSON({
		[`${__dirname}/templates/jestsetup.js`]: fs
			.readFileSync(path.join(__dirname, 'templates/jestsetup.js'))
			.toString(),
		'/test/jestsetup.js': 'pizza',
		'/package.json': stringify({
			name: 'unicorn',
			dependencies: {
				react: '*',
			},
		}),
	});

	task({});

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
	expect(vol.toJSON()['/test/jestsetup.js']).toBe('pizza');
});

it('should update or create .eslintignore if projects depends on ESLint', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				eslint: '*',
				'babel-core': '*',
			},
		}),
	});

	task({});

	expect(vol.toJSON()['/.eslintignore']).toMatchSnapshot();
});

it('should add a basic test case when index.js file is present', () => {
	vol.fromJSON({
		[`${__dirname}/templates/test.js`]: fs
			.readFileSync(path.join(__dirname, 'templates/test.js'))
			.toString(),
		'/package.json': stringify({
			name: 'uber-unicorn',
		}),
		'/index.js': '',
	});

	task({});

	expect(vol.toJSON()['/test.js']).toMatchSnapshot();
});

it('should not update .npmignore for private packages', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			private: true,
		}),
	});

	task({});

	expect(vol.toJSON()['/.npmignore']).toBeUndefined();
});

it('should not overwrite test.js', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/index.js': '',
		'/test.js': 'still here',
	});

	task({});

	expect(vol.toJSON()['/test.js']).toMatchSnapshot();
});

it('should uninstall other test frameworks', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			devDependencies: {
				mocha: '*',
			},
		}),
	});

	task({});

	expect(uninstall).toBeCalledWith(['mocha', 'chai', 'ava']);
	expect(console.log).toBeCalledWith(
		expect.stringMatching('Migrate your tests to Jest')
	);
});
