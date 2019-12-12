jest.mock('fs');
jest.mock('../util/log', () => ({
	added: jest.fn(),
	removed: jest.fn(),
}));

const fs = require('fs-extra');
const vol = require('memfs').vol;
const log = require('../util/log');
const _fs = require('../fs');
const readFile = _fs.readFile;
const updateFile = _fs.updateFile;
const copyFiles = _fs.copyFiles;
const deleteFiles = _fs.deleteFiles;
const makeDirs = _fs.makeDirs;

const fs$copySync = fs.copySync;
const fs$removeSync = fs.removeSync;
const fs$ensureDirSync = fs.ensureDirSync;

afterEach(() => {
	vol.reset();
	log.added.mockClear();
	log.removed.mockClear();
});

describe('readFile()', () => {
	it('should read a file', () => {
		const contents = 'test';
		vol.fromJSON({ '/a': contents });

		const result = readFile('/a');

		expect(result).toBe(contents);
	});

	it('should strip BOM marker', () => {
		const contents = 'test';
		vol.fromJSON({ '/a': '\uFEFF' + contents });

		const result = readFile('/a');

		expect(result).toBe(contents);
	});
});

describe('updateFile()', () => {
	it('should update a file', () => {
		vol.fromJSON({ '/a': 'test' });

		updateFile('/a', 'pizza', true);

		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should create a file', () => {
		updateFile('/a', 'pizza', false);

		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should create a folder', () => {
		updateFile('/a/b', 'pizza', false);

		expect(vol.toJSON()).toMatchSnapshot();
	});
});

describe('copyFiles()', () => {
	afterEach(() => {
		fs.copySync = fs$copySync;
	});

	it('should copy a file', () => {
		vol.fromJSON({ '/tmpl/a': 'pizza' });

		copyFiles('/tmpl', 'a');

		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should copy multiple files', () => {
		vol.fromJSON({ '/tmpl/a': 'pizza', '/tmpl/b': 'coffee' });

		copyFiles('/tmpl', ['a', 'b']);

		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should not try to copy a file if contents is the same', () => {
		const spy = jest.spyOn(fs, 'writeFileSync');
		vol.fromJSON({
			'/tmpl/a': 'pizza',
			'/tmpl/b': 'pizza',
			'/a': 'pizza',
			'/b': 'coffee',
		});

		copyFiles('/tmpl', ['a', 'b']);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toBeCalledWith('b', 'pizza');
		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should not overwrite a file if overwrite=false', () => {
		const json = { '/tmpl/a': 'pizza', '/a': 'coffee' };
		vol.fromJSON(json);

		copyFiles('tmpl', 'a', { overwrite: false });

		expect(vol.toJSON()).toEqual(json);
	});

	it('should throw if file exists and errorOnExist=true', () => {
		const json = { '/tmpl/a': 'pizza', '/a': 'pizza' };
		vol.fromJSON(json);

		const fn = () =>
			copyFiles('/tmpl', 'a', { overwrite: false, errorOnExist: true });

		expect(fn).toThrowError('target file already exists');
		expect(vol.toJSON()).toEqual(json);
	});

	it('should throw when source file not found', () => {
		const fn = () => copyFiles('tmpl', 'a');

		expect(fn).toThrowError('source file not found');
	});

	it('should print a file name', () => {
		vol.fromJSON({ '/tmpl/a': 'pizza' });

		copyFiles('/tmpl', 'a');

		expect(log.added).toBeCalledWith('Create a');
	});

	it('should not print a file name if contents is the same', () => {
		vol.fromJSON({ '/tmpl/a': 'pizza', '/a': 'pizza' });

		copyFiles('/tmpl', 'a');

		expect(log.added).toHaveBeenCalledTimes(0);
	});
});

describe('deleteFiles()', () => {
	afterEach(() => {
		fs.removeSync = fs$removeSync;
	});

	it('should delete a file', () => {
		vol.fromJSON({ '/a': 'pizza', '/b': 'coffee' });

		deleteFiles('/a');

		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should delete multiple files', () => {
		vol.fromJSON({ '/a': 'pizza', '/b': 'coffee', '/c': 'schawarma' });

		deleteFiles(['/a', '/b']);

		expect(vol.toJSON()).toMatchSnapshot();
	});

	it('should not try to delete a file if it doesn’t exist', () => {
		fs.removeSync = jest.fn();

		vol.fromJSON({ '/a': 'pizza' });

		deleteFiles(['/a', '/b']);

		expect(fs.removeSync).toHaveBeenCalledTimes(1);
		expect(fs.removeSync).toBeCalledWith('/a');
	});

	it('should not throw when file not found', () => {
		const fn = () => deleteFiles('/a');

		expect(fn).not.toThrowError();
	});

	it('should print a file name', () => {
		vol.fromJSON({ '/a': 'pizza' });

		deleteFiles('/a');

		expect(log.removed).toBeCalledWith('Delete /a');
	});

	it('should not print a file name if file not found', () => {
		deleteFiles('/a');

		expect(log.removed).toHaveBeenCalledTimes(0);
	});
});

describe('makeDirs()', () => {
	afterEach(() => {
		fs.ensureDirSync = fs$ensureDirSync;
	});

	it('should create a folder', () => {
		makeDirs('/a');

		expect(fs.statSync('/a').isDirectory()).toBe(true);
	});

	it('should create multiple folders', () => {
		makeDirs(['/a', '/b']);

		expect(fs.statSync('/a').isDirectory()).toBe(true);
		expect(fs.statSync('/b').isDirectory()).toBe(true);
	});

	it('should not try to create a folder if it exists', () => {
		fs.ensureDirSync = jest.fn();

		vol.fromJSON({ '/a/1': 'pizza' });

		makeDirs(['/a', '/b']);

		expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
		expect(fs.ensureDirSync).toBeCalledWith('/b');
	});

	it('should print a folder name', () => {
		makeDirs('/a');

		expect(log.added).toBeCalledWith('Create folder /a');
	});

	it('should not print a folder name if folder exists', () => {
		vol.fromJSON({ '/a/b': 'pizza' });

		deleteFiles('/a');

		expect(log.added).toHaveBeenCalledTimes(0);
	});
});
