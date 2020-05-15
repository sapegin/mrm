module.exports = {
	title: 'Mrm',
	tagline: 'Codemods for your project config files',
	url: 'https://mrm.js.org',
	baseUrl: '/',
	favicon: 'img/favicon.png',
	organizationName: 'sapegin',
	projectName: 'mrm',
	themeConfig: {
		disableDarkMode: true,
		prism: {
			theme: require('prism-react-renderer/themes/nightOwlLight'),
		},
		navbar: {
			hideOnScroll: false,
			title: 'Mrm',
			links: [
				{
					to: 'docs/getting-started',
					activeBasePath: 'docs',
					label: 'Docs',
					position: 'left',
				},
				{
					to: 'docs/mrm-preset-default',
					activeBasePath: 'docs',
					label: 'Presets',
					position: 'left',
				},
				{
					to: 'docs/mrm-task-codecov',
					activeBasePath: 'docs',
					label: 'Tasks',
					position: 'left',
				},
				{
					href: 'https://github.com/sapegin/mrm',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Changelog',
							href: 'https://github.com/sapegin/mrm/releases',
						},
						{
							label: 'Contributing',
							href:
								'https://github.com/sapegin/mrm/blob/master/Contributing.md',
						},
					],
				},
				{
					title: 'Social',
					items: [
						{
							label: 'Twitter',
							href: 'https://twitter.com/iamsapegin',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/sapegin/mrm',
						},
					],
				},
				{
					title: 'Sponsor',
					items: [
						{
							label: 'Buy me a coffee',
							href: 'https://www.buymeacoffee.com/sapegin',
						},
					],
				},
			],
			copyright: `Made with coffee in Berlin by <a href="https://sapegin.me/" class="footer__link-item" target="_blank" rel="noopener noreferrer">Artem Sapegin</a> and <a href="https://github.com/sapegin/mrm/graphs/contributors" class="footer__link-item" target="_blank" rel="noopener noreferrer">contributors</a>`,
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					remarkPlugins: require('./remark'),
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],
};
