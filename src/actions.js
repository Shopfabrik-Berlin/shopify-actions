const {
    deployTheme,
    createTheme,
    getIgnoredTemplates,
    downloadTheme,
    deployThemeByName,
    deleteTheme
  } = require('./themekit');
  const {
    getPullRequestID
  } = require('./github');

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
    await createTheme(name)
    // themkit issue - (Section type 'xxx' does not refer to an existing section file) because theme is empty
    // first we need to deploy all sections + snippets and then the template files
    await deployThemeByName(name, {
        ignoredFiles: ['templates/']
    })
    await deployThemeByName(name, {
        ignoredFiles: []
    })
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