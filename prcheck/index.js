const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const FORCE_MERGED = core.getInput('FORCE_MERGED');
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context = {} } = github;
    const { pull_request } = context.payload;

    if (FORCE_MERGED == '1') {
        return await applyForceMergedLabel(octokit, context, pull_request);
    } else if (!await getCombinedSuccess(octokit, { owner: context.repo.owner, repo: context.repo.repo, pull_number: pull_request.number })) {
        await applyForceMergedLabel(octokit, context, pull_request);
    }
}

async function applyForceMergedLabel(octokit, context, pull_request) {
    return await octokit.request(`POST /repos/${context.repo.owner}/${context.repo.repo}/issues/${pull_request.number}/labels`, {
        labels: ["ForceMerged"]
    });
}

const QUERY = `query($owner: String!, $repo: String!, $pull_number: Int!) {
  repository(owner: $owner, name:$repo) {
    pullRequest(number:$pull_number) {
      commits(last: 1) {
        nodes {
          commit {
            statusCheckRollup {
              state
            }
          }
        }
      }
    }
  }
}`

async function getCombinedSuccess(octokit, { owner, repo, pull_number}) {
    const result = await octokit.graphql(QUERY, { owner, repo, pull_number });
    const [{ commit: lastCommit }] = result.repository.pullRequest.commits.nodes;
    if (lastCommit.statusCheckRollup === null) {
        return false;
    } else {
        return lastCommit.statusCheckRollup.state === "SUCCESS"
    }
}

run();
