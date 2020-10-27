// @ts-check
const path = require('path');
const fs = require('fs-extra');
const stripBom = require('strip-bom');
const _ = require('lodash');
const log = require('./util/log');
const MrmError = require('./error');

/**
 * @param {string} file
 */
const read = file => (fs.existsSync(file) ? readFile(file).trim() : '');

/**
 * Read a text file as UTF-8
 * @param {string} filename
 */
function readFile(filename) {
	return stripBom(fs.readFileSync(filename, 'utf8'));
}

/**
 * Write a file if the content was changed and print a message.
 * @param {string} filename
 * @param {string} content
 * @param {boolean} exists
 */
function updateFile(filename, content, exists) {
	fs.ensureDirSync(path.dirname(filename));
	fs.writeFileSync(filename, content);
	log.added(`${exists ? 'Update' : 'Create'} ${filename}`);
}

/**
 * Copy files from a given directory to the current working directory
 * @param {string} sourceDir
 * @param {string|string[]} files
 */
function copyFiles(sourceDir, files, options = {}) {
	const { overwrite = true, errorOnExist } = options;

	_.castArray(files).forEach(file => {
		const sourcePath = path.resolve(sourceDir, file);
		if (!fs.existsSync(sourcePath)) {
			throw new MrmError(`copyFiles: source file not found: ${sourcePath}`);
		}

		const targetExist = fs.existsSync(file);
		if (targetExist && !overwrite) {
			if (errorOnExist) {
				throw new MrmError(`copyFiles: target file already exists: ${file}`);
			}
			return;
		}

		const content = read(sourcePath);

		// Skip copy if file contents are the same
		if (content === read(file)) {
			return;
		}

		updateFile(file, content, targetExist);
	});
}

/**
 * Delete files or folders
 * @param {string|string[]} files
 */
function deleteFiles(files) {
	_.castArray(files).forEach(file => {
		if (!fs.existsSync(file)) {
			return;
		}

		log.removed(`Delete ${file}`);
		fs.removeSync(file);
	});
}

/**
 * Create directories if they don’t exist
 * @param {string|string[]} dirs
 */
function makeDirs(dirs) {
	_.castArray(dirs).forEach(dir => {
		if (fs.existsSync(dir)) {
			return;
		}

		log.added(`Create folder ${dir}`);
		fs.ensureDirSync(dir);
	});
}

module.exports = {
	readFile,
	updateFile,
	copyFiles,
	deleteFiles,
	makeDirs,
};
