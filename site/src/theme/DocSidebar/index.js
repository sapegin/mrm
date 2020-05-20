import React from 'react';
import useScript from '@charlietango/use-script';
import DocSidebarBase from '@theme-original/DocSidebar';
import styles from './styles.module.css';

function DocSidebar(props) {
	useScript('https://app.codefund.io/properties/816/funder.js');

	return (
		<div className={styles.sidebar}>
			<DocSidebarBase {...props} />
			<div id="codefund" className={styles.extra}></div>
		</div>
	);
}

export default DocSidebar;
