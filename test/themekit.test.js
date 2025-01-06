const themekit = require('../src/themekit');

test('getShopifyAssets', async () => {
   const themeID = process.env.SHOPIFY_THEME_ID
  console.log(await themekit.getShopifyAssets(themeID, 'asset[content_type]=application/json'))
}, 300000);

test('getIgnoredTemplates', async () => {
  const themeID = process.env.SHOPIFY_THEME_ID
  console.log(await themekit.getIgnoredTemplates(themeID))
}, 300000);


test('createShopifyTheme ', async () => {
  console.log(await themekit.createShopifyTheme('TEST-001'))
}, 300000);


test('deleteShopifyTheme ', async () => {
  console.log(await themekit.deleteShopifyThemes('TEST-001'))
}, 300000);


test('getShopifyThemes ', async () => {
  console.log(await themekit.getShopifyThemes())
}, 300000);
