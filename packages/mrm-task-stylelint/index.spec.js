jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	install: jest.fn(),
}));

const { install } = require('mrm-core');
const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const stringify = o => JSON.stringify(o, null, '  ');

const packageJson = stringify({
	name: 'unicorn',
	scripts: {
		test: 'jest',
	},
});

afterEach(() => {
	vol.reset();
	install.mockClear();
});

it('should add stylelint', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, {}));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['stylelint', 'stylelint-config-standard']);
});

it('should install a custom preset', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			stylelintPreset: 'stylelint-config-pizza',
		})
	);

	expect(vol.toJSON()['/.stylelintrc']).toMatchSnapshot();
	expect(install).toBeCalledWith(['stylelint', 'stylelint-config-pizza']);
});

it('should add custom rules', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			stylelintPreset: '',
			stylelintRules: { 'max-empty-lines': 2 },
		})
	);

	expect(vol.toJSON()['/.stylelintrc']).toMatchSnapshot();
});

it('should use custom extension', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, { stylelintExtensions: '.sass' }));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});
