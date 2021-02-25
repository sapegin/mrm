// @ts-check
const fs = require('./fs');
const npm = require('./npm');
const editorconfig = require('./editorconfig');
const commands = require('./commands');
const MrmError = require('./error');
const file = require('./formats/file');
const ini = require('./formats/ini');
const json = require('./formats/json');
const lines = require('./formats/lines');
const markdown = require('./formats/markdown');
const template = require('./formats/template');
const yaml = require('./formats/yaml');
const packageJson = require('./files/packageJson');

module.exports = {
	readFile: fs.readFile,
	updateFile: fs.updateFile,
	copyFiles: fs.copyFiles,
	deleteFiles: fs.deleteFiles,
	makeDirs: fs.makeDirs,
	init: npm.init,
	install: npm.install,
	uninstall: npm.uninstall,
	inferStyle: editorconfig.inferStyle,
	getStyleForFile: editorconfig.getStyleForFile,
	getIndent: editorconfig.getIndent,
	format: editorconfig.format,
	getExtsFromCommand: commands.getExtsFromCommand,
	MrmError,
	file,
	ini,
	json,
	lines,
	markdown,
	template,
	yaml,
	packageJson,
};
