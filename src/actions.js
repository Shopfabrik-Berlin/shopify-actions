const {
    deployTheme,
    createTheme,
    getIgnoredTemplates,
    downloadTheme
  } = require('./themekit');
  const {
    getPullRequestID
  } = require('./github');


async function deploy(){
    const themeID = process.env.SHOPIFY_THEME_ID
    const ignoreFiles = [...await getIgnoredTemplates(themeID), 'config/settings_data.json', 'locales/']
    console.log("Ignored Files: ", ignoreFiles)
    await deployTheme(themeID, {
        ignoreFiles
    })
}


async function preview(){
    const prID = await getPullRequestID()
    const name = `⚠[PREVIEW] - Shopfabrik #${prID}`
    await createTheme(name)
    await deployTheme(name)
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