// @ts-check

class MrmError extends Error {
	/**
	 * @param {string} message
	 * @param {any} [extra]
	 */
	constructor(message, extra) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		Object.defineProperty(this, 'name', {
			value: this.constructor.name,
		});
		Object.defineProperty(this, 'extra', {
			value: extra,
		});
	}
}

module.exports = MrmError;
