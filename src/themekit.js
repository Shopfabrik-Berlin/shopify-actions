const Shopify = require('shopify-api-node');
const themeKit = require('@shopify/themekit');
const { getOctokitOptions } = require('@actions/github/lib/utils');

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_URL,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
});
const themeDirPath = process.env.SHOPIFY_THEME_DIR_PATH || 'test/theme';


/**
 * Will delete a theme by its name 
 * IMPORTANT: make sure you have no themes with the same name!
 * @param {*} name 
 */
const deleteTheme = async function deleteShopifyThemes(name) {
  const theme = await findTheme(name);
  if (theme) {
    console.log(`Found theme: ${name} with ID: ${theme.id}, deleting...`);
    await shopify.theme.delete(theme.id);
  } else{
    console.log(`Couldn't find theme: ${name}.`);
  }
};

/**
 * Will create a new theme in the shopify store
 * @param {*} name 
 * @returns 
 */
const createTheme = async function createShopifyTheme(name) {
    const theme = await findTheme(name);
    if (!theme) {
      return await shopify.theme.create({
          name
      });
    } else{
        console.log(`Found theme: ${name} with ID: ${theme.id} ...`);
        return theme
    }
  };
/**
 * Will find a theme by its name
 * IMPORTANT: make sure you have no themes with the same name!
 * @param {*} name 
 * @returns 
 */
const findTheme = async function findShopifyTheme(name) {
  const themes = await getThemes();
  return themes.find(theme => theme.name === name);
};

/**
 * Will get a list of all available themes on the shopify store
 * @param {*} name 
 * @returns 
 */
const getThemes = async function getShopifyThemes(name) {
  return await shopify.theme.list();
};

/**
 * Will get assests from a specific theme 
 * @param {*} themeID 
 * @param {*} params 
 * @returns 
 */
const getAssets = async function getShopifyAssets(themeID, params) {
    return await shopify.asset.list(themeID, params);
};

/**
 * Will deploy a theme by its theme id
 * @param {*} id 
 * @param {*} param1 
 * @returns 
 */
const deployTheme = async function deployShopifyTheme(id, {ignoredFiles} = {}) {
    if (id) {
        console.log(`Found theme with ID: ${id}, deploying...`, themeDirPath);
        console.log(`Files to ignore:`, ignoredFiles);
        return await themeKit.command('deploy', {
        dir: themeDirPath,
        nodelete: true,
        password: process.env.SHOPIFY_PASSWORD,
        store: process.env.SHOPIFY_STORE_URL,
        themeid: id,
        timeout: '120s',
        ignoredFiles: ignoredFiles || ['config/settings_data.json', 'locales/', 'templates/*.json']
        });
    } else {
        console.log(`Theme ID does not exists ID: ${id} ... `)
    }
};

/**
 * Will download a theme by its theme id
 * @param {*} id 
 * @param {*} param1 
 * @returns 
 */
const downloadTheme = async function downloadShopifyTheme(id, {ignoredFiles} = {}) {
    if (id) {
        console.log(`Found theme with ID: ${id}, deploying...`, themeDirPath);
        return await themeKit.command('download', {
        dir: themeDirPath,
        password: process.env.SHOPIFY_PASSWORD,
        store: process.env.SHOPIFY_STORE_URL,
        themeid: id,
        timeout: '120s',
        ignoredFiles: ignoredFiles || ['config/settings_data.json', 'locales/', 'templates/*.json']
        });
    } else {
        console.log(`Theme ID does not exists ID: ${id} ... `)
    }
};


/**
 * Will deploy a theme by its name
 * IMPORTANT: make sure you have no themes with the same name!
 * @param {*} name 
 * @param {*} options 
 */
const deployThemeByName = async function deployShopifyThemeByName(name, options) {
    const theme = await findTheme(name);
    if (theme) {
        console.log(`Found theme: ${theme.name}, with ID: ${theme.id}, deploying...`);
       await deployTheme(theme.id, options)
    } else {
        console.log(`Theme does not exists: ${name}...`)
    }
};

 

const updateTheme = async function updateShopifyTheme(name) {
  const theme = await findTheme(name);
  if (theme) {
    return await themeKit.command('deploy', {
      dir: themeDirPath,
      nodelete: true,
      password: process.env.SHOPIFY_PASSWORD,
      store: process.env.SHOPIFY_STORE_URL,
      themeid: theme.id
    });
  } else {
    console.log(`Couldn't find theme: ${name}.`);
  }  
}

/**
 * Will get a list of templates/*.json files that are already deployed
 * Shopify 2.0 Themes will save customizer config in templates/*.json
 * to not override settings we need to ignore templates that already exist 
 * @param {*} themeId 
 * @returns 
 */
async function getIgnoredTemplates(themeId) {
   const files = await getAssets(themeId, {'asset[content_type]': 'application/json'})
   const ignoredFiles = []
   files.forEach((file) => {
        if(file.key.search('templates/*') !== -1){
            ignoredFiles.push(file.key)
        }
   })

   return ignoredFiles
}

module.exports = {
  deleteTheme,
  createTheme,
  deployTheme,
  updateTheme,
  getThemes,
  getAssets,
  getIgnoredTemplates,
  downloadTheme,
  deployThemeByName
};