const {matterUserAfterEnv, matterUserBeforeEnv} = require("./helpers/test-helpers");

const {use} = require('../src/matteruser.js');
jest.mock('mattermost-client');

const robot = require('robot');
const tested = use(robot);


beforeAll(matterUserBeforeEnv);
afterAll(matterUserAfterEnv);

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules() // Most important - it clears the cache

  tested.run();
  tested.emit = jest.fn();
});

describe('MatterUser reply', () => {
  test('should reply', () => {

  });
});
