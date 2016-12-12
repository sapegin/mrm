'use strict';

class MrmError extends Error {
	constructor(message) {
		super();
		Error.captureStackTrace(this, this.constructor);
		this.name = 'MrmError';
		this.message = message;
	}
}

module.exports = MrmError;
