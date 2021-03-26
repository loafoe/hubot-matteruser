const {use} = require('../src/matteruser.js');
const MatterMostClient = require('mattermost-client');
jest.mock('mattermost-client');

const robot = require('robot');
const tested = use(robot);

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules() // Most important - it clears the cache
  tested.client = jest.fn();
  tested.emit = jest.fn();
});

describe('Matteruser', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  });
  let OLD_ENV = {}
  beforeEach(() => {
    OLD_ENV = process.env;
    process.env = {...OLD_ENV}; // Make a copy
    process.env.MATTERMOST_HOST = '';
    process.env.MATTERMOST_USER = 'obiwan';
    process.env.MATTERMOST_PASSWORD = '';
    process.env.MATTERMOST_MFA_TOKEN = '';
    process.env.MATTERMOST_GROUP = '';
  });
  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('should create Matteruser', () => {
    const actual = use(robot);
    expect(actual).toBeDefined();
    expect(mockExit).not.toHaveBeenCalled();
  });

  test('should I login Matteruser', () => {
    use(robot).run();
    expect(robot.brain.on).toBeCalledWith('loaded', expect.anything());
    expect(mockExit).not.toHaveBeenCalled();
    expect(MatterMostClient).toHaveBeenCalled();
    expect(MatterMostClient.prototype.login).toHaveBeenCalled();
  });

  test('should I login Matteruser with token', () => {
    process.env.MATTERMOST_ACCESS_TOKEN = 'token';
    use(robot).run();
    expect(robot.brain.on).toBeCalledWith('loaded', expect.anything());
    expect(mockExit).not.toHaveBeenCalled();
    expect(MatterMostClient).toHaveBeenCalled();
    expect(MatterMostClient.prototype.tokenLogin).toHaveBeenCalled();
  });

  test.each([
    ['MATTERMOST_HOST'],
    ['MATTERMOST_USER'],
    ['MATTERMOST_PASSWORD'],
    ['MATTERMOST_GROUP'],
  ])('should fail run Matteruser without %s', (envvar) => {
    delete process.env[envvar];

    use(robot).run();
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(robot.logger.emergency)
      .toHaveBeenNthCalledWith(1, expect.stringContaining(envvar))
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
    tested.changeHeader('May the force be with you');
    expect(tested.client.findChannelByName).not.toBeCalled();
    expect(tested.client.setChannelHeader).not.toBeCalledWith(42, 'May the force be with you');
  });
});
