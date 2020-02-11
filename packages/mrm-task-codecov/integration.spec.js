// @ts-check
/* eslint-disable no-console */

const path = require('path');
const { getMockedTask, configurePrompts } = require('mrm/test/helpers');
const { runTask } = require('mrm');

jest.mock('git-username', () => () => 'mocked-username');

const task = getMockedTask('./index');
const directories = [path.resolve(__dirname, '../')];

describe('runTask', () => {
	beforeEach(task.mockClear);

	it('should run a module', async () => {
		await runTask('mrm-task-codecov', directories, {}, {});

		// check if task was executed
		expect(task).toHaveBeenCalledTimes(1);

		// check if configuration was passed right
		const config = task.mock.calls[0][0].values();
		expect(config.readmeFile).toBe('Readme.md');
		expect(config.github).toBe('mocked-username');
	});

	it('should prompt interactive configs when mode is on', async () => {
		configurePrompts({
			readmeFile: 'README.md',
			github: 'custom-username',
		});

		await runTask('mrm-task-codecov', directories, {}, { interactive: true });

		expect(task).toHaveBeenCalledTimes(1);

		// check if configuration was passed right
		const config = task.mock.calls[0][0].values();
		expect(config.readmeFile).toBe('README.md');
		expect(config.github).toBe('custom-username');
	});
});
