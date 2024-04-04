const {
    deployShopifyTheme,
    createShopifyTheme,
    getIgnoredTemplates,
    downloadShopifyTheme,
    deployShopifyThemeByName,
    deleteShopifyThemes,
    getParcelFiles
} = require('./themekit');
const {
    getPullRequestID,
    createGitHubComment,
    commentIdentifier,
    getPullRequestBody,
    parseGithubPR,
    getPullRequestURL,
    getPullRequestLabel,
    getDevIdFromPRsLabel,
    getRepositoryName
} = require('./github');
const {
    asanaHasDeployComment,
    asanaComment,
    asanaCreateTicket,
    asanaGetTicket,
    asanaCompleteTicket
} = require('./asana');

const PREVIEW_NAME = process.env.SHOPIFY_PREVIEW_NAME || "⚠[PREVIEW] - Shopfabrik"

const axios = require('axios');


/**
 * 
 * Will deploy a theme 
 * 
 */
async function deploy() {
    const themeID = process.env.SHOPIFY_THEME_ID
    if (!themeID) {
        console.error('Theme is NOT found to deploy, themeID is ' + themeID);
        return;
    } else {
        console.log('Theme is found to deploy, themeID is ' + themeID);
    }
    // getIgnoredTemplates - Shopify 2.0 Themes will save customizer config in templates/*.json
    // to not override settings we need to ignore templates that already exist   
    const ignoredFiles = [
        ...await getIgnoredTemplates(themeID),
        'config/settings_data.json',
        'locales/*',
        'sections/*.json',
    ]
    await deployShopifyTheme(themeID, {
        ignoredFiles
    })
}

/**
 * 
 * Will remove old parcel files
 * 
 */
async function clean() {
    var getAssetsConfig = {
        method: 'get',
        url: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2022-07/themes/${process.env.SHOPIFY_THEME_ID}/assets.json`,
        headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': `${process.env.SHOPIFY_PASSWORD}`}
    };

    const assets = await axios(getAssetsConfig)
        .then(function (response) {
            return response.data.assets;
        })
        .catch(function (error) {
            console.log(error);
        });

    const parcelFiles = assets.filter(asset => asset.key.includes('parcel'));
    const parcelFilesTimestamps = [];
    
    parcelFiles.forEach(file => {
        const splittedKey = file.key.split('.');
        const timestamp = +splittedKey[splittedKey.length - 2];
        parcelFilesTimestamps.push(timestamp);
    });

    const parcelFilesTimestampsSet = [...new Set(parcelFilesTimestamps)];
    const criticalcssFiles = assets.filter(asset => asset.key.includes('snippets/critical-') && asset.key.includes('min.css.liquid'));

    if (parcelFilesTimestampsSet.length <= 1 && criticalcssFiles.length < 1) {
        return;
    }

    const latestTimestamp = Math.max(...parcelFilesTimestampsSet);
    const parcelFilesFiltered = parcelFiles.filter(file => !(file.key.includes(latestTimestamp)));
    const parcelFilesToRemove = parcelFilesFiltered.length > 0 ? parcelFilesFiltered : [];
    const toRemove = parcelFilesToRemove.concat(criticalcssFiles);

    toRemove.forEach(file => {
        var delAssetConfig = {
            method: 'delete',
            url: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2022-07/themes/${process.env.SHOPIFY_THEME_ID}/assets.json?asset[key]=${file.key}`,
            headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': `${process.env.SHOPIFY_PASSWORD}` }
        };
        axios(delAssetConfig)
            .then(function (response) {
                console.log(`${file.key} was successfully deleted!`);
                return response;
            })
            .catch(function (error) {
                console.log(`${file.key} was not deleted!`);
                console.log(error);
            });
    });
}

/**
 * 
 * Will create a new theme for previw 
 * This is based on a pull request
 * Additionally it will comment to ASANA Issue 
 * It will also create an Issue in a Pull Request Project to check the PR by senior dev
 * 
 */
async function preview() {
    const containsIgnoredLabel = await getPullRequestLabel();
    if (containsIgnoredLabel) {
        return;
    }
    const prID = await getPullRequestID()
    const name = `${PREVIEW_NAME} #${prID}`
    const storeURL = process.env.SHOPIFY_STORE_URL
    const theme = await createShopifyTheme(name)
    console.log("TEST", theme, prID)
    const URL = `http://${storeURL}/?preview_theme_id=${theme.id}`;
    const prComment = `Automated Message: 🚀 Deployed successfully to ${URL}`
    // themkit issue - (Section type 'xxx' does not refer to an existing section file) because theme is empty
    // first we need to deploy all sections + snippets and then the template files

    // Do no deploy if PR label contains 'X'
    if (!!!containsIgnoredLabel) {
        // Files: sections/*.liquid
        await deployShopifyThemeByName(name, {
            ignoredFiles: ['templates/', 'sections/*.json']
        })
        // Files: sections/*.json
        await deployShopifyThemeByName(name, {
            ignoredFiles: ['sections/*.liquid', 'snippets/', 'locales/', 'layout/', 'config/', 'assets/']
        })
        const labelDev = await getDevIdFromPRsLabel();
        if (labelDev) {
            const labelDevLowered = labelDev.name.toLowerCase();
            const labelDevSplitted = labelDevLowered.split('-');
            const devThemeId = labelDevSplitted[labelDevSplitted.length - 1];
            await downloadShopifyTheme(devThemeId, {
                ignoredFiles: ['sections/*.liquid', 'snippets/', 'layout/', 'assets/']
            }).catch((error) => {
                console.log("Couldn't downloadShopifyTheme using this devThemeId - " + devThemeId);
                console.log(error);
            });
            await deployShopifyThemeByName(name, {
                ignoredFiles: ['sections/*.liquid', 'snippets/', 'layout/', 'assets/']
            }).catch((error) => {
                console.log(error);
            });
        }
        await createGitHubComment(prID, prComment)
    }

    const prBody = await getPullRequestBody()
    const result = await parseGithubPR(prBody)
    if (result && result.task && result.project) {
        const prURL = await getPullRequestURL()
        //const repositoryName = await getRepositoryName()
        const hasDeployComment = await asanaHasDeployComment(result.task)
        if (!hasDeployComment) {
            await asanaComment(
                result.task,
                `${prComment}\n Github Pull Request: ${prURL}`
            )
        }
        // Check if ticket already exists
        // const existingTicket = await asanaGetTicket(repositoryName, prID);
        // if (!!!existingTicket) {
        //     await asanaCreateTicket(repositoryName, prURL, URL, prID)
        // }
    }
}

/**
 * 
 * Will delete a Pull Request after merge or close
 * 
 */
async function previewDelete() {
    const prID = await getPullRequestID()
    const name = `${PREVIEW_NAME} #${prID}`
    const prBody = await getPullRequestBody()
    const result = await parseGithubPR(prBody)
    console.log('removing preview')
    if (result && result.task && result.project) {
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
async function backup() {
    const themeID = process.env.SHOPIFY_THEME_ID
    await downloadShopifyTheme(themeID)
}




module.exports = {
    deploy,
    preview,
    previewDelete,
    backup,
    clean
}
