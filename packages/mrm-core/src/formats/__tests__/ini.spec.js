jest.mock('fs');
jest.mock('../../util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const vol = require('memfs').vol;
const log = require('../../util/log');
const ini = require('../ini');

const filename = '/test.ini';
const json = {
	'/test.ini': `
[foo]
bar = 42
`,
};

afterEach(() => {
	vol.reset();
});

describe('ini()', () => {
	it('should return an API', () => {
		const file = ini(filename);
		expect(file).toEqual(
			expect.objectContaining({
				exists: expect.any(Function),
				get: expect.any(Function),
				set: expect.any(Function),
				unset: expect.any(Function),
				save: expect.any(Function),
			})
		);
	});

	it('should not fail when reading an empty file', () => {
		vol.fromJSON({ '/test.ini': '' });
		const fn = () => ini('/test.ini');
		expect(fn).not.toThrow();
	});

	it('methods should be chainable', () => {
		const result = ini(filename)
			.set('foo', { b: 1 })
			.unset('foo')
			.save()
			.get();
		expect(result).toEqual([]);
	});
});

describe('exists()', () => {
	it('should return true if file exists', () => {
		vol.fromJSON(json);
		const file = ini(filename);
		expect(file.exists()).toBeTruthy();
	});

	it('should return false if file does not exists', () => {
		const file = ini(filename);
		expect(file.exists()).toBeFalsy();
	});
});

describe('get()', () => {
	it('should return list of sections', () => {
		vol.fromJSON(json);
		const file = ini(filename);
		expect(file.get()).toEqual(['foo']);
	});

	it('get(section) should return a section', () => {
		vol.fromJSON(json);
		const file = ini(filename);
		expect(file.get('foo')).toEqual({
			bar: ' 42',
		});
	});
});

describe('set()', () => {
	it('should update section', () => {
		const file = ini(filename);
		file.set('foo', { bar: 'xxx' });
		expect(file.get('foo')).toEqual({
			bar: 'xxx',
		});
	});
});

describe('unset()', () => {
	it('should remove section', () => {
		vol.fromJSON({
			'/test.ini': `
[foo]
a = 1
[bar]
b = 2
`,
		});
		const file = ini('/test.ini');
		file.unset('foo');
		expect(file.get()).toEqual(['bar']);
	});
});

describe('save()', () => {
	afterEach(() => {
		log.added.mockClear();
	});

	it('should create file', () => {
		ini(filename)
			.set('foo', { bar: 'xxx' })
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should create file with a comment', () => {
		ini(filename, 'comment')
			.set('foo', { bar: 'xxx' })
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should update file', () => {
		vol.fromJSON(json);
		ini(filename)
			.set('foo', { bar: 'xxx' })
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should change prettify format to remove spaces around =', () => {
		vol.fromJSON(json);
		ini(filename)
			.set('foo', { bar: 'xxx' })
			.save({ withSpaces: false });
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should not add spaces to file if they did not exist before', () => {
		vol.fromJSON({
			'/test.ini': `
[foo]
bar=42
`,
		});
		ini(filename).save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should not add spaces to file if they did not exist before, ignore comments', () => {
		vol.fromJSON({
			'/test.ini': `
# comment = bad
[foo]
bar=42
`,
		});
		ini(filename).save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should print a message that file was created', () => {
		ini(filename)
			.set('foo', { bar: 'xxx' })
			.save();
		expect(log.added).toBeCalledWith('Create /test.ini');
	});

	it('should print a message that file was updated', () => {
		vol.fromJSON(json);
		ini(filename)
			.set('foo', { bar: 'xxx' })
			.save();
		expect(log.added).toBeCalledWith('Update /test.ini');
	});

	it('should not print a message if file was not changed', () => {
		vol.fromJSON(json);
		ini(filename).save();
		expect(log.added).toHaveBeenCalledTimes(0);
	});
});

describe('delete()', () => {
	it('should delete a file', () => {
		vol.fromJSON(json);
		const file = ini(filename);
		file.delete();
		expect(vol.toJSON()).toEqual({});
	});
});
