const { mockOctokit, mockAxios } = require('./util');
const shopifyThemekit = require('@shopify/themekit');
const github = require("@actions/github");
const axios = require('axios');
axios.create = () => mockAxios
github.getOctokit = () => mockOctokit
jest.mock('@shopify/themekit');
const actions = require('../src/actions');
const themekit = require('../src/themekit');

jest.mock('../src/themekit');
themekit.getShopifyAssets.mockImplementation(() => {
  return [
    {
      key: 'templates/404.json'
    }
  ]
});
beforeAll(() => {
  // Mock github context
  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: "",
      repo: ""
    }
  })

  jest.spyOn(github.context, 'issue', 'get').mockImplementation(() => {
    return {
      number: 3
    }
  })
  github.context.ref = ""
  github.context.payload = {
    pull_request: {
      body: "",
      html_url: ""
    },
    repository: {
      name: ""
    }
  }
});

test('test preview action', async () => {
  const themeName = "⚠[PREVIEW] - Shopfabrik #3"
  const themeID = "124541731022"
  mockAxios.get.mockResolvedValue({
      status: 200,
      data: {
        themes: [
          {
            name: themeName,
            id: themeID
          }
        ]
      }
  });
  mockAxios.post.mockResolvedValue({
    status: 201,
    data: {
      theme: {
        name: themeName,
        id: themeID
      }
    }
  });
  await actions.preview()
  expect(shopifyThemekit.command).toHaveBeenCalledTimes(2);
  expect(shopifyThemekit.command).toHaveBeenCalledWith('deploy',  {
    dir: "./test/theme",
    nodelete: true,
    password: process.env.SHOPIFY_PASSWORD,
    store: process.env.SHOPIFY_STORE_URL,
    allowLive: true,
    themeid: themeID,
    timeout: '120s',
    ignoredFiles: ['templates/']
  });
  expect(shopifyThemekit.command).toHaveBeenCalledWith('deploy',  {
    dir: "./test/theme",
    nodelete: true,
    password: process.env.SHOPIFY_PASSWORD,
    store: process.env.SHOPIFY_STORE_URL,
    allowLive: true,
    themeid: themeID,
    timeout: '120s',
    ignoredFiles: ['sections/', 'snippets/', 'locales/', 'layout/', 'config/', 'assets/']
  });

  expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledTimes(1);

}, 180000 /** 3 min*/);


test('test deploy action', async () => {
  
  await actions.deploy()

  expect(shopifyThemekit.command).toHaveBeenCalledTimes(1);
  expect(shopifyThemekit.command).toHaveBeenCalledWith('deploy',  {
    dir: "./test/theme",
    nodelete: true,
    password: process.env.SHOPIFY_PASSWORD,
    store: process.env.SHOPIFY_STORE_URL,
    allowLive: true,
    themeid: "124541731022",
    timeout: '120s',
    ignoredFiles: [
      'templates/404.json',
      'templates/article.json',
      'templates/blog.json',
      'templates/cart.json',
      'templates/collection.json',
      'templates/index.json',
      'templates/list-collections.json',
      'templates/page.contact.json',
      'templates/page.json',
      'templates/password.json',
      'templates/product.json',
      'templates/search.json',
      'config/settings_data.json',
      'locales/*',
      'templates/*.json'
    ]
  });
});


test('test preview delete action', async () => {
  const themeName = "⚠[PREVIEW] - Shopfabrik #3"
  const themeID = "124541731022"
  mockAxios.delete.mockResolvedValue({
    status: 200,
    data: {
      theme: {
        id: themeID
      }
    }
  });
  mockAxios.get.mockResolvedValue({
      status: 200,
      data: {
        themes: [
          {
            name: themeName,
            id: themeID
          }
        ]
      }
  });
  await actions.previewDelete()
  expect(mockAxios.delete).toHaveBeenCalledTimes(1);
  expect(mockAxios.delete).toHaveBeenCalledWith(`/themes/${themeID}.json`, {
    theme: {
      name: themeName
    }
  })
});


// test('test backup action', async () => {
//   await actions.backup()
// });
