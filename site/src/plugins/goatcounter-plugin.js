module.exports = function() {
	return {
		name: 'goatcounter-plugin',
		injectHtmlTags() {
			return {
				headTags: [
					`<script>
window.goatcounter = { no_onload: true };
window.addEventListener('hashchange', function() {
	window.goatcounter.count({
		path: location.pathname + location.search + location.hash,
	})
})
					</script>`,
					{
						tagName: 'script',
						attributes: {
							'data-goatcounter': 'https://mrm.goatcounter.com/count',
							async: true,
							src: '//gc.zgo.at/count.js',
						},
					},
				],
			};
		},
	};
};
