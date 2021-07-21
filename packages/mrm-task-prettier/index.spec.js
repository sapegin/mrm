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

it('should add Prettier', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ prettier: '>=2' });
});

it('should add Prettier with `lint:css`', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				'lint:css': 'stylelint "**/*.{css,scss,sass}"',
				test: 'jest',
			},
		}),
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ prettier: '>=2' });
});

it('should add Prettier with `typescript` in `devDependencies`', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				test: 'jest',
			},
			devDependencies: {
				typescript: 'latest',
			},
		}),
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ prettier: '>=2' });
});

it('should use a custom indent', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task, false, { indent: 'tab' }));

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should use a custom options', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, { prettierOptions: { printWidth: 333 } })
	);

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should use a custom pattern', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, { prettierPattern: '**/*.{xxx,yyy}' })
	);

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should use custom overrides', async () => {
	vol.fromJSON({
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
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

it('should replace existing overrides for the same pattern', async () => {
	vol.fromJSON({
		'/.prettierrc': stringify({
			overrides: [
				{
					files: '*.js',
					options: {
						useTabs: false,
					},
				},
				{
					files: '*.md',
					options: {
						useTabs: false,
						printWidth: 30,
					},
				},
			],
		}),
		'/package.json': packageJson,
	});

	task(
		await getTaskOptions(task, false, {
			prettierOverrides: [
				{
					files: '*.md',
					options: {
						printWidth: 42,
					},
				},
			],
		})
	);

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should infer options from EditorConfig', async () => {
	vol.fromJSON({
		'/.editorconfig': '[*]\nindent_style = space\nindent_size = 2',
		'/package.json': packageJson,
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()['/.prettierrc']).toMatchSnapshot();
});

it('should extend a custom pattern defined in a package.json script', async () => {
	vol.fromJSON({
		'/package.json': stringify({
			name: 'unicorn',
			scripts: {
				format: "prettier --write '**/*.{xxx,yyy}'",
				test: 'jest',
			},
		}),
	});

	task(await getTaskOptions(task));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});
