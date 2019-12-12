/* eslint-disable no-console */

const _log = require('../log');
const info = _log.info;
const added = _log.added;
const removed = _log.removed;

const console$log = console.log;

beforeEach(() => {
	console.log = jest.fn();
});

afterEach(() => {
	console.log = console$log;
});

describe('info()', () => {
	it('should print a regular message', () => {
		info('pizza');
		expect(console.log).toBeCalledWith('pizza');
	});
});

describe('added()', () => {
	it('should print a message', () => {
		added('coffee');
		expect(console.log).toBeCalledWith(expect.stringMatching('coffee'));
	});
});

describe('remove()', () => {
	it('should print a message', () => {
		removed('shawarma');
		expect(console.log).toBeCalledWith(expect.stringMatching('shawarma'));
	});
});
