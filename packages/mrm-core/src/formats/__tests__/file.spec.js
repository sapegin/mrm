jest.mock('fs');
jest.mock('../../util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const vol = require('memfs').vol;
const log = require('../../util/log');
const file = require('../file');

const filename = '/test.txt';
const fsJson = { '/test.txt': 'pizza' };

afterEach(() => {
	vol.reset();
});

describe('file()', () => {
	it('should return an API', () => {
		const result = file('notfound');
		expect(result).toEqual(
			expect.objectContaining({
				exists: expect.any(Function),
				save: expect.any(Function),
				delete: expect.any(Function),
			})
		);
	});

	it('methods should be chainable', () => {
		const result = file(filename)
			.save('coffee')
			.exists();
		expect(result).toBeFalsy();
	});
});

describe('exists()', () => {
	it('should return true if file exists', () => {
		vol.fromJSON(fsJson);
		const test = file(filename);
		expect(test.exists()).toBeTruthy();
	});

	it('should return false if file does not exists', () => {
		const test = file('/notfound.json');
		expect(test.exists()).toBeFalsy();
	});

	it('should throw when the error is not ENOENT', () => {
		vol.fromJSON({ '/foo/test.txt': 'pizza' });
		const fn = () => file('/foo');
		expect(fn).toThrow('EISDIR');
	});
});

describe('get()', () => {
	it('should return file contents', () => {
		vol.fromJSON(fsJson);
		const test = file(filename);
		expect(test.get()).toBe('pizza');
	});

	it('should return an empty string if file does not exists', () => {
		const test = file('/notfound.json');
		expect(test.get()).toBe('');
	});
});

describe('getStyle()', () => {
	it('should return EditorConfig style', () => {
		vol.fromJSON(fsJson);
		const test = file(filename);
		expect(test.getStyle()).toMatchObject({ insert_final_newline: false });
	});
});

describe('getIndent()', () => {
	it('should return indentation string', () => {
		vol.fromJSON(fsJson);
		const test = file(filename);
		expect(test.getIndent()).toBe('  ');
	});
});

describe('save()', () => {
	afterEach(() => {
		log.added.mockClear();
	});

	it('should create file', () => {
		file(filename).save('coffee');
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should create a folder', () => {
		file('/pizza/test.txt').save('coffee');
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should update file', () => {
		vol.fromJSON(fsJson);
		file(filename).save('coffee');
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should keep a new line at the end of the file', () => {
		vol.fromJSON({ '/test.txt': 'pizza\n' });
		file(filename).save('coffee');
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should not add a new line at the end of the file', () => {
		vol.fromJSON({ '/test.txt': 'pizza' });
		file(filename).save('coffee\n');
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should print a message that file was created', () => {
		file(filename).save('coffee');
		expect(log.added).toBeCalledWith('Create /test.txt');
	});

	it('should print a message that file was updated', () => {
		vol.fromJSON(fsJson);
		file(filename).save('coffee');
		expect(log.added).toBeCalledWith('Update /test.txt');
	});

	it('should not print a message if file was not changed', () => {
		vol.fromJSON(fsJson);
		file(filename).save('pizza');
		expect(log.added).toHaveBeenCalledTimes(0);
	});

	it('should not print a message if only leading or trailing whitespace was changes', () => {
		vol.fromJSON(fsJson);
		file(filename).save('   pizza   ');
		expect(log.added).toHaveBeenCalledTimes(0);
	});
});

describe('delete()', () => {
	afterEach(() => {
		log.removed.mockClear();
	});

	it('should delete file if it exists', () => {
		vol.fromJSON(fsJson);
		const test = file(filename);
		test.delete();
		expect(vol.toJSON()).toEqual({});
		expect(log.removed).toHaveBeenCalledTimes(1);
	});

	it('should do nothing if file does not exists', () => {
		const test = file('/notfound.json');
		test.delete();
		expect(vol.toJSON()).toEqual({});
		expect(log.removed).toHaveBeenCalledTimes(0);
	});
});
