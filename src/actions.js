const {
    deployTheme,
    createTheme,
    getIgnoredTemplates,
    downloadTheme,
    deployThemeByName,
    deleteTheme
  } = require('./themekit');
const {
    getPullRequestID,
    createGitHubComment,
    commentIdentifier,
    getPullRequestBody,
    parseGithubPR,
    getPullRequestURL,
    getRepositoryName
  } = require('./github');
const {
    asanaComment,
    asanaCreateTicket
  } = require('./asana');
const asana = require('asana');
const PREVIEW_NAME = "⚠[PREVIEW] - Shopfabrik"


async function deploy(){
    const themeID = process.env.SHOPIFY_THEME_ID
    const ignoredFiles = [...await getIgnoredTemplates(themeID), 'config/settings_data.json', 'locales/']
    await deployTheme(themeID, {
        ignoredFiles
    })
}


async function preview(){
    const prID = await getPullRequestID()
    const name = `${PREVIEW_NAME} #${prID}`
    const storeURL = process.env.SHOPIFY_STORE_URL
    const theme = await createTheme(name)
    const URL = `http://${storeURL}/?preview_theme_id=${theme.id}`;
    const prComment =  `${commentIdentifier}\n🚀 Deployed successfully to ${URL}`
    // themkit issue - (Section type 'xxx' does not refer to an existing section file) because theme is empty
    // first we need to deploy all sections + snippets and then the template files
    await deployThemeByName(name, {
        ignoredFiles: ['templates/']
    })
    await deployThemeByName(name, {
        ignoredFiles: ['sections/', 'snippets/', 'locales/', 'layout/', 'config/', 'assets/']
    })
    await createGitHubComment(prID, prComment)
    const prBody = await getPullRequestBody()
    const result = await parseGithubPR(prBody)
    if(result && result.task && result.project){
        const prURL = await getPullRequestURL()
        const repositoryName = await getRepositoryName()
        await asanaComment(
            result.task, 
            `${prComment}\n Github Pull Request: ${prURL}`
        )
        await asanaCreateTicket(repositoryName, prURL, `\n${prComment}`)
    }
}


async function previewDelete(){
    const prID = await getPullRequestID()
    const name = `${PREVIEW_NAME} #${prID}`
    await deleteTheme(name)
}



async function backup(){
    const themeID = process.env.SHOPIFY_THEME_ID
    await downloadTheme(themeID)
}




module.exports = {
    deploy,
    preview,
    previewDelete,
    backup
}