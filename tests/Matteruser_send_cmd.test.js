const {matterUserAfterEnv, matterUserBeforeEnv} = require("./helpers/test-helpers");

const {use} = require('../src/matteruser.js');
jest.mock('mattermost-client');

let robot, tested;

beforeAll(matterUserBeforeEnv);
afterAll(matterUserAfterEnv);

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules() // Most important - it clears the cache

  robot = require('robot');
  tested = use(robot);
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
      callback({id: 'bfett'});
    });

    tested.send({room: 'bfett'}, 'May the', '4th Be', 'with you');
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(1, "May the", "bfett");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(2, "4th Be", "bfett");
    expect(tested.client.postMessage).toHaveBeenNthCalledWith(3, "with you", "bfett");
  });
});

describe('MatterUser command', () => {
  test('should command to mattermost user', () => {
    tested.cmd({room: 'tatooine'}, 'May the', '4th Be', 'with you');

    expect(tested.client.postCommand).toHaveBeenNthCalledWith(1, "tatooine", "May the");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(2, "tatooine", "4th Be");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(3, "tatooine", "with you");
  });

  test('should command to mattermost channel with channel id', () => {
    tested.client.findChannelByName.mockImplementation(room => ({id: 'tatooine_id'}));
    tested.cmd({room: 'tatooine'}, 'May the', '4th Be', 'with you');

    expect(tested.client.postCommand).toHaveBeenNthCalledWith(1, "tatooine_id", "May the");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(2, "tatooine_id", "4th Be");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(3, "tatooine_id", "with you");
  });

  test('should command to mattermost user', () => {
    tested.cmd({room: 'okenobi'}, 'May the', '4th Be', 'with you');
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(1, "66", "May the");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(2, "66", "4th Be");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(3, "66", "with you");
  });

  test('should command to mattermost user', () => {
    tested.client.getUserDirectMessageChannel.mockImplementation((user_id, callback) => {
      callback({id: 'bfett'});
    });

    tested.cmd({room: 'bfett'}, 'May the', '4th Be', 'with you');
    expect(tested.client.getUserDirectMessageChannel).toHaveBeenCalled();

    expect(tested.client.postCommand).toHaveBeenNthCalledWith(1, "bfett", "May the");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(2, "bfett", "4th Be");
    expect(tested.client.postCommand).toHaveBeenNthCalledWith(3, "bfett", "with you");
  });
});
