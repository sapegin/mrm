const fs = require('fs');
const { lines } = require('mrm-core');

function task() {
	const remove = ['node_modules'];
	const add = [
		'node_modules/',
		'.DS_Store',
		'Thumbs.db',
		'.idea/',
		'.vscode/',
		'*.sublime-project',
		'*.sublime-workspace',
		'*.log',
	];

	// If project uses npm, ignore yarn.lock
	if (fs.existsSync('package-lock.json')) {
		add.push('yarn.lock');
		remove.push('package-lock.json');
	}

	// If project uses Yarn, ignore package-lock.json
	if (fs.existsSync('yarn.lock')) {
		remove.push('yarn.lock');
		add.push('package-lock.json');
	}

	// .gitignore
	lines('.gitignore')
		.remove(remove)
		.add(add)
		.save();
}

task.description = 'Adds .gitignore';
module.exports = task;
