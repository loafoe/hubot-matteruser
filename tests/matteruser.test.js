const {use} = require('../src/matteruser.js');

const robot = jest.fn();
const tested = use(robot);

beforeEach(() => {
  jest.resetModules() // Most important - it clears the cache
  tested.emit = jest.fn();
  robot.send = jest.fn();
  robot.on = jest.fn();
  robot.brain = jest.fn();
  robot.brain.on = jest.fn();
  robot.http = jest.fn();
  // robot.http = jest.fn().mockImplementation(() => ScopedClient.create());
  robot.logger = jest.fn();
  robot.logger.info = jest.fn();
  robot.logger.debug = jest.fn();
  robot.logger.error = jest.fn();
  robot.logger.emergency = jest.fn();
});

describe('Matteruser', () => {
  beforeEach(() => {
    const OLD_ENV = process.env;
    process.env = {...OLD_ENV}; // Make a copy
    process.env.MATTERMOST_HOST = '';
    process.env.MATTERMOST_USER = 'obiwan';
    process.env.MATTERMOST_PASSWORD = '';
    process.env.MATTERMOST_MFA_TOKEN = '';
    process.env.MATTERMOST_GROUP = '';
  });
  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('should create Matteruser', () => {
    const actual = use(robot);
    expect(actual).toBeDefined();
  });

  test('should I run Matteruser', () => {
    use(robot).run();
    expect(robot.brain.on).toBeCalledWith('loaded', expect.anything());
  });
});

describe('Matteruser Callbacks', () => {

  test('onOpen', () => {
    const actual = tested.open();
    expect(actual).toBeTruthy();
  });

  test('onError', () => {
    const actual = tested.error();
    expect(actual).toBeTruthy();
    expect(robot.logger.info).toBeCalled();
  });

  test('onConnected', () => {
    const actual = tested.onConnected();
    expect(actual).toBeTruthy();
    expect(tested.emit).toBeCalledWith('connected');
  });

  test('onHello', () => {
    const actual = tested.onHello({data: {server_version: '5'}});
    expect(actual).toBeTruthy();
    expect(robot.logger.info).toBeCalled();
  });

  test('loggedIn', () => {
    const actual = tested.loggedIn({username: 'Obiwan'});
    expect(actual).toBeTruthy();
    expect(robot.logger.info).toBeCalled();
    expect(tested.self).toEqual({username: 'Obiwan'});
  });

  test('profilesLoaded', () => {
    tested.userChange = jest.fn();
    const actual = tested.profilesLoaded([
      {username: 'Obiwan'},
      {username: 'Luke'},
    ]);
    expect(actual).toHaveLength(2);
    expect(tested.userChange).toBeCalledTimes(2);
  });

  test('brainLoaded', () => {
    tested.userChange = jest.fn();
    tested.client = {};
    tested.client.users = {
      'okenobi': {id: 'okenobi', username: 'Obiwan'},
      'lskywalker': {id: 'lskywalker', username: 'Luke'},
    };
    const actual = tested.brainLoaded();
    expect(actual).toBeTruthy();
    expect(tested.userChange).toBeCalledTimes(2);
  });
});

describe('Matteruser misc', () => {
  beforeEach(() => {
    tested.client = {};
    tested.client.setChannelHeader = jest.fn().mockReturnValue(true);
    tested.client.findChannelByName = jest.fn().mockImplementation(channel => ({id: 42, name: channel}));
  });

  test('should change channel header', () => {
    const actual = tested.changeHeader('jedi', 'May the force be with you');
    expect(actual).toBeTruthy();
    expect(tested.client.findChannelByName).toBeCalled();
    expect(tested.client.setChannelHeader).toBeCalledWith(42, 'May the force be with you');
  });

  test('should failed to change channel header', () => {
    const actual = tested.changeHeader( 'May the force be with you');
    expect(tested.client.findChannelByName).not.toBeCalled();
    expect(tested.client.setChannelHeader).not.toBeCalledWith(42, 'May the force be with you');
  });
});
