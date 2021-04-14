const {use} = require('../src/matteruser.js');
jest.mock('mattermost-client');

const robot = require('robot');
const tested = use(robot);

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules() // Most important - it clears the cache
  tested.client = jest.fn();
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
