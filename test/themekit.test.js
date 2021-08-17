const themekit = require('../src/themekit');
const core = require('@actions/core');

test('getAssets', async () => {
   const themeID = process.env.SHOPIFY_THEME_ID
  console.log(await themekit.getAssets(themeID, 'asset[content_type]=application/json'))
}, 300000);

test('getIgnoredTemplates', async () => {
  const themeID = process.env.SHOPIFY_THEME_ID
  console.log(await themekit.getIgnoredTemplates(themeID))
}, 300000);


test('createShopifyTheme ', async () => {
  console.log(await themekit.createTheme('TEST-001'))
}, 300000);


test('deleteShopifyTheme ', async () => {
  console.log(await themekit.deleteTheme('TEST-001'))
}, 300000);



test('getShopifyThemes ', async () => {
  console.log(await themekit.getThemes())
}, 300000);
