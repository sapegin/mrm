jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getConfigGetter } = require('mrm');
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

it('should add Travis CI', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ github: 'gh' }));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add latest Node version if engines field is not defined', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				test: 'jest',
			},
		}),
	});

	task(getConfigGetter({ github: 'gh' }));

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
});

it('should add latest Node version if engines field is not defined', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ github: 'gh', maxNode: 7 }));

	expect(vol.toJSON()['/.travis.yml']).toMatchSnapshot();
});

it('should add a badge to the Readme', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/Readme.md': '# Unicorn',
	});

	task(getConfigGetter({ github: 'gh' }));

	expect(vol.toJSON()['/Readme.md']).toMatchSnapshot();
});
