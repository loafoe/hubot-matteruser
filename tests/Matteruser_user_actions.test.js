const {HUBOT_SELF_USER} = require("./helpers/samples");
const {use} = require('../src/matteruser.js');
jest.mock('mattermost-client');

const robot = require('robot');
const tested = use(robot);

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules() // Most important - it clears the cache
  tested.self = HUBOT_SELF_USER;
  tested.client = jest.fn();
  tested.client.loadChannels = jest.fn();
  tested.emit = jest.fn();
});

describe('MatterUser userChenge', () => {
  test('should change user', () => {
    const actual = tested.userChange({
      id: 'okenobi',
      username: 'okenobi',
      first_name: 'Obiwan',
      last_name: 'Kenobi',
      email: 'obiwan.kenobi@matteruser.com',
    });

    expect(actual).toEqual({
      id: 'okenobi',
      name: 'okenobi',
      real_name: 'Obiwan Kenobi',
      email_address: 'obiwan.kenobi@matteruser.com',
      faction: 'jedi',
      room: 'okenobi',
      username: 'Obiwan Kenobi',
      mm: {
        dm_channel_id: '66',
        id: 'okenobi',
        username: 'okenobi',
        first_name: 'Obiwan',
        last_name: 'Kenobi',
        email: 'obiwan.kenobi@matteruser.com'
      }
    });
  });

  test('should change user without user', () => {
    const actual = tested.userChange({
      username: 'okenobi',
      first_name: 'Obiwan',
      last_name: 'Kenobi',
      email: 'obiwan.kenobi@matteruser.com',
    });

    expect(actual).toBeFalsy();
  });
});

describe('MatterUser userTyping', () => {
  test('should see user typing', () => {
    const actual = tested.userTyping({});
    expect(actual).toBeTruthy();
  });
});

describe('MatterUser userAdded', () => {
  test('should add user', () => {
    tested.client.getUserByID = jest.fn().mockReturnValue(HUBOT_SELF_USER);
    let spyUserChange = jest.spyOn(tested, 'userChange').mockImplementation(() => true);
    let spyReceive = jest.spyOn(tested, 'receive');
    const actual = tested.userAdded({
      data: {
        user_id: HUBOT_SELF_USER.id
      },
      broadcast: {
        channel_id: 'jedi'
      }
    });

    expect(actual).toBeTruthy();
    expect(tested.client.loadChannels).toHaveBeenCalled();
    expect(spyUserChange).toHaveBeenCalledWith(HUBOT_SELF_USER);
    expect(spyReceive).toHaveBeenCalledWith({
      room: 'jedi',
      done: false,
      user: {
        id: "matterbot",
        mm: {dm_channel_id: "66"},
        username: "Hubot",
        room: 'jedi',
      }
    });
  });
});
