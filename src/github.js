const github = require("@actions/github");
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const commentIdentifier =
  "<!-- Comment by Shopify Theme Deploy Previews Action -->";
const REGEX = new RegExp(
  `https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+)`,
  'g'
);

const labelToNotMerge = "No Preview";
const partOfDevIdLabel = "dev";

async function createGitHubDeployment(url) {
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
async function createGitHubComment(prID, message) {
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
async function getPullRequestID() {
  
  return github.context.issue.number;
};

/**
 * Will return the Pull Request body 
 * @returns
 */
async function getPullRequestBody() {
  return github.context.payload.pull_request.body;
};

/**
 * Will return the Pull Request URL 
 * @returns
 */
async function getPullRequestURL() {
  return github.context.payload.pull_request.html_url;
};


/**
 * Will return if Pull Request label is compared
 * @returns
 */
 async function getPullRequestLabel() {
  const pullRequestLabels = github.context.payload.pull_request.labels;
  if (!!pullRequestLabels.length) {
    return pullRequestLabels.find(label => label.name.toLowerCase() === labelToNotMerge.toLowerCase());
  } else {
    return null;
  }
};

/**
 * It finds label e.g. dev-ns-theme_id to take data from this theme
 * @returns
 */
 function getDevIdFromPRsLabel() {
  const pullRequestLabels = github.context.payload.pull_request.labels;
  if (!!pullRequestLabels.length) {
    return pullRequestLabels.find(label => {
      const labelLowered = label.name.toLowerCase();
      const labelSplitted = labelLowered.split('-');
      console.log('label');
      console.log(label);
      console.log('labelLowered');
      console.log(labelLowered);
      console.log('labelSplitted');
      console.log(labelSplitted);
      if (labelSplitted.includes(partOfDevIdLabel.toLowerCase())) {
        const id = labelSplitted[labelSplitted.length - 1];
        console.log("Development theme id is " + id);
        return id;
      }
    });
  } else {
    console.log("Development theme id is null");
    return null;
  }
};

/**
 * Will return the repository name 
 * @returns
 */
async function getRepositoryName() {
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
    getPullRequestLabel,
    getDevIdFromPRsLabel,
    getRepositoryName
}