const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const REPOSITORY = core.getInput('REPOSITORY');
    const PR = core.getInput('PR');
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context = {} } = github;
    const { pull_request } = context.payload;

    await octokit.request(`POST /repos/${REPOSITORY}/issues/${PR}/labels`)
    await octokit.issues.createLabel({
        ...context.repo,
        issue_number: pull_request.number,
        labels: ["ForceMerged"]
    });
}

run();