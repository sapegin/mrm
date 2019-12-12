const { getExtsFromCommand } = require('../commands');

describe('getExtsFromCommand', () => {
	it('prettier: single quotes', () => {
		const result = getExtsFromCommand(`prettier --write '**/*.js'`);
		expect(result).toEqual(['js']);
	});

	it('prettier: double quotes', () => {
		const result = getExtsFromCommand(`prettier --write "**/*.js"`);
		expect(result).toEqual(['js']);
	});

	it('prettier: no quotes', () => {
		const result = getExtsFromCommand(`prettier --write **/*.js`);
		expect(result).toEqual(['js']);
	});

	it('prettier: multiple extensions', () => {
		const result = getExtsFromCommand(`prettier --write '**/*.{js,md}'`);
		expect(result).toEqual(['js', 'md']);
	});

	it('eslint: no extensions', () => {
		const result = getExtsFromCommand(`eslint . --fix`, 'ext');
		expect(result).toBe(undefined);
	});

	it('eslint: one extension', () => {
		const result = getExtsFromCommand(`eslint . --fix --ext .js`, 'ext');
		expect(result).toEqual(['js']);
	});

	it('eslint: multiple extensions', () => {
		const result = getExtsFromCommand(`eslint . --fix --ext .js,.jsx`, 'ext');
		expect(result).toEqual(['js', 'jsx']);
	});

	it('env variables', () => {
		const result = getExtsFromCommand(
			`NODE_ENV=development prettier --write '**/*.js'`
		);
		expect(result).toEqual(['js']);
	});

	it('cross-env', () => {
		const result = getExtsFromCommand(
			`cross-env NODE_ENV=development prettier --write '**/*.js'`
		);
		expect(result).toEqual(['js']);
	});

	it('ignore empty command', () => {
		const result = getExtsFromCommand(``);
		expect(result).toBe(undefined);
	});

	it('ignore undefined command', () => {
		const result = getExtsFromCommand();
		expect(result).toBe(undefined);
	});
});
