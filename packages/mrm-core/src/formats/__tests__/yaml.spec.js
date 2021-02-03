jest.mock('fs');
jest.mock('../../util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const vol = require('memfs').vol;
const log = require('../../util/log');
const yaml = require('../yaml');

const filename = '/test.yml';
const json = {
	'/test.yml': `bar: 42
baz:
  foo:
    43
`,
};

afterEach(() => {
	vol.reset();
});

describe('yaml()', () => {
	it('should return an API', () => {
		const file = yaml('notfound');
		expect(file).toEqual(
			expect.objectContaining({
				exists: expect.any(Function),
				get: expect.any(Function),
				set: expect.any(Function),
				unset: expect.any(Function),
				merge: expect.any(Function),
				save: expect.any(Function),
			})
		);
	});

	it('should not fail when reading an empty file', () => {
		vol.fromJSON({ '/text.yml': '' });
		const fn = () => yaml('/text.yml');
		expect(fn).not.toThrow();
	});

	it('methods should be chainable', () => {
		const result = yaml(filename)
			.set('a', 1)
			.unset('a')
			.merge({ a: 1 })
			.save()
			.get();
		expect(result).toEqual({ a: 1 });
	});

	it('can specify YAML version', () => {
		vol.fromJSON({
			'/test.yml': 'bool: yes',
		});
		const file = yaml(filename, {}, { version: '1.1' });
		expect(file.get('bool')).toBe(true);
		file.set('string', 'yes').save();
		expect(vol.toJSON()).toMatchSnapshot();
	});
});

describe('exists()', () => {
	it('exists() should return true if file exists', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		expect(file.exists()).toBeTruthy();
	});

	it('exists() should return false if file does not exists', () => {
		const file = yaml('notfound.yml');
		expect(file.exists()).toBeFalsy();
	});
});

describe('get()', () => {
	it('should return object with all file contents', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		expect(file.get()).toEqual({
			bar: 42,
			baz: {
				foo: 43,
			},
		});
	});

	it('get(path) should return a value', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		expect(file.get('bar')).toBe(42);
	});

	it('get(nested.path) should return a nested value', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		expect(file.get('baz.foo')).toBe(43);
	});

	it('should return default value if file does not exist', () => {
		const obj = { zzz: 1 };
		const file = yaml(filename, obj);
		expect(file.get()).toEqual(obj);
	});

	it('should return an empty object if file does not exist and no default value given', () => {
		const file = yaml(filename);
		expect(file.get()).toEqual({});
	});
});

describe('set()', () => {
	it('should replace the object', () => {
		vol.fromJSON(json);
		const obj = { xyz: 1 };
		const file = yaml(filename);
		file.set(obj);
		expect(file.get()).toEqual(obj);
	});

	it('set(path) should set a value', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		file.set('foo', 1);
		expect(file.get('foo')).toBe(1);
	});

	it('set(nested.path) should create a nested value', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		file.set('xxx.yyy', 1);
		expect(file.get('xxx')).toEqual({ yyy: 1 });
	});
});

describe('unset()', () => {
	it('unset(path) should delete a key', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		file.unset('baz.foo');
		expect(file.get('baz')).toEqual({});
	});
});

describe('merge()', () => {
	it('should merge an object', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		file.merge({ yyy: 1 });
		expect(file.get()).toEqual({
			bar: 42,
			baz: {
				foo: 43,
			},
			yyy: 1,
		});
	});
});

describe('save()', () => {
	afterEach(() => {
		log.added.mockClear();
	});

	it('save() should create file', () => {
		yaml(filename)
			.set('foo', 1)
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('save() should update file', () => {
		vol.fromJSON(json);
		yaml(filename)
			.set('foo', 1)
			.save();
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should print a message that file was created', () => {
		yaml(filename)
			.set('foo', 1)
			.save();
		expect(log.added).toBeCalledWith('Create /test.yml');
	});

	it('should print a message that file was updated', () => {
		vol.fromJSON(json);
		yaml(filename)
			.set('foo', 1)
			.save();
		expect(log.added).toBeCalledWith('Update /test.yml');
	});

	it('should not print a message if file was not changed', () => {
		vol.fromJSON({ '/test.yml': `bar: 42` });
		yaml('/test.yml').save();
		expect(log.added).toHaveBeenCalledTimes(0);
	});
});

describe('delete()', () => {
	it('should delete a file', () => {
		vol.fromJSON(json);
		const file = yaml(filename);
		file.delete();
		expect(vol.toJSON()).toEqual({});
	});
});
