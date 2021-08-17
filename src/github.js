const core = require("@actions/core");
const github = require("@actions/github");
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const commentIdentifier =
  "<!-- Comment by Shopify Theme Deploy Previews Action -->";
const REGEX = new RegExp(
  `https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+)`,
  'g'
);

const createGitHubDeployment = async (url) => {
  const deployment = await octokit.repos.createDeployment({
    auto_merge: false,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.ref,
    environment: "pull request",
  });
  await octokit.repos.createDeploymentStatus({
    state: "success",
    environment_url: url,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    deployment_id: deployment.data.id,
  });
};


/**
 * Will create a Github Comment on a Pull Request
 * @param {*} prID 
 * @param {*} message 
 */
const createGitHubComment = async (prID, message) => {
  await octokit.rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prID,
    body: message,
  });
};

/**
 * Will return the Pull Request ID (without #)
 * @returns
 */
const getPullRequestID = async () => {
  return github.context.issue.number;
};

/**
 * Will return the Pull Request body 
 * @returns
 */
const getPullRequestBody = async () => {
  return github.context.payload.pull_request.body;
};

/**
 * Will return the Pull Request URL 
 * @returns
 */
const getPullRequestURL = async () => {
  return github.context.payload.pull_request.html_url;
};

/**
 * Will return the repository name 
 * @returns
 */
const getRepositoryName = async () => {
  return github.context.payload.repository.name;
};
  

/**
 * Will parse the Asana URL from a Pull Request body
 * @param {*} prBody 
 * @returns 
 */
async function parseGithubPR(prBody){
  const result = REGEX.exec(prBody)
  if(result){
      return result.groups
  }
  return null
}


module.exports = {
    getPullRequestID,
    createGitHubComment,
    commentIdentifier,
    getPullRequestBody,
    parseGithubPR,
    getPullRequestURL,
    getRepositoryName
}