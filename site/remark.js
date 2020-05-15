const visit = require('unist-util-visit');
const { kebabCase } = require('lodash');

const IGNORES = [
	'https://github.com/sapegin/mrm/tree/master/packages/mrm-task-license/templates',
];
const REPLACEMENTS = {
	'https://github.com/sapegin/mrm': 'https://mrm.js.org/',
	'../Readme.md#tasks': '/docs/mrm-task-codecov',
};
const PACKAGES_URL_PREFIX =
	'https://github.com/sapegin/mrm/tree/master/packages/';

const getDocUrl = url =>
	url
		.replace(/(\w+)(?:\.md)/, (_, $1) => kebabCase($1))
		.replace(/^\.\.\/\.\.\/docs\//, '/docs/')
		.replace(/^\.\//, '/docs/');

const getPacakgeUrl = url => `/docs/${url.replace(PACKAGES_URL_PREFIX, '')}`;

/*
 * Fix links:
 * Getting_started.md -> /docs/getting-started
 * https://github.com/sapegin/mrm/tree/master/packages/mrm-task-eslint -> /docs/mrm-task-eslint
 */
function link() {
	return ast =>
		visit(ast, 'link', node => {
			if (IGNORES.includes(node.url)) {
				return;
			}
			if (REPLACEMENTS[node.url]) {
				node.url = REPLACEMENTS[node.url];
			} else if (node.url.endsWith('.md') || node.url.includes('.md#')) {
				node.url = getDocUrl(node.url);
			} else if (node.url.startsWith(PACKAGES_URL_PREFIX)) {
				node.url = getPacakgeUrl(node.url);
			}
		});
}

module.exports = [link];
