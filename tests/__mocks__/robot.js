const {HUBOT_SELF_USER, USER_WITH_CHANNEL, USER_WITHOUT_CHANNEL} = require("../helpers/samples");

const robot = {
  name: 'hubot'
};
robot.send = jest.fn();
robot.receive = jest.fn();
robot.on = jest.fn();

robot.brain = jest.fn();
robot.brain.on = jest.fn();
robot.brain.data = {};
robot.brain.data.users = {
  'okenobi': USER_WITH_CHANNEL,
  'bfett': USER_WITHOUT_CHANNEL,
  [HUBOT_SELF_USER.id]: HUBOT_SELF_USER,
};
robot.brain.userForId = (userId, newUser) => {
  if (newUser !== undefined) {
    robot.brain.data.users[userId] = newUser;
  }
  return robot.brain.data.users[userId];
};
robot.brain.userForName = (userName) => {
  if (userName === undefined) {
    return null;
  } else if (userName === 'okenobi') {
    return robot.brain.data.users[userName];
  } else if (userName === 'bfett') {
    return robot.brain.data.users[userName];
  } else {
    return null;
  }
};

robot.http = jest.fn();
// robot.http = jest.fn().mockImplementation(() => ScopedClient.create());

robot.logger = jest.fn();
robot.logger.info = jest.fn();
robot.logger.debug = jest.fn();
robot.logger.error = jest.fn();
robot.logger.emergency = jest.fn();

module.exports = robot;
