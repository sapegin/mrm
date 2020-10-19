import React, { useRef, useEffect } from 'react';
import styles from './CarbonAds.module.css';

const CARBON_URL =
	'https://cdn.carbonads.com/carbon.js?serve=CEBIVK3W&placement=mrmjsorg';

export const CarbonAds = React.memo(() => {
	const ref = useRef();

	useEffect(() => {
		const container = ref.current;
		// Add a tiny delay because Docusaurus rerenders the sidebar twice
		// on first page load
		const timeout = setTimeout(() => {
			const script = document.createElement('script');
			script.src = CARBON_URL;
			script.async = true;
			script.id = '_carbonads_js';
			container.appendChild(script);
		}, 100);

		return () => clearTimeout(timeout);
	}, [ref]);

	return <div ref={ref} className={styles.carbon}></div>;
});
