const core = require("@actions/core");
const github = require("@actions/github");
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const commentIdentifier =
  "<!-- Comment by Shopify Theme Deploy Previews Action -->";

const parsePullRequestId = (githubRef) => {
  const result = /refs\/pull\/(\d+)\/merge/g.exec(githubRef);
  if (!result) throw new Error("Reference not found.");
  const [, pullRequestId] = result;
  return pullRequestId;
};

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

const createGitHubComment = async (prID, message) => {
  await octokit.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prID,
    body: message,
  });
};

  const findIssueComment = async (prID) => {
    const listRes = await octokit.issues.listComments({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prID,
    });
    const comments = listRes.data;
    for (const comment of comments) {
      if (comment.body.includes(commentIdentifier)) return comment.id;
    }
    return undefined;
  };


  const getRef = async () => {
    return  github.context.ref || process.env.GITHUB_REF;
  };

  const getPullRequestID = async () => {
    return  github.context.issue.number;
  };




module.exports = {
    getRef,
    getPullRequestID,
    createGitHubComment,
    commentIdentifier
}