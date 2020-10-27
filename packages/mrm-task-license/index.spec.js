jest.mock('fs');
jest.mock('mrm-core/src/util/log', () => ({
	added: jest.fn(),
}));

const fs = jest.requireActual('fs');
const path = require('path');
const { getConfigGetter } = require('mrm');
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

it('should add EditorConfig', () => {
	vol.fromJSON({
		[`${__dirname}/templates/MIT.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/MIT.md'))
			.toString(),
	});

	task(getConfigGetter(config));

	expect(vol.toJSON()['/License.md']).toMatchSnapshot();
});

it('should read license name from package.json', () => {
	vol.fromJSON({
		[`${__dirname}/templates/Apache-2.0.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Apache-2.0.md'))
			.toString(),
		'/package.json': stringify({
			name: 'unicorn',
			license: 'Apache-2.0',
		}),
	});

	task(getConfigGetter(config));

	expect(vol.toJSON()['/License.md']).toMatchSnapshot();
});

it('should skip when template not found', () => {
	task(
		getConfigGetter({
			name: 'Gendalf',
			email: 'gendalf@middleearth.com',
			url: 'https://middleearth.com',
		})
	);

	expect(console.log).toBeCalledWith(expect.stringMatching('skipping'));
});

it('should use license config argument', () => {
	vol.fromJSON({
		[`${__dirname}/templates/Unlicense.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/Unlicense.md'))
			.toString(),
	});

	task(
		getConfigGetter({
			license: 'Unlicense',
		})
	);

	expect(vol.readFileSync('/License.md', 'utf8')).toMatchSnapshot();
});

it('adds license to package.json if not set', () => {
	vol.fromJSON({
		[`${__dirname}/templates/MIT.md`]: fs
			.readFileSync(path.join(__dirname, 'templates/MIT.md'))
			.toString(),
	});

	task(getConfigGetter(config));

	expect(json('/package.json').get('license')).toBe('MIT');
});

it.each([
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
])('Should get author name form package.json', (field, expected) => {
	vol.fromJSON({
		'/package.json': stringify(Object.assign({}, field)),
	});

	const authorName = getAuthorName(json('/package.json'));

	expect(authorName).toBe(expected);
});
