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


/**
 * 
 * Will deploy a theme 
 * 
 */
async function deploy(){
    const themeID = process.env.SHOPIFY_THEME_ID
    // getIgnoredTemplates - Shopify 2.0 Themes will save customizer config in templates/*.json
    // to not override settings we need to ignore templates that already exist   
    const ignoredFiles = [...await getIgnoredTemplates(themeID), 'config/settings_data.json', 'locales/']
    await deployTheme(themeID, {
        ignoredFiles
    })
}


/**
 * 
 * Will create a new theme for previw 
 * This is based on a pull request
 * Additionally it will comment to ASANA Issue 
 * It will also create an Issue in a Pull Request Project to check the PR by senior dev
 * 
 */
async function preview(){
    const prID = await getPullRequestID()
    const name = `${PREVIEW_NAME} #${prID}`
    const storeURL = process.env.SHOPIFY_STORE_URL
    const theme = await createTheme(name)
    const URL = `http://${storeURL}/?preview_theme_id=${theme.id}`;
    const prComment =  `🚀 Deployed successfully to ${URL}`
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
        await asanaCreateTicket(repositoryName, prURL, `${prURL}<br/><br/>${prComment}`)
    }
}

/**
 * 
 * Will delete a Pull Request after merge or close
 * 
 */
async function previewDelete(){
    const prID = await getPullRequestID()
    const name = `${PREVIEW_NAME} #${prID}`
    await deleteTheme(name)
}



/**
 * 
 * Will backup the production template
 * The workflow .yml will also push it to a "backup" branch 
 * 
 */
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