const { yaml } = require('mrm-core');

module.exports = function task({ workflowFile }) {
	// Create workflow file (no update)
	const workflowYml = yaml(workflowFile);
	if (!workflowYml.exists()) {
		workflowYml
			.merge({
				name: 'Dependabot Automerge',
				on: 'pull_request',
				jobs: {
					worker: {
						'runs-on': 'ubuntu-latest',
						if: "github.actor == 'dependabot[bot]'",
						steps: [
							{
								uses: 'actions/github-script@v3',
								with: {
									script: `github.pulls.createReview({
  owner: context.payload.repository.owner.login,
  repo: context.payload.repository.name,
  pull_number: context.payload.pull_request.number,
  event: 'APPROVE'
})
github.pulls.merge({
  owner: context.payload.repository.owner.login,
  repo: context.payload.repository.name,
  pull_number: context.payload.pull_request.number,
  merge_method: 'squash'
})`,
								},
							},
						],
					},
				},
			})
			.save();
	}
};

module.exports.description =
	'Adds GitHub Actions workflow to automerge Dependabot pull requests';
module.exports.parameters = {
	workflowFile: {
		type: 'input',
		message: 'Enter location of GitHub Actions workflow file',
		default: '.github/workflows/dependabot.yml',
	},
};
