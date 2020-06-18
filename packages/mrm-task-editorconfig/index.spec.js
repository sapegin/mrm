jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add EditorConfig', async () => {
	vol.fromJSON();

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add a single section when indent=2', async () => {
	vol.fromJSON();

	task(await getTaskOptions(task, false, { indent: 2 }));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should update JSON section', async () => {
	vol.fromJSON({
		'/.editorconfig': `[*.{json,yml}]
indent_style = tab`,
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});
