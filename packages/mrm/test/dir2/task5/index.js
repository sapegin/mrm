module.exports = jest.fn((options, params) => {
	return new Promise(resolve => {
		setTimeout(() => {
			params.stack.push('Task 2.5');
			resolve();
		});
	});
});
module.exports.description = 'Taks 2.5';
