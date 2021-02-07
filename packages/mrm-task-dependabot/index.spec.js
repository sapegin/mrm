jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add a workflow file', async () => {
	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();

	// Ensure ok when file present
	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});
