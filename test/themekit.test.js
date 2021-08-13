const themekit = require('../src/themekit');
const core = require('@actions/core');

// test('adds 1 + 2 to equal 3', async () => {
//    const themeID = process.env.SHOPIFY_THEME_ID
//   console.log(themeID)
//   console.log(await themekit.getAssets(themeID, {'asset[content_type]': 'application/json'}))
//   expect(3).toBe(3);
// }, 300000);

test('getIgnoredTemplates', async () => {
  const themeID = process.env.SHOPIFY_THEME_ID
  console.log(await themekit.getIgnoredTemplates(themeID))
}, 300000);

