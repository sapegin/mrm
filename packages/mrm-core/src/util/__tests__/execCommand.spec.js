const { execFileSync } = require('child_process');

const execCommand = require('../execCommand');

it('execCommand should run spawnSync by default with arguments', () => {
	const result = execCommand(undefined, 'npm', ['--version']);
	expect(result.status).toBe(0);
	expect(result.stdout.toString()).toMatch(/[0-9]+\.[0-9]+.[0-9]+\n/);
});

it('execCommand should run custom exec with arguments', () => {
	const result = execCommand(execFileSync, 'npm', ['--version']);
	expect(result.toString()).toMatch(/[0-9]+\.[0-9]+.[0-9]+\n/);
});
