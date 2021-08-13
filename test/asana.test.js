const themekit = require('../src/themekit');
const core = require('@actions/core');

test('adds 1 + 2 to equal 3', async () => {
  const themeId = core.getInput('SHOPIFY_THEME_ID', { required: true });
  console.log(themeId)
  console.log(await themekit.getAssets(themeId, {'asset[content_type]': 'application/json'}))
  expect(3).toBe(3);
}, 300000);
