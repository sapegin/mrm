const merge = require('../merge');

it('merge() should merge arrays without duplicates', () => {
	const result = merge({ _: ['a', 'b'] }, { _: ['a', 'c'] });
	expect(result).toEqual({ _: ['a', 'b', 'c'] });
});

it('merge() should merge arrays of objects without duplicates', () => {
	const result = merge(
		{ _: [{ a: 1 }, { b: 2 }] },
		{ _: [{ a: 1 }, { c: 3 }] }
	);
	expect(result).toEqual({ _: [{ a: 1 }, { b: 2 }, { c: 3 }] });
});

it('merge() should not remove existing array items', () => {
	const result = merge({ _: ['a', 'a', 'b'] }, { _: ['a'] });
	expect(result).toEqual({ _: ['a', 'a', 'b'] });
});
