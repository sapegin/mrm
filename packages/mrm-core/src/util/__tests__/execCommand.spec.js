const { execFileSync } = require('child_process');

const execCommand = require('../execCommand');

const mockIsWindows = jest.requireActual('../isWindows');

const isWindows = require('../isWindows');
jest.mock('../isWindows');

it('execCommand should run spawnSync by default with arguments', () => {
	isWindows.mockImplementation(mockIsWindows);
	const result = execCommand(undefined, 'npm', ['--version']);
	expect(result.status).toBe(0);
	expect(result.stdout.toString()).toMatch(/[0-9]+\.[0-9]+.[0-9]+\n/);
});

it('execCommand should run custom exec with arguments', () => {
	isWindows.mockImplementation(mockIsWindows);
	const result = execCommand(execFileSync, 'npm', ['--version']);
	expect(result.toString()).toMatch(/[0-9]+\.[0-9]+.[0-9]+\n/);
});

it('execCommand should run custom exec with arguments (non-Windows)', () => {
	isWindows.mockImplementation(() => false);

	let ranCommand;
	execCommand(
		cmd => {
			ranCommand = cmd;
		},
		'npm',
		['--version']
	);
	expect(ranCommand).toEqual('npm');
});

it('execCommand should run custom exec with arguments (Windows)', () => {
	isWindows.mockImplementation(() => true);

	let ranCommand;
	execCommand(
		cmd => {
			ranCommand = cmd;
		},
		'npm',
		['--version']
	);
	expect(ranCommand).toEqual('npm.cmd');
});
