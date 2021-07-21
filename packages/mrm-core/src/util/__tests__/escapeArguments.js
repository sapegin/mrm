const escapeArguments = require('../escapeArguments');

const isWindows = require('../isWindows');
jest.mock('../isWindows');

it('escapeArguments should escape the ^ on Windows', () => {
	isWindows.mockImplementation(() => true);
	const result = escapeArguments(['install', '--save-dev', 'eslint@^6.0.0']);

	expect(result).toEqual([
		'install',
		'--save-dev',
		expect.stringMatching(/eslint@\^{4}6.0.0/),
	]);
});

it('escapeArguments should not escape the ^ on non-Windows', () => {
	isWindows.mockImplementation(() => false);
	const result = escapeArguments(['install', '--save-dev', 'eslint@^6.0.0']);

	expect(result).toEqual([
		'install',
		'--save-dev',
		expect.stringMatching(/eslint@\^6.0.0/),
	]);
});
