const {matterUserAfterEnv, matterUserBeforeEnv} = require("./helpers/test-helpers");
const {HUBOT_SELF_USER, USER_WITH_CHANNEL, USER_WITHOUT_CHANNEL} = require("./helpers/samples");

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
  tested.mmNoReply = false;
  tested.self = HUBOT_SELF_USER
});

describe('MatterUser reply', () => {
  test('should reply with no reply', () => {
    tested.mmNoReply = true;
    const spy = jest.spyOn(tested, 'send');
    const envelope = {
      room: 'jedi',
      user: USER_WITH_CHANNEL,
      message: {id: '42'}
    };
    tested.reply(envelope, "May the force", "Be with you");

    expect(spy).toHaveBeenCalledWith(envelope, "May the force", "Be with you");
  });

  test('should reply on existing direct message channel', () => {
    tested.reply({
      room: 'okenobi',
      user: USER_WITH_CHANNEL,
      message: {id: '42'}
    }, "May the force", "Be with you");

    expect(tested.client.findChannelByName).not.toHaveBeenCalled();
    expect(tested.client.customMessage).toHaveBeenNthCalledWith(1, {
      channel_id: '66',
      create_at: 0,
      filename: [],
      message: 'May the force',
      parent_id: '42',
      root_id: '42',
      user_id: 'matterbot',
    }, '66');
  });

  test('should reply on public channel', () => {
    tested.reply({
      room: 'jedi',
      user: USER_WITH_CHANNEL,
      message: {id: '42'}
    }, "May the force", "Be with you");

    expect(tested.client.findChannelByName).toHaveBeenCalledWith('jedi');
    expect(tested.client.customMessage).toHaveBeenNthCalledWith(1, {
      channel_id: 'jedi',
      create_at: 0,
      filename: [],
      message: 'May the force',
      parent_id: '42',
      root_id: '42',
      user_id: 'matterbot',
    }, 'jedi');
  });

  test('should reply on new direct message channel', () => {
    tested.client.getUserDirectMessageChannel.mockImplementation((user_id, callback) => {
      callback({id: 'bfett'});
    });

    tested.reply({
      room: 'bfett',
      user: USER_WITHOUT_CHANNEL,
      message: {id: '42'}
    }, "May the force", "Be with you");

    expect(tested.client.findChannelByName).not.toHaveBeenCalled();
    expect(tested.client.getUserDirectMessageChannel).toHaveBeenNthCalledWith(1, 'bfett', expect.anything());
    expect(tested.client.customMessage).toHaveBeenNthCalledWith(1, {
      channel_id: 'bfett',
      create_at: 0,
      filename: [],
      message: 'May the force',
      parent_id: '42',
      root_id: '42',
      user_id: 'matterbot',
    }, 'bfett');
  });
});
