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

describe('MatterUser send', () => {
  test('should send envelop to mattermost user', () => {
    tested.send({room: 'tatooine'}, 'May the', '4th Be', 'with you');

    expect(tested.client.postMessage).toHaveBeenNthCalledWith(1, "May the", "tatooine");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(2, "4th Be", "tatooine");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(3, "with you", "tatooine");
  });

  test('should send envelop to mattermost channel with channel id', () => {
    tested.client.findChannelByName.mockImplementation(room => ({id: 'tatooine_id'}));
    tested.send({room: 'tatooine'}, 'May the', '4th Be', 'with you');

    expect(tested.client.postMessage).toHaveBeenNthCalledWith(1, "May the", "tatooine_id");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(2, "4th Be", "tatooine_id");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(3, "with you", "tatooine_id");
  });

  test('should send envelop to mattermost user', () => {
    tested.send({room: 'okenobi'}, 'May the', '4th Be', 'with you');
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(1, "May the", "66");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(2, "4th Be", "66");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(3, "with you", "66");
  });

  test('should send envelop to mattermost user', () => {
    tested.client.getUserDirectMessageChannel.mockImplementation((user_id, callback) => {
      callback({id: 'lskywalker'});
    });

    tested.send({room: 'lskywalker'}, 'May the', '4th Be', 'with you');
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(1, "May the", "lskywalker");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(2, "4th Be", "lskywalker");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(3, "with you", "lskywalker");
  });
});
