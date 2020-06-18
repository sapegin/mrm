jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getConfigGetter } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

const config = getConfigGetter({ github: 'gh' });

const travisYml = `language: node_js
node_js:
  - 8
`;
const packageJson = stringify({
	name: 'unicorn',
	scripts: {
		'test:coverage': 'jest --coverage',
	},
});
const readmeMd = '# Unicorn';

afterEach(() => vol.reset());

it('should add CodeCov', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
		'/Readme.md': readmeMd,
	});

	task(config);

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should throw when .travis.yml not found', () => {
	vol.fromJSON({
		'/package.json': packageJson,
		'/Readme.md': readmeMd,
	});

	const fn = () => task(config);

	expect(fn).toThrowError('Run travis task');
});

it('should throw when coverage script not found', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': stringify({
			name: 'unicorn',
		}),
		'/Readme.md': readmeMd,
	});

	const fn = () => task(config);

	expect(fn).toThrowError('npm script not found');
});

it('should not throw when readme file not found', () => {
	vol.fromJSON({
		'/.travis.yml': travisYml,
		'/package.json': packageJson,
	});

	const fn = () => task(config);

	expect(fn).not.toThrowError();
});
