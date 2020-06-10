import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import PropTypes from 'prop-types';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Terminal, TerminalText } from '../components/Terminal';
import { VisuallyHidden } from '../components/VisuallyHidden';
import styles from './index.module.css';

const features = [
	<>Doesn’t overwrite your data unless you want to</>,
	<>
		Minimal changes: keeps the original file formatting or read the style from
		EditorConfig
	</>,
	<>
		Minimal configuration: tries to infer configuration from the project itself
		or from the environment
	</>,
	<>
		<Link to="/docs/mrm-task-codecov">Customizable tasks</Link> for popular
		tools like ESLint, Prettier, lint-staged, etc. included
	</>,
	<>
		<Link to="/docs/making-tasks">Custom tasks</Link> and{' '}
		<Link to="/docs/mrm-core">tools</Link> to work with JSON, YAML, INI,
		Markdown and new line separated text files
	</>,
	<>
		Sharing tasks via npm and grouping them into{' '}
		<Link to="/docs/making-presets">presets</Link>
	</>,
];

function Feature({ children }) {
	return (
		<div className="col col--4">
			<p>{children}</p>
		</div>
	);
}

Feature.propTypes = {
	children: PropTypes.node.isRequired,
};

function Resource({ href, title, cover }) {
	return (
		<Link to={href} className="col col--6">
			<img src={useBaseUrl(cover)} alt={title} />
		</Link>
	);
}

Resource.propTypes = {
	href: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	cover: PropTypes.string.isRequired,
};

function Home() {
	const context = useDocusaurusContext();
	const { siteConfig = {} } = context;
	return (
		<Layout
			title="Mrm: codemods for your project config files"
			description={siteConfig.tagline}
		>
			<header className={classnames('hero hero--primary', styles.heroBanner)}>
				<div className="container">
					<h1 className="hero__title">{siteConfig.title}</h1>
					<p className="hero__subtitle">{siteConfig.tagline}</p>
					<div>
						<Link className="button button--lg" to="/docs/getting-started">
							Get Started
						</Link>
					</div>
				</div>
			</header>
			<main className={styles.main}>
				<div className="container">
					<section className={styles.section}>
						<VisuallyHidden as="h2">What is Mrm</VisuallyHidden>
						<p>
							Command line tool to help you keep configuration (
							<code>package.json</code>, <code>.gitignore</code>,{' '}
							<code>.eslintrc</code>, etc.) of your open source projects in
							sync.
						</p>
					</section>
					<section className={styles.section} aria-hidden="true">
						<Terminal>
							<TerminalText color="white">
								~/my-new-awesome-project
							</TerminalText>
							<br />
							<TerminalText color="green">❯ npx</TerminalText> mrm license
							readme contributing
							<br />
							<TerminalText color="cyan">Running license...</TerminalText>
							<br />
							<TerminalText color="green">Create License.md</TerminalText>
							<br />
							<TerminalText color="cyan">Running readme...</TerminalText>
							<br />
							<TerminalText color="green">Create Readme.md</TerminalText>
							<br />
							<TerminalText color="cyan">Running contributing...</TerminalText>
							<br />
							<TerminalText color="green">Create Contributing.md</TerminalText>
							<br />
							<br />
							<TerminalText color="white">
								~/my-new-awesome-project
							</TerminalText>
							<br />
							<TerminalText color="green">❯ </TerminalText>
						</Terminal>
					</section>
					<section className={styles.section}>
						<VisuallyHidden as="h2">Mrm features</VisuallyHidden>
						<div className="row">
							{features.map((feature, idx) => (
								<Feature key={idx}>{feature}</Feature>
							))}
						</div>
					</section>
					<section className={styles.section}>
						<VisuallyHidden as="h2">Mrm use cases</VisuallyHidden>
						<h3>Want to hack quickly on some idea?</h3>
						<p>
							Install everything you need for a basic JavaScript project with a
							single command, and start working in less than a minute:
						</p>
						<CodeBlock language="bash">{`git init && npx mrm package editorconfig gitignore eslint prettier lint-staged`}</CodeBlock>
					</section>
					<section className={styles.section}>
						<h3>Ready to share your project with the world?</h3>
						<p>
							Run Mrm again to bootstrap basic docs, and tweak them as you like.
						</p>
						<CodeBlock language="bash">{`npx mrm license readme contributing`}</CodeBlock>
					</section>
					<section className={styles.section}>
						<h3>Want to work on a very old project?</h3>
						<p>
							Run the same commands again to upgrade and migrate all the
							configs.
						</p>
						<CodeBlock language="bash">{`npx mrm package editorconfig gitignore eslint prettier lint-staged`}</CodeBlock>
					</section>
					<section className={styles.section}>
						<h2>Learn more about Mrm</h2>
						<div className="row">
							<Resource
								href="https://www.youtube.com/watch?v=5tHfAf4bRcM"
								title="Watch 'Automating open source project configuration with Mrm' talk"
								cover="img/mrm-video.jpg"
							/>
							<Resource
								href="https://blog.sapegin.me/all/mrm/"
								title="Read 'Automating open source project configuration with Mrm' article"
								cover="img/mrm-article.png"
							/>
						</div>
					</section>
				</div>
			</main>
		</Layout>
	);
}

export default Home;
