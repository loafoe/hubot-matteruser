const robot = jest.fn();
robot.send = jest.fn();
robot.on = jest.fn();

robot.brain = jest.fn();
robot.brain.on = jest.fn();
robot.brain.data = {};
robot.brain.data.users = {
  'okenobi': {
    mm: {
      dm_channel_id: '66'
    }
  }
};
robot.brain.userForId = (userId, newUser) => {
  if (newUser !== undefined) {
    robot.brain.data.users[userId] = newUser;
  }
  return robot.brain.data.users[userId];
};

robot.http = jest.fn();
// robot.http = jest.fn().mockImplementation(() => ScopedClient.create());

robot.logger = jest.fn();
robot.logger.info = jest.fn();
robot.logger.debug = jest.fn();
robot.logger.error = jest.fn();
robot.logger.emergency = jest.fn();

module.exports = robot;
