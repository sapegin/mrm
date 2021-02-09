jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const fs = jest.requireActual('fs');
const path = require('path');
const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');
const getAuthorName = require('./index').getAuthorName;
const { json } = require('mrm-core');

const console$log = console.log;

const stringify = o => JSON.stringify(o, null, '  ');

const config = {
	name: 'Gendalf',
	email: 'gendalf@middleearth.com',
	url: 'https://middleearth.com',
};

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	vol.reset();
	console.log = console$log;
});

test('adds a license file with author details', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/MIT.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/MIT.md'))
			.toString(),
	});

	task(await getTaskOptions(task, false, config));

	expect(vol.toJSON()['/License.md']).toMatch(/The MIT License/);
	expect(vol.toJSON()['/License.md']).toMatch(
		/Copyright 2\d\d\d Gendalf, contributors/
	);
});

test('adds a license file with custom, dynamic file name', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/MIT.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/MIT.md'))
			.toString(),
	});

	task(
		await getTaskOptions(task, false, {
			...config,
			licenseFile: 'LICENSE-${license.toUpperCase()}.md',
		})
	);

	expect(vol.toJSON()['/LICENSE-MIT.md']).toMatch(/The MIT License/);
	expect(vol.toJSON()['/LICENSE-MIT.md']).toMatch(
		/Copyright 2\d\d\d Gendalf, contributors/
	);
});

test('reads license name from package.json', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/Apache-2.0.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Apache-2.0.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
			license: 'Apache-2.0',
		}),
	});

	task(await getTaskOptions(task, false, config));

	expect(vol.toJSON()['/License.md']).toMatch(
		'Apache License, Version 2.0 (Apache-2.0)'
	);
});

test('skips when template not found', async () => {
	task(
		await getTaskOptions(task, false, {
			name: 'Gendalf',
			email: 'gendalf@middleearth.com',
			url: 'https://middleearth.com',
		})
	);

	expect(console.log).toBeCalledWith(expect.stringMatching('skipping'));
});

test('uses the license config argument', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/Unlicense.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Unlicense.md'))
			.toString(),
	});

	task(
		await getTaskOptions(task, false, {
			license: 'Unlicense',
		})
	);

	expect(vol.readFileSync('/License.md', 'utf8')).toMatch(
		'This is free and unencumbered software released into the public domain'
	);
});

test('adds license to package.json if not set', async () => {
	vol.fromJSON({
		[`${__dirname}/templates/MIT.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/MIT.md'))
			.toString(),
	});

	task(await getTaskOptions(task, false, config));

	expect(json('/package.json').get('license')).toBe('MIT');
});

test.each([
	[
		{ author: 'Barney Rubble <example@name.com> (http://example.com/)' },
		'Barney Rubble',
	],
	[{ author: 'Barney Rubble (http://example.com/)' }, 'Barney Rubble'],
	[{ author: 'Barney Rubble <example@name.com>' }, 'Barney Rubble'],
	[{ author: 'Barney Rubble ' }, 'Barney Rubble'],
	[{ author: { name: 'Barney Rubble' } }, 'Barney Rubble'],
	[{ author: undefined }, undefined],
	[undefined, undefined],
])('reads the author name form package.json', (field, expected) => {
	vol.fromJSON({
		'/package.json': stringify(Object.assign({}, field)),
	});

	const authorName = getAuthorName(json('/package.json'));

	expect(authorName).toBe(expected);
});
