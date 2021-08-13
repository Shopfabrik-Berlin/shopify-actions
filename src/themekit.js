const Shopify = require('shopify-api-node');
const themeKit = require('@shopify/themekit');
const { getOctokitOptions } = require('@actions/github/lib/utils');

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_STORE_URL,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
});
const themeDirPath = process.env.SHOPIFY_THEME_DIR_PATH || 'test/theme';

const deleteTheme = async function deleteShopifyThemes(name) {
  const theme = await findTheme(name);
  if (theme) {
    console.log(`Found theme: ${name} with ID: ${theme.id}, deleting...`);
    await shopify.theme.delete(theme.id);
  } else{
    console.log(`Couldn't find theme: ${name}.`);
  }
};


const createTheme = async function createShopifyTheme(name) {
    const theme = await findTheme(name);
    if (!theme) {
      await shopify.theme.create({
          name
      });
    } else{
        console.log(`Found theme: ${name} with ID: ${theme.id}, deleting...`);
    }
  };

const findTheme = async function findShopifyTheme(name) {
  const themes = await getThemes();
  return themes.find(theme => theme.name === name);
};

const getThemes = async function getShopifyThemes(name) {
  return await shopify.theme.list();
};

const getAssets = async function getShopifyAssets(themeID, params) {
    return await shopify.asset.list(themeID, params);
};

const deployTheme = async function deployShopifyTheme(id, {ignoredFiles}) {
    if (id) {
        console.log(`Found theme with ID: ${id}, deploying...`);
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


const downloadTheme = async function downloadShopifyTheme(id, options) {
    if (id) {
        console.log(`Found theme with ID: ${id}, deploying...`);
        return await themeKit.command('download', {
        dir: themeDirPath,
        password: process.env.SHOPIFY_PASSWORD,
        store: process.env.SHOPIFY_STORE_URL,
        themeid: id,
        timeout: '120s',
        ignoredFiles: options.ignoredFiles || ['config/settings_data.json', 'locales/', 'templates/*.json']
        });
    } else {
        console.log(`Theme ID does not exists ID: ${id} ... `)
    }
};

const deployThemeByName = async function deployShopifyThemeByName(name) {
    const theme = await findTheme(name);
    if (theme) {
        console.log(`Found theme: ${theme.name}, with ID: ${theme.id}, deploying...`);
       await deployShopifyTheme(theme.id)
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
  downloadTheme
};