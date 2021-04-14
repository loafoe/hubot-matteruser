/**
 * @type {User}
 */
exports.HUBOT_SELF_USER = {
  id: 'matterbot',
  username: 'Hubot',
  room: 'bot-channel',
  mm: {
    dm_channel_id: '66'
  },
}

/**
 * @type {User}
 */
exports.USER_WITH_CHANNEL = {
  id: 'okenobi',
  username: 'Obiwan Kenobi',
  room: 'okenobi',
  mm: {
    dm_channel_id: '66'
  },
  faction: 'jedi',
}

/**
 * @type {User}
 */
exports.USER_WITHOUT_CHANNEL = {
  id: 'bfett',
  username: 'Boba Fett',
  room: 'bfett',
}
