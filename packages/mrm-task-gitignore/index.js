const fs = require('fs');
const { lines } = require('mrm-core');

module.exports = function task() {
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

	// If project uses npm, ignore yarn.lock and pnpm-lock.yaml
	if (fs.existsSync('package-lock.json')) {
		add.push('yarn.lock');
		add.push('pnpm-lock.yaml');
		remove.push('package-lock.json');
	}

	// If project uses Yarn, ignore package-lock.json and pnpm-lock.yaml
	if (fs.existsSync('yarn.lock')) {
		remove.push('yarn.lock');
		add.push('package-lock.json');
		add.push('pnpm-lock.yaml');
	}

	// If project uses pnpm, ignore package-lock.json and yarn.lock
	if (fs.existsSync('pnpm-lock.yaml')) {
		remove.push('pnpm-lock.yaml');
		add.push('yarn.lock');
		add.push('package-lock.json');
	}

	// .gitignore
	lines('.gitignore').remove(remove).add(add).save();
};

module.exports.description = 'Adds .gitignore';
