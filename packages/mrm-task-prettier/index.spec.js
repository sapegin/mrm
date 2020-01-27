jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));
jest.mock('mrm-core/src/npm', () => ({
	install: jest.fn(),
}));

const { install } = require('mrm-core');
const { getConfigGetter } = require('mrm');
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

it('should add Prettier', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith(['prettier']);
});

it('should use a custom indent', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ indent: 'tab' }));

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should use a custom options', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(getConfigGetter({ prettierOptions: { printWidth: 333 } }));

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should use custom overrides', () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		getConfigGetter({
			prettierOverrides: [
				{
					files: '*.css',
					options: {
						printWidth: 42,
					},
				},
			],
		})
	);

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should infer options from EditorConfig', () => {
	vol.fromJSON({
		'/.editorconfig': '[*]\nindent_style = space\nindent_size = 2',
		'/package.json': packageJson,
	});

	task(getConfigGetter());

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should keep a custom pattern defined in a package.json script', () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				format: "prettier --write '**/*.{xxx,yyy}'",
				test: 'jest',
			},
		}),
	});

	task(getConfigGetter({}));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});
