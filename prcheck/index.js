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
    }

    console.log(github, pull_request);

    const sha = context.sha;
    const statuses = await getAllPages(octokit, `GET /repos/freshdesk/collab-vienna/statuses/${sha}`);
    const finalStatus = new Map();
    for (const status of statuses) {
        if (!finalStatus.has(status.context)) {
            finalStatus.set(status.context, status.state);
        }
    }
    console.log(finalStatus);
    if (Array.from(finalStatus.values()).some(status => status !== "success")) {
        await applyForceMergedLabel(octokit, context, pull_request);
    }
}

async function applyForceMergedLabel(octokit, context, pull_request) {
    return await octokit.request(`POST /repos/${context.repo.owner}/${context.repo.repo}/issues/${pull_request.number}/labels`, {
        labels: ["ForceMerged"]
    });
}

async function getAllPages(octokit, requestUrl, requestParams) {
    let response;
    let allResults = [];
    if (!requestParams) {
        requestParams = {};
    }
    let page = 1;
    do {
        response = await octokit.request(requestUrl, { ...requestParams, per_page: 100, page });
        allResults = [...allResults, ...response.data];
        page = page + 1;
    } while (response.data.length === 100);
    return allResults;
}

run();
