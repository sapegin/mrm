import React from 'react';
import PropTypes from 'prop-types';
import DocSidebarBase from '@theme-original/DocSidebar';
import { CarbonAds } from '../../components/CarbonAds';
import styles from './styles.module.css';

function Extra() {
	return (
		<div className={styles.extra}>
			<CarbonAds />
		</div>
	);
}

function DocSidebar({ showExtra, ...props }) {
	return (
		<div className={styles.sidebar}>
			{showExtra && <Extra key={props.path} />}
			<DocSidebarBase {...props} />
		</div>
	);
}

DocSidebar.propTypes = {
	path: PropTypes.string.isRequired,
	showExtra: PropTypes.bool,
};

DocSidebar.defaultProps = {
	showExtra: true,
};

export default DocSidebar;
