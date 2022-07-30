jest.mock('fs');
jest.mock('../util/log', () => ({
	info: jest.fn(),
}));

const fs = require('fs-extra');
const vol = require('memfs').vol;
const log = require('../util/log');
const _npm = require('../npm');
const install = _npm.install;
const uninstall = _npm.uninstall;

const modules = ['eslint', 'babel-core'];
const options = {
	cwd: undefined,
	stdio: 'inherit',
};

const createPackageJson = (dependencies, devDependencies) => {
	fs.writeFileSync(
		'package.json',
		JSON.stringify({
			dependencies,
			devDependencies,
		})
	);
};

const createNodeModulesPackageJson = (name, version) => {
	fs.mkdirpSync(`/node_modules/${name}`);
	fs.writeFileSync(
		`/node_modules/${name}/package.json`,
		JSON.stringify({
			version,
		})
	);
};

afterEach(() => {
	vol.reset();
	log.info.mockClear();
});

describe('install()', () => {
	it('should install an npm packages to devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['install', '--save-dev', 'eslint@latest', 'babel-core@latest'],
			options
		);
	});

	it('should install yarn packages to devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { yarn: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			[
				'add',
				'--dev',
				'--ignore-workspace-root-check',
				'eslint@latest',
				'babel-core@latest',
			],
			options
		);
	});

	it('should install yarn@berry packages to devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { yarnBerry: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			['add', '--dev', 'eslint@latest', 'babel-core@latest'],
			options
		);
	});

	it('should install a pnpm packages to devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { pnpm: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/pnpm(\.cmd)?/),
			['add', '--save-dev', 'eslint@latest', 'babel-core@latest'],
			options
		);
	});

	it('should install an npm packages to dependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { dev: false }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['install', '--save', 'eslint@latest', 'babel-core@latest'],
			options
		);
	});

	it('should install yarn packages to dependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { dev: false, yarn: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			[
				'add',
				'--ignore-workspace-root-check',
				'eslint@latest',
				'babel-core@latest',
			],
			options
		);
	});

	it('should install yarn@berry packages to dependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { dev: false, yarnBerry: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			['add', 'eslint@latest', 'babel-core@latest'],
			options
		);
	});

	it('should install a pnpm packages to dependencies', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules, { dev: false, pnpm: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/pnpm(\.cmd)?/),
			['add', '--save-prod', 'eslint@latest', 'babel-core@latest'],
			options
		);
	});

	it('should run Yarn if project is already using Yarn', () => {
		const spawn = jest.fn();
		fs.writeFileSync('yarn.lock', '');
		createPackageJson({}, {});
		install(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			[
				'add',
				'--dev',
				'--ignore-workspace-root-check',
				'eslint@latest',
				'babel-core@latest',
			],
			{
				cwd: undefined,
				stdio: 'inherit',
			}
		);
	});

	it('should run Yarn Berry if project is already using Yarn Berry', () => {
		const spawn = jest.fn();
		fs.writeFileSync('yarn.lock', '');
		fs.writeFileSync('.yarnrc.yml', '');
		createPackageJson({}, {});
		install(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			['add', '--dev', 'eslint@latest', 'babel-core@latest'],
			{
				cwd: undefined,
				stdio: 'inherit',
			}
		);
	});

	it('should not install already installed packages', () => {
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		createPackageJson({}, { eslint: '*' });
		install(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['install', '--save-dev', 'babel-core@latest'],
			options
		);
	});

	it('should accept the first parameter as a string', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		install(modules[0], undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['install', '--save-dev', `${modules[0]}@latest`],
			options
		);
	});

	it('should not run npm when there are no new packages', () => {
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		createNodeModulesPackageJson('babel-core', '7.1.0');
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		install(modules, undefined, spawn);
		expect(spawn).toHaveBeenCalledTimes(0);
	});

	it('should install packages that are in node_modules but not in package.json', () => {
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		createNodeModulesPackageJson('babel-core', '7.1.0');
		createPackageJson(
			{},
			{
				eslint: '*',
			}
		);
		install(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['install', '--save-dev', 'babel-core@latest'],
			options
		);
	});

	it('should update packages if newer versions are required', () => {
		const versions = {
			eslint: '^5.0.0',
			'babel-core': '7.1.0',
		};
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		createNodeModulesPackageJson('babel-core', '7.1.0');
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		install(modules, { versions }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			[
				'install',
				'--save-dev',
				// Since the result depend on the platform
				// we need to allow both output
				expect.stringMatching(/eslint@(\^{1}|\^{4})5.0.0/),
			],
			options
		);
	});

	it('should accept dependencies list as an object', () => {
		const versions = {
			eslint: '^5.0.0',
			'babel-core': '7.1.0',
			prettier: '^1.1.0',
		};
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		createNodeModulesPackageJson('babel-core', '7.1.0');
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		install(versions, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			[
				'install',
				'--save-dev',
				// Since the result depend on the platform
				// we need to allow both output
				expect.stringMatching(/eslint@(\^{1}|\^{4})5.0.0/),
				expect.stringMatching(/prettier@(\^{1}|\^{4})1.1.0/),
			],
			options
		);
	});

	it('should throw when version is invalid version', () => {
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		const fn = () => install({ eslint: 'pizza' }, undefined, spawn);
		expect(fn).toThrow('Invalid npm version');
	});

	it('should not throw when version is valid range', () => {
		const spawn = jest.fn();
		createNodeModulesPackageJson('eslint', '4.2.0');
		const fn = () => install({ eslint: '~4.2.0' }, undefined, spawn);
		expect(fn).not.toThrow('Invalid npm version');
	});
	it.each([
		['github', 'github/package'],
		['github https', 'https://github.com/user/package/tarball/v0.0.1'],
		['github protocol', 'github:mygithubuser/myproject'],
		['gist', 'gist:101a11beef'],
		['bitbucket protocol', 'bitbucket:mybitbucketuser/myproject'],
	])(
		'should not automatically add version data to non-registry installs: %s',
		(name, resource) => {
			const spawn = jest.fn();
			install([resource], undefined, spawn);
			expect(spawn).toBeCalledWith(
				expect.stringMatching(/npm(\.cmd)?/),
				['install', '--save-dev', resource],
				options
			);
		}
	);
	it.each([
		['github', 'github/package', '1.0.0'],
		[
			'github https',
			'https://github.com/user/package/tarball/v0.0.1',
			'>=2.0.0',
		],
		['github protocol', 'github:mygithubuser/myproject', '>3.0.0'],
		['gist', 'gist:101a11beef', '4.0.0'],
		['bitbucket protocol', 'bitbucket:mybitbucketuser/myproject', '5.0.0'],
	])(
		'should not automatically add version data to non-registry installs: %s',
		(name, resource, version) => {
			const spawn = jest.fn();
			const matcher = new RegExp(`^${resource}#semver:${version}$`);
			install({ [resource]: version }, undefined, spawn);
			expect(spawn).toBeCalledWith(
				expect.stringMatching(/npm(\.cmd)?/),
				['install', '--save-dev', expect.stringMatching(matcher)],
				options
			);
		}
	);

	it('should not throw when package.json not found', () => {
		const spawn = jest.fn();
		const fn = () => install(modules, undefined, spawn);
		expect(fn).not.toThrow();
	});

	it('should not throw when package.json has no dependencies section', () => {
		const spawn = jest.fn();
		createPackageJson();
		const fn = () => install(modules, undefined, spawn);
		expect(fn).not.toThrow();
	});

	it('should print module names', () => {
		install(modules, undefined, () => {});

		expect(log.info).toBeCalledWith('Installing eslint and babel-core...');
	});

	it('should print only module names that are not installed', () => {
		createNodeModulesPackageJson('eslint', '4.2.0');
		createPackageJson(
			{},
			{
				eslint: '*',
			}
		);
		install(modules, undefined, () => {});

		expect(log.info).toBeCalledWith('Installing babel-core...');
	});
});

describe('uninstall()', () => {
	it('should uninstall npm packages from devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		uninstall(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['uninstall', '--save-dev', 'eslint', 'babel-core'],
			options
		);
	});

	it('should uninstall yarn packages from devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		uninstall(modules, { yarn: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			['remove', 'eslint', 'babel-core'],
			options
		);
	});

	it('should uninstall pnpm packages from devDependencies', () => {
		const spawn = jest.fn();
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		uninstall(modules, { pnpm: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['remove', '--save-dev', 'eslint', 'babel-core'],
			options
		);
	});

	it('should uninstall npm packages from dependencies', () => {
		const spawn = jest.fn();
		createPackageJson(
			{
				eslint: '*',
				'babel-core': '*',
			},
			{}
		);
		uninstall(modules, { dev: false }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['uninstall', '--save', 'eslint', 'babel-core'],
			options
		);
	});

	it('should uninstall yarn packages from dependencies', () => {
		const spawn = jest.fn();
		createPackageJson(
			{
				eslint: '*',
				'babel-core': '*',
			},
			{}
		);
		uninstall(modules, { dev: false, yarn: true }, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			['remove', 'eslint', 'babel-core'],
			options
		);
	});

	it('should run Yarn if project is already using Yarn', () => {
		const spawn = jest.fn();
		fs.writeFileSync('yarn.lock', '');
		createPackageJson(
			{},
			{
				eslint: '*',
			}
		);
		uninstall(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/yarn(\.cmd)?/),
			['remove', 'eslint'],
			{
				cwd: undefined,
				stdio: 'inherit',
			}
		);
	});

	it('should not uninstall not installed packages', () => {
		const spawn = jest.fn();
		createPackageJson({}, { eslint: '*' });
		uninstall(modules, undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['uninstall', '--save-dev', 'eslint'],
			options
		);
	});

	it('should accept the first parameter as a string', () => {
		const spawn = jest.fn();
		createPackageJson(
			{},
			{
				eslint: '*',
			}
		);
		uninstall(modules[0], undefined, spawn);
		expect(spawn).toBeCalledWith(
			expect.stringMatching(/npm(\.cmd)?/),
			['uninstall', '--save-dev', modules[0]],
			options
		);
	});

	it('should not run npm when there are no packages to uninstall', () => {
		const spawn = jest.fn();
		createPackageJson({}, {});
		uninstall(modules, undefined, spawn);
		expect(spawn).toHaveBeenCalledTimes(0);
	});

	it('should not throw when package.json not found', () => {
		const spawn = jest.fn();
		const fn = () => uninstall(modules, undefined, spawn);
		expect(fn).not.toThrow();
	});

	it('should not throw when package.json has no dependencies section', () => {
		const spawn = jest.fn();
		createPackageJson();
		const fn = () => uninstall(modules, undefined, spawn);
		expect(fn).not.toThrow();
	});

	it('should print module names', () => {
		createPackageJson(
			{},
			{
				eslint: '*',
				'babel-core': '*',
			}
		);
		uninstall(modules, undefined, () => {});

		expect(log.info).toBeCalledWith('Uninstalling eslint and babel-core...');
	});

	it('should print only module names that are installed', () => {
		createPackageJson(
			{},
			{
				eslint: '*',
			}
		);
		uninstall(modules, undefined, () => {});

		expect(log.info).toBeCalledWith('Uninstalling eslint...');
	});
});
