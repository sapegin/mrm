import React from 'react';
import PropTypes from 'prop-types';
import styles from './Terminal.module.css';

export const Terminal = ({ children, ...rest }) => (
	<div className={styles.terminal} {...rest}>
		{children}
	</div>
);

Terminal.propTypes = {
	children: PropTypes.node,
};

export const TerminalText = ({ children, color, ...rest }) => (
	<span className={styles[`text__${color}`]} {...rest}>
		{children}
	</span>
);

TerminalText.propTypes = {
	children: PropTypes.node.isRequired,
	color: PropTypes.string.isRequired,
};
