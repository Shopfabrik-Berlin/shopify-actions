const {
    deployShopifyTheme,
    createShopifyTheme,
    getIgnoredTemplates,
    downloadShopifyTheme,
    deployShopifyThemeByName,
    deleteShopifyThemes
  } = require('./themekit');
const {
    getPullRequestID,
    createGitHubComment,
    commentIdentifier,
    getPullRequestBody,
    parseGithubPR,
    getPullRequestURL,
    getPullRequestLabel,
    getRepositoryName
  } = require('./github');
const {
    asanaComment,
    asanaCreateTicket,
    asanaGetTicket,
    asanaCompleteTicket
  } = require('./asana');
const PREVIEW_NAME = process.env.SHOPIFY_PREVIEW_NAME || "⚠[PREVIEW] - Shopfabrik"


/**
 * 
 * Will deploy a theme 
 * 
 */
async function deploy(){
    const themeID = process.env.SHOPIFY_THEME_ID
    // getIgnoredTemplates - Shopify 2.0 Themes will save customizer config in templates/*.json
    // to not override settings we need to ignore templates that already exist   
    const ignoredFiles = [
        ...await getIgnoredTemplates(themeID),
        'config/settings_data.json',
        'locales/*'
    ]
    await deployShopifyTheme(themeID, {
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
    const theme = await createShopifyTheme(name)
    console.log("TEST", theme, prID)
    const URL = `http://${storeURL}/?preview_theme_id=${theme.id}`;
    const prComment =  `🚀 Deployed successfully to ${URL}`
    // themkit issue - (Section type 'xxx' does not refer to an existing section file) because theme is empty
    // first we need to deploy all sections + snippets and then the template files

    // Do no deploy if PR label contains 'X'
    const containsIgnoredLabel = await getPullRequestLabel();
    if (!!!containsIgnoredLabel ) {
        await deployShopifyThemeByName(name, {
            ignoredFiles: ['templates/']
        })
        await deployShopifyThemeByName(name, {
            ignoredFiles: ['sections/', 'snippets/', 'locales/', 'layout/', 'config/', 'assets/']
        })
        await createGitHubComment(prID, prComment)
    }
    
    const prBody = await getPullRequestBody()
    const result = await parseGithubPR(prBody)
    if(result && result.task && result.project){
        const prURL = await getPullRequestURL()
        const repositoryName = await getRepositoryName()
        await asanaComment(
            result.task, 
            `${prComment}\n Github Pull Request: ${prURL}`
        )
        // Check if ticket already exists
        const existingTicket = await asanaGetTicket(repositoryName, prID);
        if (!!!existingTicket) {
            await asanaCreateTicket(repositoryName, prURL, URL, prID)
        }
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
    const prBody = await getPullRequestBody()
    const result = await parseGithubPR(prBody)
    console.log('removing preview')
    if(result && result.task && result.project){
        const repositoryName = await getRepositoryName()
        const existingTicket = await asanaGetTicket(repositoryName, prID);
        if (!!existingTicket) {
            console.log('completing ticket with:', existingTicket.gid)
            await asanaCompleteTicket(existingTicket.gid)
        }
    }
    await deleteShopifyThemes(name)
}



/**
 * 
 * Will backup the production template
 * The workflow .yml will also push it to a "backup" branch 
 * 
 */
async function backup(){
    const themeID = process.env.SHOPIFY_THEME_ID
    await downloadShopifyTheme(themeID)
}




module.exports = {
    deploy,
    preview,
    previewDelete,
    backup
}