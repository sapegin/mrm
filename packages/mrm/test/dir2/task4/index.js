module.exports = jest.fn((options, params) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			params.stack.push('Task 2.4');
			resolve();
		}, 10);
	});
});
module.exports.description = 'Taks 2.4';
