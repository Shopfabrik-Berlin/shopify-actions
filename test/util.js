const mockOctokit = {
    repos: {
        createDeployment: jest.fn(),
        createDeploymentStatus: jest.fn()
    },
    rest: {
        issues: {
            createComment: jest.fn(),
            listComments: jest.fn(),
            updateComment: jest.fn()
        },
        repos: {
            listPullRequestsAssociatedWithCommit: jest.fn(),
            getBranch: jest.fn(),
            getCommit: jest.fn()
        }
    }
}


const mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn()
}



module.exports = {
    mockOctokit,
    mockAxios
}