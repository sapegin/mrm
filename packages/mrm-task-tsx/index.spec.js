jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	install: jest.fn(),
}));

const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

const packageJson = stringify({
	name: 'tacos',
	scripts: {
		test: 'jest',
	},
});

afterEach(() => vol.reset());

it('should add tsx and the start script', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task({});

	expect(vol.toJSON()).toMatchSnapshot();
});
