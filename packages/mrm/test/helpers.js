const path = require('path');
const mockEnquirer = jest.fn();

const configurePrompts = (answers = {}) => {
	mockEnquirer.mockImplementationOnce(enquirer => {
		enquirer.on('prompt', prompt => {
			if (answers[prompt.name]) {
				prompt.value = answers[prompt.name];
			}
			prompt.on('run', () => prompt.submit());
		});
	});
};

jest.mock('enquirer', () => {
	const BaseEnquirer = jest.requireActual('enquirer');

	return class Enquirer extends BaseEnquirer {
		constructor(options = {}, answers = {}) {
			super({ ...options, show: false }, answers);
			mockEnquirer(this);
		}
	};
});

/**
 * Get a task but mock it's behavior; keep meta information.
 *
 * @param {String} task
 */
const getMockedTask = task => {
	const moduleName =
		task.indexOf('.') === 0
			? path.resolve(path.dirname(module.parent.filename), task)
			: task;

	const actual = require(moduleName);
	const mock = jest.fn();

	for (const meta in actual) {
		mock[meta] = actual[meta];
	}

	jest.doMock(moduleName, () => mock);

	return mock;
};

module.exports = { getMockedTask, configurePrompts };
