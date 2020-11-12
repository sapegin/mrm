jest.mock('fs');
jest.mock('../../util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const vol = require('memfs').vol;
const log = require('../../util/log');
const markdown = require('../markdown');

const normalizeNewLines = s => s.replace(/\n{1,}/g, '\n');

const md = `
# Foo

Hello.
`;

const mdWithBadge = `
# Foo

[![Example](http://example.com/badge.svg)](http://example.com/)

Hello.
`;

const addBadge = file =>
	file.addBadge(
		'http://example.com/badge.svg',
		'http://example.com/',
		'Example'
	);

const filename = '/test.md';
const json = { '/test.md': md };
const jsonWithBadge = { '/test.md': mdWithBadge };

afterEach(() => {
	vol.reset();
});

describe('markdown()', () => {
	it('should return an API', () => {
		const file = markdown('notfound');
		expect(file).toEqual(
			expect.objectContaining({
				exists: expect.any(Function),
				get: expect.any(Function),
				addBadge: expect.any(Function),
				save: expect.any(Function),
			})
		);
	});

	it('should not fail when reading an empty file', () => {
		vol.fromJSON({ '/test.md': '' });
		const fn = () => markdown('/test.md');
		expect(fn).not.toThrow();
	});

	it('methods should be chainable', () => {
		vol.fromJSON(json);
		const result = markdown(filename)
			.addBadge('http://a.b/c.svg', 'http://a.b', 'c')
			.save()
			.get();
		expect(result).toMatch('http://a.b/c.svg');
	});
});

describe('exists()', () => {
	it('should return true if file exists', () => {
		vol.fromJSON(json);
		const file = markdown(filename);
		expect(file.exists()).toBeTruthy();
	});

	it('should return false if file does not exists', () => {
		const file = markdown('notfound.md');
		expect(file.exists()).toBeFalsy();
	});
});

describe('get()', () => {
	it('should return all markdown', () => {
		vol.fromJSON(json);
		const file = markdown(filename);
		expect(file.get()).toBe(md);
	});
});

describe('addBadge()', () => {
	it('should add a badge', () => {
		vol.fromJSON(json);
		const file = markdown(filename);
		addBadge(file);
		expect(file.get()).toBe(mdWithBadge);
	});

	it('should not add badge with the same link twice', () => {
		vol.fromJSON(json);
		const file = markdown(filename);

		addBadge(file);
		const before = file.get();
		addBadge(file);
		const after = file.get();
		expect(after).toBe(before);
	});

	it('should not add empty lines between badges', () => {
		vol.fromJSON(json);
		const file = markdown(filename);

		addBadge(file);
		file.addBadge(
			'http://example2.com/badge.svg',
			'http://example2.com/',
			'Example 2'
		);
		const result = file.get();
		expect(result).toMatch(
			`[![Example](http://example.com/badge.svg)](http://example.com/) [![Example 2](http://example2.com/badge.svg)](http://example2.com/)`
		);
	});

	it('should throw if file not found', () => {
		const file = markdown(filename);
		const fn = () => addBadge(file);
		expect(fn).toThrowError('Can’t add badge');
	});
});

describe('removeBadge()', () => {
	it('should remove a badge', () => {
		vol.fromJSON(jsonWithBadge);
		const file = markdown(filename);
		file.removeBadge(({ imageUrl }) =>
			imageUrl.startsWith('http://example.com')
		);
		expect(normalizeNewLines(file.get())).toBe(normalizeNewLines(md));
	});

	it('should not do anything if file not found', () => {
		const file = markdown(filename);
		const fn = () => file.removeBadge(() => true);
		expect(fn).not.toThrowError();
	});
});

describe('save()', () => {
	afterEach(() => {
		log.added.mockClear();
	});

	it('should update file', () => {
		vol.fromJSON(json);
		const file = markdown(filename);
		addBadge(file);
		file.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should print a message that file was updated', () => {
		vol.fromJSON(json);
		const file = markdown(filename);
		addBadge(file);
		file.save();
		expect(log.added).toBeCalledWith('Update /test.md');
	});

	it('should not print a message if file was not changed', () => {
		vol.fromJSON(json);
		markdown(filename).save();
		expect(log.added).toHaveBeenCalledTimes(0);
	});
});

describe('delete()', () => {
	it('should delete a file', () => {
		vol.fromJSON(json);
		const file = markdown(filename);
		file.delete();
		expect(vol.toJSON()).toEqual({});
	});
});
