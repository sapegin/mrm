jest.mock('fs');
jest.mock('../../util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const vol = require('memfs').vol;
const log = require('../../util/log');
const template = require('../template');

afterEach(() => {
	vol.reset();
});

it('should return an API', () => {
	const file = template('notfound', 'notfound');
	expect(file).toEqual(
		expect.objectContaining({
			exists: expect.any(Function),
			get: expect.any(Function),
			apply: expect.any(Function),
			save: expect.any(Function),
		})
	);
});

describe('template()', () => {
	it('should not fail when reading an empty file', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
			'/text.txt': '',
		});
		const fn = () => template('/text.txt', '/tmpl.txt').apply({ foo: 'Bar' });
		expect(fn).not.toThrow();
	});

	it('should not fail when reading an empty template', () => {
		vol.fromJSON({
			'/tmpl.txt': '',
			'/text.txt': 'Text',
		});
		const fn = () => template('/text.txt', '/tmpl.txt').apply({ foo: 'Bar' });
		expect(fn).not.toThrow();
	});

	it('methods should be chainable', () => {
		vol.fromJSON({
			'/tmpl.txt': '',
		});
		const result = template('/text.txt', '/tmpl.txt')
			.apply({})
			.save()
			.get();
		expect(result).toEqual('');
	});
});

describe('exists()', () => {
	it('should return true if file exists', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
			'/text.txt': 'Text',
		});
		const file = template('/text.txt', '/tmpl.txt');
		expect(file.exists()).toBeTruthy();
	});

	it('should return false if file does not exists', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
		});
		const file = template('/text.txt', '/tmpl.txt');
		expect(file.exists()).toBeFalsy();
	});
});

describe('get()', () => {
	it('should return file contents', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
			'/text.txt': 'Text',
		});
		const file = template('/text.txt', '/tmpl.txt');
		expect(file.get()).toEqual('Text');
	});

	it('should return an empty string when file doesn’t exist', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
		});
		const file = template('/text.txt', '/tmpl.txt');
		expect(file.get()).toEqual('');
	});
});

describe('apply()', () => {
	it('should apply context to the template', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
		});
		const file = template('/text.txt', '/tmpl.txt');
		file.apply({ foo: 'Bar' });
		expect(file.get()).toBe('Hello, Bar!');
	});

	it('should apply multiple contexts to the template', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo} & ${bar}!',
		});
		const file = template('/text.txt', '/tmpl.txt');
		file.apply({ foo: 'Foo' }, { bar: 'Bar' });
		expect(file.get()).toBe('Hello, Foo & Bar!');
	});
});

describe('save()', () => {
	afterEach(() => {
		log.added.mockClear();
	});

	it('should update file', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
			'/text.txt': 'Text',
		});
		template('/text.txt', '/tmpl.txt')
			.apply({ foo: 'Bar' })
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should create file', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
		});
		template('/text.txt', '/tmpl.txt')
			.apply({ foo: 'Bar' })
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should throw when trying to save() without apply()', () => {
		const fn = () => template('/text.txt', '/tmpl.txt').save();
		expect(fn).toThrowError('Attempt to save the template');
	});

	it('should print a message that file was created', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello',
		});
		template('/text.txt', '/tmpl.txt')
			.apply({})
			.save();
		expect(log.added).toBeCalledWith('Create /text.txt');
	});

	it('should print a message that file was updated', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello',
			'/text.txt': 'Bye',
		});
		template('/text.txt', '/tmpl.txt')
			.apply({})
			.save();
		expect(log.added).toBeCalledWith('Update /text.txt');
	});

	it('should not print a message if file was not changed', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
			'/text.txt': 'Hello, Bar!',
		});
		template('/text.txt', '/tmpl.txt')
			.apply({ foo: 'Bar' })
			.save();
		expect(log.added).toHaveBeenCalledTimes(0);
	});
});

describe('delete()', () => {
	it('should delete a file', () => {
		vol.fromJSON({
			'/tmpl.txt': 'Hello',
		});
		vol.fromJSON({
			'/tmpl.txt': 'Hello, ${foo}!',
			'/text.txt': 'Hello, Bar!',
		});
		template('/text.txt', '/tmpl.txt').delete();
		expect(vol.toJSON()).toEqual({
			'/tmpl.txt': 'Hello, ${foo}!',
		});
	});
});
