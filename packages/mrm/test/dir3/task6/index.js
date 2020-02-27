module.exports = jest.fn();
module.exports.description = 'Taks 3.6';
module.exports.parameters = {
	'first-config': {
		type: 'input',
		message: 'Please, fulfil this first interactive input',
	},
	'second-config': {
		type: 'input',
		message: 'Please, fulfil this second interactive input',
		default: 'default value',
	},
	'third-config': {
		type: 'input',
		message: 'Please, fulfil this third interactive input',
		default: jest.fn(() => 'default value'),
	},
};
