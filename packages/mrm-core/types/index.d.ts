declare module 'mrm-core' {
	import * as child_process from 'child_process';

	interface File {
		exists(): boolean;
		get(): string;
		getStyle(): EditorConfigStyle;
		getIndent(): string;
		save(content: string): this;
		delete(): void;
	}
	
	interface Ini {
		exists(): boolean;
		get(): any;
		get(section?: string): any;
		set(section: string, value: any): this;
		unset(section: string): this;
		save(): this;
		delete(): void;
	}
	
	interface Json {
		exists(): boolean;
		get(): any;
		get(address: string | string[], defaultValue?: any): any;
		set(address: string | string[], value: any): this;
		set(value: any): this;
		unset(address: string | string[]): this;
		merge(value: object): this;
		save(): this;
		delete(): void;
	}
	
	interface Lines {
		exists(): boolean;
		get(): string[];
		set(values: string[]): this;
		add(values: string | string[]): this;
		remove(values: string | string[]): this;
		save(): this;
		delete(): void;
	}
	
	interface Markdown {
		exists(): boolean;
		get(): string;
		addBadge(imageUrl: string, linkUrl: string, altText?: string): this;
		removeBadge(
			predicate: (badge: {
				imageUrl: string;
				linkUrl: string;
				altText: string;
			}) => boolean
		): this;
		save(): this;
		delete(): void;
	}
	
	interface Template {
		exists(): boolean;
		get(): string;
		apply(...args: object[]): this;
		save(): this;
		delete(): void;
	}
	
	interface Yaml {
		exists(): boolean;
		get(): any;
		get(address: string | string[], defaultValue?: any): any;
		set(address: string | string[], value: any): this;
		unset(address: string | string[]): this;
		merge(value: object): this;
		save(): this;
		delete(): void;
	}
	
	interface PackageJson extends Json {
		getScript(name: string, subcommand?: string): string;
		setScript(name: string, command: string): this;
		appendScript(name: string, command: string): this;
		prependScript(name: string, command: string): this;
		removeScript(name: RegExp | string, match?: RegExp | string): this;
	}
	
	interface CopyFilesOptions {
		overwrite?: boolean;
	}
	
	interface NpmOptions {
		dev?: boolean;
		yarn?: boolean;
		yarnBerry?: boolean;
		pnpm?: boolean;
		versions?: Dependencies;
	}
	
	interface EditorConfigStyle {
		indent_style?: 'tab' | 'space' | 'unset';
		indent_size?: number | 'tab' | 'unset';
		insert_final_newline?: true | false | 'unset';
	}
	
	interface Dependencies {
		[key: string]: string;
	}
	
	class MrmError extends Error {
		constructor(message: string, extra?: any);
	}

	// File system
	function readFile(filename: string): string;
	function updateFile(filename: string, content: string, exists: boolean): void;
	function copyFiles(
		sourceDir: string,
		files: string | string[],
		options?: CopyFilesOptions
	): void;
	function deleteFiles(files: string | string[]): void;
	function makeDirs(dirs: string | string[]): void;

	// npm
	type SpawnSyncReturn = ReturnType<typeof child_process.spawnSync>;
	function install(
		deps: string | string[] | Dependencies,
		options?: NpmOptions
	): SpawnSyncReturn | void;
	function install<E extends (...args: any) => any>(
		deps: string | string[] | Dependencies,
		options?: NpmOptions,
		exec?: E
	): ReturnType<E> | void;
	function uninstall(
		deps: string | string[],
		options?: NpmOptions
	): SpawnSyncReturn | void;
	function uninstall<E extends (...args: any) => any>(
		deps: string | string[],
		options?: NpmOptions,
		exec?: E
	): ReturnType<E> | void;

	// EditorConfig
	function inferStyle(source: string): EditorConfigStyle;
	function getStyleForFile(filepath: string): EditorConfigStyle;
	function getIndent(style: EditorConfigStyle): string;
	function format(source: string, style: EditorConfigStyle): string;

	// Misc utils
	function getExtsFromCommand(
		command: string,
		arg?: string
	): string[] | undefined;

	// Formats
	function file(filename: string): File;
	function ini(filename: string, comment?: string): Ini;
	function json(filename: string, defaultValue?: object): Json;
	function lines(filename: string, defaultValue?: string[]): Lines;
	function markdown(filename: string): Markdown;
	function template(filename: string, templateFile: string): Template;
	function yaml(filename: string, defaultValue?: object, options?: {version?: string}): Yaml;

	// Special files
	function packageJson(defaultValue?: object): PackageJson;
}
