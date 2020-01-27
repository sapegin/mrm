jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getConfigGetter } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add .gitignore', () => {
	vol.fromJSON();

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add package-lock.json, if yarn.lock exists', () => {
	vol.fromJSON({
		'/yarn.lock': '',
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add yarn.lock, if package-lock.json exists', () => {
	vol.fromJSON({
		'/package-lock.json': '',
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});
