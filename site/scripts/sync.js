// Get docs from the docs folder and each preset and task

const { readFileSync, writeFileSync, emptyDirSync } = require('fs-extra');
const glob = require('glob');
const { kebabCase } = require('lodash');

const DEST_DIR = 'docs';

const read = file => readFileSync(file, 'utf8');
const write = (file, contents) =>
	writeFileSync(`${DEST_DIR}/${file}.md`, contents);

const getTitle = contents => contents.match(/^#\s*(.*?)$/m) || [];
const getSidebarTitle = contents => contents.match(/^<!--\s*(.*?)\s*-->/) || [];
const stripTitle = contents => contents.replace(/^#.*?$/m, '');
const getEditUrl = relativePath =>
	`https://github.com/sapegin/mrm/edit/master/${relativePath.replace(
		'../',
		''
	)}`;

const template = ({ id, title, sidebarLabel, editUrl, contents }) => `---
id: ${id}
title: "${title}"
sidebar_label: "${sidebarLabel}"
custom_edit_url: ${getEditUrl(editUrl)}
---

${stripTitle(contents)}`;

emptyDirSync(DEST_DIR);

console.log('Syncing docs...');

const docs = glob.sync('../docs/*.md');
docs.forEach(filepath => {
	console.log(`👉 ${filepath}`);
	const contents = read(filepath);
	const [, title] = getTitle(contents);
	const [, sidebarLabel = title] = getSidebarTitle(contents);
	const id = kebabCase(sidebarLabel);
	write(
		id,
		template({
			id,
			title,
			sidebarLabel,
			editUrl: filepath,
			contents,
		})
	);
});

console.log('\nSyncing packages...');

const packages = glob.sync('../packages/*/Readme.md');
packages.forEach(filepath => {
	console.log(`👉 ${filepath}`);
	const contents = read(filepath);
	const [, package] = getTitle(contents);
	const title = package.replace('mrm-taks-', '').replace('mrm-preset-', '');
	const [, sidebarLabel = title] = getSidebarTitle(contents);
	const id = kebabCase(package);
	write(
		id,
		template({
			id,
			title: package,
			sidebarLabel,
			editUrl: filepath,
			contents: contents.split('## Changelog')[0],
		})
	);
});
