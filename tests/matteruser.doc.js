/**
 * Mattermost Specific user options
 * @typedef {Object} UserMattermostOptions
 * @property {string} dm_channel_id Direct Message channel ID for user
 */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} room
 * @property {UserMattermostOptions} [mm]
 * @property {string} [root_id]
 * @property {string} [room_name]
 * @property {string} [room_display_name]
 * @property {string} [channel_type]
 * @property {string} [last_name]
 * @property {string} [first_name]
 * @property {string} [email] - The mail of the user
 */
/**
 * @typedef {Object} Message
 * @property {string} id
 */
/**
 * @typedef {Object} Envelop
 * @property {string} room
 * @property {Message} message Initial message for reply
 * @property {User} user
 */
