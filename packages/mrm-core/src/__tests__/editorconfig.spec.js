jest.mock('fs');

const vol = require('memfs').vol;
const editorconfig = require('../editorconfig');
const hasTrailingNewLine = editorconfig.hasTrailingNewLine;
const getIndent = editorconfig.getIndent;
const findEditorConfig = editorconfig.findEditorConfig;
const inferStyle = editorconfig.inferStyle;
const getStyleForFile = editorconfig.getStyleForFile;
const format = editorconfig.format;

afterEach(() => {
	vol.reset();
});

describe('hasTrailingNewLine()', () => {
	it('should return true if a string has a new line in the end', () => {
		const result = hasTrailingNewLine('foo\nbar\n');
		expect(result).toBe(true);
	});

	it('should return false if a string has no new line in the end', () => {
		const result = hasTrailingNewLine('foo\nbar');
		expect(result).toBe(false);
	});
});

describe('getIndent()', () => {
	it('should return tab indentation', () => {
		const result = getIndent({ indent_size: 'tab', indent_style: 'tab' });
		expect(result).toBe('\t');
	});

	it('should return 4 spaces indentation', () => {
		const result = getIndent({ indent_size: 4, indent_style: 'space' });
		expect(result).toBe('    ');
	});

	it('should return 2 spaces by default', () => {
		const result = getIndent({});
		expect(result).toBe('  ');
	});
});

describe('findEditorConfig()', () => {
	it('should return a path to .editorconfig file', () => {
		vol.fromJSON({
			'/a/.editorconfig': '',
			'/a/b/c': 'pizza',
		});
		const result = findEditorConfig('/a/b/c');
		expect(result).toMatch(new RegExp('(/a/|C:\\\\a\\\\).editorconfig'));
	});

	it('should return undefined if .editorconfig not found', () => {
		vol.fromJSON({
			'/a/b/c': 'pizza',
		});
		const result = findEditorConfig('/a/b/c');
		expect(result).toBeUndefined();
	});
});

describe('inferStyle()', () => {
	it('should detect a new line at the end of string', () => {
		const result = inferStyle('foo\nbar\n');
		expect(result).toMatchObject({ insert_final_newline: true });
	});

	it('should detect absense of a new line at the end of a string', () => {
		const result = inferStyle('foo\nbar');
		expect(result).toMatchObject({ insert_final_newline: false });
	});

	it('should detect indentation with spaces', () => {
		const result = inferStyle('  foo\n    bar');
		expect(result).toMatchObject({ indent_size: 2, indent_style: 'space' });
	});

	it('should detect indentation with tabs', () => {
		const result = inferStyle('	foo\n		bar');
		expect(result).toMatchObject({ indent_size: 'tab', indent_style: 'tab' });
	});

	it('should return no options that cannot be detected', () => {
		const result = inferStyle('');
		expect(result).toEqual({ insert_final_newline: false });
	});
});

describe('getStyleForFile()', () => {
	it('should return settings for a file', () => {
		vol.fromJSON({
			'.editorconfig':
				'[*]\nindent_style=tab\n[*.js]\nindent_size=2\nindent_style=space',
		});
		expect(getStyleForFile('coffee.php')).toMatchObject({
			indent_size: 'tab',
			indent_style: 'tab',
		});
		expect(getStyleForFile('pizza.js')).toMatchObject({
			indent_size: 2,
			indent_style: 'space',
		});
	});

	it('should return an empty object if settings for a path not found', () => {
		vol.fromJSON({
			'.editorconfig': '[*.js]\nindent_size=2\nindent_style=space',
		});
		expect(getStyleForFile('pizza.php')).toEqual({});
	});

	it('should return an empty object if .editorconfig not found', () => {
		expect(getStyleForFile('pizza.js')).toEqual({});
	});
});

describe('format()', () => {
	it('should add a new line in the end', () => {
		const result = format('foo\nbar', { insert_final_newline: true });
		expect(result).toBe('foo\nbar\n');
	});

	it('should not add another new line in the end', () => {
		const result = format('foo\nbar\n', { insert_final_newline: true });
		expect(result).toBe('foo\nbar\n');
	});

	it('should remove a new line in the end', () => {
		const result = format('foo\nbar\n', { insert_final_newline: false });
		expect(result).toBe('foo\nbar');
	});

	it('should leave file as is', () => {
		const result = format('foo\nbar', { insert_final_newline: false });
		expect(result).toBe('foo\nbar');
	});
});
