# How to contribute

I love pull requests. And following this simple guidelines will make your pull request easier to merge.

## Submitting pull requests

1.  Create a new branch, please don’t work in master directly.
2.  Add failing tests (if there’re any tests in project) for the change you want to make. Run tests (see below) to see the tests fail.
3.  Hack on.
4.  Run tests to see if the tests pass. Repeat steps 2–4 until done.
5.  Update the documentation to reflect any changes.
6.  Push to your fork and submit a pull request.

## JavaScript code style

[See here](https://github.com/tamiadev/eslint-config-tamia#code-style-at-a-glance).

## Other notes

- If you have commit access to repository and want to make big change or not sure about something, make a new branch and open pull request.
- Don’t commit generated files: compiled from Stylus CSS, minified JavaScript, etc.
- Don’t change version number and change log.
- Install [EditorConfig](http://editorconfig.org/) plugin for your code editor.
- Feel free to [ask me](http://sapegin.me) anything you need.

## Windows & Visual Studio Code Devcontainer

While mrm operates on Windows, there are a number of developer tests which fail because the tests depend on Linux style file paths. The simplest way avoid compatiability problems is to use Visual Studio Code _[Devcontainer](https://code.visualstudio.com/docs/remote/containers#_getting-started)_ to deploy a preconfigured Docker development container running Linux. See the link about for requirements and installation requirements. To get good performance, in vscode: press F1 and the **Dev Containers: Clone Repository in Container Volume...** option. Then provide the location of your fork when prompted.

## Building and running tests

_Run these commands in the root folder of the repository._

Install dependencies and bootstrap [Lerna](https://github.com/lerna/lerna):

```bash
npm run bootstrap
```

Run tests for all packages:

```bash
npm test
```

Or run a watch mode:

```bash
npm run test:watch
```
