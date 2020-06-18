jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add .gitignore', async () => {
	vol.fromJSON();

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add package-lock.json, if yarn.lock exists', async () => {
	vol.fromJSON({
		'/yarn.lock': '',
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add yarn.lock, if package-lock.json exists', async () => {
	vol.fromJSON({
		'/package-lock.json': '',
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
});
