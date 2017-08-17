// @ts-check
'use strict';

class MrmUnknownTask extends Error {
	constructor(message) {
		super(message);
		Object.defineProperty(this, 'name', {
			value: this.constructor.name,
		});
	}
}

class MrmUndefinedOption extends Error {
	constructor(message, extra) {
		super(message);
		Object.defineProperty(this, 'name', {
			value: this.constructor.name,
		});
		Object.defineProperty(this, 'extra', {
			value: extra,
		});
	}
}

module.exports = {
	MrmUnknownTask,
	MrmUndefinedOption,
};
