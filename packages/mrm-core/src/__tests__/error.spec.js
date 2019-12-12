const MrmError = require('../error');

it('MrmError should be Error descendant', () => {
	const err = new MrmError();
	expect(err instanceof Error).toBeTruthy();
});

it('toString() should contain a proper class name', () => {
	const err = new MrmError('nope');
	expect(err.toString()).toMatch('MrmError');
});

it('toString() should contain a message', () => {
	const err = new MrmError('nope');
	expect(err.toString()).toMatch('nope');
});

it('should contain an extra data', () => {
	const extra = { foo: 42 };
	const err = new MrmError('nope', extra);
	expect(err.extra).toEqual(extra);
});
