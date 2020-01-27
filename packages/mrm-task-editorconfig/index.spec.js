jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const { getConfigGetter } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

afterEach(() => vol.reset());

it('should add EditorConfig', () => {
	vol.fromJSON();

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add a single section when indent=2', () => {
	vol.fromJSON();

	task(getConfigGetter({ indent: 2 }));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should update JSON section', () => {
	vol.fromJSON({
		'/.editorconfig': `[*.{json,yml}]
indent_style = tab`,
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
});
