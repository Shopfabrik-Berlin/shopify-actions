const axios = require('axios');
const themeKit = require('@shopify/themekit');

const shopify = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2021-07`,
  headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': `${process.env.SHOPIFY_PASSWORD}`}
});

const themeDirPath = process.env.SHOPIFY_THEME_DIR_PATH || "."


/**
 * Will delete a theme by its name 
 * IMPORTANT: make sure you have no themes with the same name!
 * @param {*} name 
 */
async function deleteShopifyThemes(name) {
  const theme = await findShopifyTheme(name);
  if (theme) {
    console.log(`Found theme: ${name} with ID: ${theme.id}, deleting...`);
    const response = await shopify.delete(`/themes/${theme.id}.json`, {
      theme: {
        name
      }
    })
    if(response.status === 200){
      return response.data.theme
    } else {
      console.log(response)
      throw new Error(`Couldn't delete theme: ${name}.`)
    }
  } else{
    console.log(`Couldn't find theme: ${name}.`);
  }
};

/**
 * Will create a new theme in the shopify store
 * @param {*} name 
 * @returns 
 */
async function createShopifyTheme(name) {
    const theme = await findShopifyTheme(name);
    console.log('createShopifyTheme function');
    if (!theme) {
      console.log('!theme');
      const response = await shopify.post('/themes.json', {
        theme: {
          name
        }
      });
      console.log(response);
      console.log('response');
      if(response.status === 201){
        return response.data.theme
      } else {
        console.log(response)
        throw new Error(`Couldn't create theme: ${name}...`)
      }
    } else{
        console.log('theme found!');
        const parcelJS = await getParcelFiles();
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
async function findShopifyTheme(name) {
  const themes = await getShopifyThemes();
  return themes.find(theme => theme.name === name);
};

/**
 * Will get a list of all available themes on the shopify store
 * @returns 
 */
async function getShopifyThemes() {
  const response = await shopify.get('/themes.json')
  return response.data.themes
};


/**
 * Will get assests from a specific theme 
 * @param {*} themeID 
 * @param {*} params 
 * @returns 
 */
async function getShopifyAssets(themeID, params = '') {
    if(!themeID) {
      console.error("Couldn't find theme to getShopifyAssets, themeID is " + themeID);
      return;
    }
    console.log(`/themes/${themeID}/assets.json?${params}`)
    const response = await shopify.get(`/themes/${themeID}/assets.json?${params}`)
    return response.data.assets
};

/**
 * Will deploy a theme by its theme id
 * @param {*} id 
 * @param {*} param1 
 * @returns 
 */
async function deployShopifyTheme(id, {ignoredFiles} = {}) {
    if (id) {
        console.log(`Found theme with ID: ${id}, deploying...`, themeDirPath);
        console.log(`Files to ignore:`, ignoredFiles);
        return await themeKit.command('deploy', {
          dir: themeDirPath,
          nodelete: true,
          password: process.env.SHOPIFY_PASSWORD,
          store: process.env.SHOPIFY_STORE_URL,
          allowLive: true,
          themeid: id,
          timeout: '120s',
          ignoredFiles: ignoredFiles || []
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
async function downloadShopifyTheme(id, {ignoredFiles} = {}) {
    if (id) {
        console.log(`Found theme with ID: ${id}, downloading...`, themeDirPath);
        return await themeKit.command('download', {
          dir: themeDirPath,
          password: process.env.SHOPIFY_PASSWORD,
          store: process.env.SHOPIFY_STORE_URL,
          themeid: id,
          timeout: '120s',
          ignoredFiles: ignoredFiles || []
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
async function deployShopifyThemeByName(name, options) {
    const theme = await findShopifyTheme(name);
    if (theme) {
        console.log(`Found theme: ${theme.name}, with ID: ${theme.id}, deploying...`);
       await deployShopifyTheme(theme.id, options)
    } else {
        console.log(`Theme does not exists: ${name}...`)
    }
};

 

async function updateShopifyTheme(name) {
  const theme = await findShopifyTheme(name);
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
   const files = await getShopifyAssets(themeId, 'asset[content_type]=application/json')
   const ignoredFiles = []
   files.forEach((file) => {
        if(file.key.search('templates/.*\.json') !== -1){
            ignoredFiles.push(file.key)
        }
   })

   return ignoredFiles
}


/**
 * Will get a list of assets/*.parcel.*.js, assets/*.parcel.*.css, assets/index.parcel.js files that are in the theme
 * @param {*} themeId 
 * @returns 
 */
async function getParcelFiles(themeId) {
  try {
    const jsFiles = await getShopifyAssets(themeId, `asset[key]=assets/*.parcel.*.js`);
    console.log('jsFiles');
    console.log(jsFiles);
    return jsFiles;
  } catch (error) {
    console.log("Couldn't find any parcel files");
    console.error(error);
    return error;
  }
}

async function getThemekitVersion() {
  return await themeKit.command('version');
}


module.exports = {
  deleteShopifyThemes,
  createShopifyTheme,
  deployShopifyTheme,
  updateShopifyTheme,
  getShopifyThemes,
  getShopifyAssets,
  getIgnoredTemplates,
  downloadShopifyTheme,
  deployShopifyThemeByName,
  getParcelFiles
};