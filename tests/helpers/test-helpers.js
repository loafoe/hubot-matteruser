let OLD_ENV = {}
function matterUserBeforeEnv() {
  OLD_ENV = process.env;
  process.env = {...OLD_ENV}; // Make a copy
  process.env.MATTERMOST_HOST = '';
  process.env.MATTERMOST_USER = 'obiwan';
  process.env.MATTERMOST_PASSWORD = '';
  process.env.MATTERMOST_MFA_TOKEN = '';
  process.env.MATTERMOST_GROUP = '';
}

function matterUserAfterEnv() {
  process.env = OLD_ENV;
}

module.exports = {
  matterUserBeforeEnv,
  matterUserAfterEnv,
};
