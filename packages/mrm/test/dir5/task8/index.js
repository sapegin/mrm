module.exports = jest.fn();
module.exports.description = 'Taks 5.8';
module.exports.parameters = {
	'interactive-config': {
		type: 'input',
		message: 'Please, fulfil this first interactive input',
		validate: value => (value === 'pizza' ? true : 'Invalid!'),
	},
	'static-config': {
		type: 'config',
		default: 'default value',
	},
};
