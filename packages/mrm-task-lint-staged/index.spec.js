jest.mock('fs');
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

const console$log = console.log;

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	vol.reset();
	install.mockClear();
	console.log = console$log;
});

it('should not do anything if not supported tools are found', async () => {
	vol.fromJSON(
		{
			'/package.json': packageJson,
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(Object.keys(vol.toJSON())).toEqual(['/package.json']);
	expect(vol.toJSON()['/package.json']).toEqual(packageJson);
	expect(console.log).toBeCalledWith(
		expect.stringMatching('Cannot add lint-staged')
	);
});

it('should add Prettier if project depends on it', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					prettier: '*',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ 'lint-staged': '>=10', husky: '>=4' });
});

it('should add Prettier and ESLint', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				scripts: {},
				devDependencies: {
					eslint: '4.0.1',
					prettier: '1.9.2',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should infer Prettier extensions from an npm script', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				scripts: {
					format: "prettier --write '**/*.{js,jsx}'",
				},
				devDependencies: {
					prettier: '1.9.2',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should not do anything if project is using Prettier via ESLint plugin', async () => {
	const pkg = stringify({
		name: 'unicorn',
		devDependencies: {
			prettier: '*',
			'eslint-plugin-prettier': '*',
		},
	});
	vol.fromJSON(
		{
			'/package.json': pkg,
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(Object.keys(vol.toJSON())).toEqual(['/package.json']);
	expect(vol.toJSON()['/package.json']).toEqual(pkg);
	expect(console.log).toBeCalledWith(
		expect.stringMatching('Cannot add lint-staged')
	);
});

it('should add ESLint if project depends on it', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					eslint: '*',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ 'lint-staged': '>=10', husky: '>=4' });
});

it('should use default JS extension if eslint command has no --ext key', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				scripts: {
					lint: 'eslint --fix',
				},
				devDependencies: {
					eslint: '*',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should infer ESLint extension for an npm script', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				scripts: {
					lint: 'eslint --fix --ext .js,.jsx',
				},
				devDependencies: {
					eslint: '*',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should use custom Prettier extensions', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					prettier: '1.9.2',
				},
			}),
		},
		'/'
	);

	task(
		await getTaskOptions(task, false, {
			lintStagedRules: { prettier: { extensions: ['js', 'jsx', 'mjs'] } },
		})
	);

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should use a custom ESLint extension', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					eslint: '*',
				},
			}),
		},
		'/'
	);

	task(
		await getTaskOptions(task, false, {
			lintStagedRules: { eslint: { extensions: ['js', 'jsx'] } },
		})
	);

	expect(vol.toJSON()).toMatchSnapshot();
});

it('shouldn’t add a default rule if it’s disabled in overrides', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					eslint: '*',
					prettier: '*',
				},
			}),
		},
		'/'
	);

	task(
		await getTaskOptions(task, false, {
			lintStagedRules: { eslint: { enabled: false } },
		})
	);

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add stylelint if project depends on it', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					stylelint: '*',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ 'lint-staged': '>=10', husky: '>=4' });
});

it('should use a custom stylelint extension', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					stylelint: '*',
				},
			}),
		},
		'/'
	);

	task(
		await getTaskOptions(task, false, {
			lintStagedRules: { stylelint: { extensions: ['scss'] } },
		})
	);

	expect(vol.toJSON()).toMatchSnapshot();
});

it('should add a custom rule', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					eslint: '*',
				},
			}),
		},
		'/'
	);

	task(
		await getTaskOptions(task, false, {
			lintStagedRules: { false: { extensions: ['js'], command: 'false' } },
		})
	);

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ 'lint-staged': '>=10', husky: '>=4' });
});

it('should update an existing rule', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					eslint: '*',
				},
				'lint-staged': {
					'*.md': 'textlint --fix',
					'*.js': 'eslint --fix',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task, false));

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ 'lint-staged': '>=10', husky: '>=4' });
});

it('should merge rules with the same pattern', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				devDependencies: {
					eslint: '*',
					prettier: '*',
				},
				'lint-staged': {
					'*.md': 'textlint --fix',
					'*.js': 'eslint --fix',
				},
			}),
		},
		'/'
	);

	task(
		await getTaskOptions(task, false, {
			lintStagedRules: {
				eslint: { extensions: ['js'] },
				prettier: { extensions: ['js'] },
			},
		})
	);

	expect(vol.toJSON()).toMatchSnapshot();
	expect(install).toBeCalledWith({ 'lint-staged': '>=10', husky: '>=4' });
});

it('should remove husky 0.14 config from package.json', async () => {
	vol.fromJSON(
		{
			'/package.json': stringify({
				name: 'unicorn',
				scripts: {
					precommit: 'lint-staged',
				},
				devDependencies: {
					eslint: '*',
				},
			}),
		},
		'/'
	);

	task(await getTaskOptions(task));

	expect(vol.toJSON()).toMatchSnapshot();
});
