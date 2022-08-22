const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context = {} } = github;
    const { pull_request } = context.payload;

    console.log(`POST /repos/${context.repo.owner}/${context.repo.repo}/issues/${pull_request.number}/labels`);

    await octokit.request(`POST /repos/${context.repo.owner}/${context.repo.repo}/issues/${pull_request.number}/labels`, {
        labels: ["ForceMerged"]
    });
}

run();