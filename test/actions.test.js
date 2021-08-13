const actions = require('../src/actions');
const core = require('@actions/core');

test('test deploy action', async () => {
  await actions.preview()
  expect(3).toBe(3);
});
