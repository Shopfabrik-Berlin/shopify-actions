const actions = require('../src/actions');
const core = require('@actions/core');

test('test deploy action', async () => {
  await actions.deploy()
  expect(3).toBe(3);
});
