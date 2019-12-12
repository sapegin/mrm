const index = require('../index');

it('should contain all API functions', () => {
	expect(index).toEqual(
		expect.objectContaining({
			readFile: expect.any(Function),
			updateFile: expect.any(Function),
			copyFiles: expect.any(Function),
			makeDirs: expect.any(Function),
			MrmError: expect.any(Function),
			file: expect.any(Function),
			ini: expect.any(Function),
			json: expect.any(Function),
			lines: expect.any(Function),
			markdown: expect.any(Function),
			template: expect.any(Function),
			yaml: expect.any(Function),
			packageJson: expect.any(Function),
			install: expect.any(Function),
			uninstall: expect.any(Function),
			inferStyle: expect.any(Function),
			getStyleForFile: expect.any(Function),
			getIndent: expect.any(Function),
			format: expect.any(Function),
			getExtsFromCommand: expect.any(Function),
		})
	);
});
