const {
    deployTheme,
    createTheme,
    getIgnoredTemplates,
    downloadTheme,
    deployThemeByName
  } = require('./themekit');
  const {
    getPullRequestID
  } = require('./github');


async function deploy(){
    const themeID = process.env.SHOPIFY_THEME_ID
    const ignoredFiles = [...await getIgnoredTemplates(themeID), 'config/settings_data.json', 'locales/']
    await deployTheme(themeID, {
        ignoredFiles
    })
}


async function preview(){
    const prID = await getPullRequestID()
    const name = `⚠[PREVIEW] - Shopfabrik #${prID}`
    await createTheme(name)
    await deployThemeByName(name, {
        ignoredFiles: []
    })
}


async function previewDelete(){
    const prID = await getPullRequestID()
    const name = `⚠[PREVIEW] - Shopfabrik #${prID}`
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