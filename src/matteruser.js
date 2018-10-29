const { Adapter,
    TextMessage,
    EnterMessage,
    LeaveMessage } = require('hubot/es2015');

const MatterMostClient = require('mattermost-client');

class AttachmentMessage extends TextMessage {

constructor(user, text, file_ids, id) {
    super(user, text, id);
}
}

// A TextMessage class that adds `msg.props` for Mattermost's properties.
//
// Text fields from message attachments are appended in @text for matching.
// <https://docs.mattermost.com/developer/message-attachments.html>
// The result is that `bot.hear()` will match against these attachment fields.
//
// As well, it is possible that some bot handlers could make use of other
// fields on `msg.props`.
//
// Example raw props:
//   {
//       "attachments": [...],
//       "from_webhook": "true",
//       "override_username": "trenthere"
//   }
class TextAndPropsMessage extends TextMessage {

constructor(user, text, props, id) {
    super(user, text, id);
    this.props = props;
    this.origText = this.text;
    if (this.props.attachments) {
        const separator = '\n\n--\n\n';
        for (let attachment of this.props.attachments) {
            const parts = [];
            for (let field of ['pretext', 'title', 'text']) {
                if (attachment[field]) {
                    parts.push(attachment[field]);
                }
            }
            if (parts.length) {
                this.text += separator + parts.join('\n\n');
            }
        }
    }
}

match(regex) {
    return this.text.match(regex);
}
}

class Matteruser extends Adapter {

constructor(...args) {
    super(...args);

    // Binding because async calls galore
    this.open = this.open.bind(this);
    this.error = this.error.bind(this);
    this.onConnected = this.onConnected.bind(this);
    this.onHello = this.onHello.bind(this);
    this.userChange = this.userChange.bind(this);
    this.loggedIn = this.loggedIn.bind(this);
    this.profilesLoaded = this.profilesLoaded.bind(this);
    this.brainLoaded = this.brainLoaded.bind(this);
    this.message = this.message.bind(this);
    this.userTyping = this.userTyping.bind(this);
    this.userAdded = this.userAdded.bind(this);
    this.userRemoved = this.userRemoved.bind(this);
}

run() {
    const mmHost = process.env.MATTERMOST_HOST;
    const mmUser = process.env.MATTERMOST_USER || null;
    const mmPassword = process.env.MATTERMOST_PASSWORD;
    const mmGroup = process.env.MATTERMOST_GROUP;
    const mmWSSPort = process.env.MATTERMOST_WSS_PORT || '443';
    const mmHTTPPort = process.env.MATTERMOST_HTTP_PORT || null;
    const mmAccessToken = process.env.MATTERMOST_ACCESS_TOKEN || null;
    this.mmNoReply = process.env.MATTERMOST_REPLY === 'false';
    this.mmIgnoreUsers = (process.env.MATTERMOST_IGNORE_USERS != null ? process.env.MATTERMOST_IGNORE_USERS.split(',') : undefined) || [];

    if (mmHost == null) {
        this.robot.logger.emergency("MATTERMOST_HOST is required");
        process.exit(1);
    }
    if (mmUser == null && mmAccessToken == null) {
        this.robot.logger.emergency("MATTERMOST_USER or MATTERMOST_ACCESS_TOKEN is required");
        process.exit(1);
    }
    if (mmPassword == null && mmAccessToken == null) {
        this.robot.logger.emergency("MATTERMOST_PASSWORD is required");
        process.exit(1);
    }
    if (mmGroup == null) {
        this.robot.logger.emergency("MATTERMOST_GROUP is required");
        process.exit(1);
    }

    this.client = new MatterMostClient(mmHost, mmGroup, {wssPort: mmWSSPort, httpPort: mmHTTPPort, pingInterval: 30000});

    this.client.on('open', this.open);
    this.client.on('hello', this.onHello);
    this.client.on('loggedIn', this.loggedIn);
    this.client.on('connected', this.onConnected);
    this.client.on('message', this.message);
    this.client.on('profilesLoaded', this.profilesLoaded);
    this.client.on('user_added', this.userAdded);
    this.client.on('user_removed', this.userRemoved);
    this.client.on('typing', this.userTyping);
    this.client.on('error', this.error);

    this.robot.brain.on('loaded', this.brainLoaded);

    if (mmAccessToken != null) {
      return this.client.tokenLogin(mmAccessToken);
    }
    return this.client.login(mmUser, mmPassword);
}

open() {
    return true;
}

error(err) {
    this.robot.logger.info(`Error: ${err}`);
    return true;
}

onConnected() {
    this.robot.logger.info('Connected to Mattermost.');
    this.emit('connected');
    return true;
}

onHello(event) {
    this.robot.logger.info(`Mattermost server: ${event.data.server_version}`);
    return true;
}

userChange(user) {
    if (!user || (user.id == null)) { return; }
    this.robot.logger.debug(`Adding user ${user.id}`);
    const newUser = {
        name: user.username,
        real_name: `${user.first_name} ${user.last_name}`,
        email_address: user.email,
        mm: {}
    };

    // Preserve the DM channel ID if it exists
    let user_obj = this.robot.brain.userForId(user.id);
    newUser.mm.dm_channel_id = undefined;
    if ("mm" in user_obj) { newUser.mm.dm_channel_id = user_obj.mm.dm_channel_id }

    let value;
    for (var key in user) {
        value = user[key];
        newUser.mm[key] = value;
    }
    if (user.id in this.robot.brain.data.users) {
        for (key in this.robot.brain.data.users[user.id]) {
            value = this.robot.brain.data.users[user.id][key];
            if (!(key in newUser)) {
                newUser[key] = value;
            }
        }
    }
    delete this.robot.brain.data.users[user.id];
    return this.robot.brain.userForId(user.id, newUser);
}

loggedIn(user) {
    this.robot.logger.info(`Logged in as user "${user.username}" but not connected yet.`);
    this.self = user;
    return true;
}

profilesLoaded(profiles) {
    return (() => {
        const result = [];
        for (let id in profiles) {
            const user = profiles[id];
            result.push(this.userChange(user));
        }
        return result;
    })();
}

brainLoaded() {
    this.robot.logger.info('Brain loaded');
    for (let id in this.client.users) {
        const user = this.client.users[id];
        this.userChange(user);
    }
    return true;
}

send(envelope, ...strings) {
    // Check if the target room is also a user's username
    let str;
    const user = this.robot.brain.userForName(envelope.room);

    // If it's not, continue as normal
    if (!user) {
        const channel = this.client.findChannelByName(envelope.room);
        const channel_id = channel ? channel.id : undefined;

        for (str of strings) {
            this.client.postMessage(str,
                                    (channel_id || envelope.room));
        }
    } else {
        // If it is, we assume they want to DM that user
        // Message their DM channel ID if it already exists.
        let dm_channel_id = user.mm
                            ? (user.mm.dm_channel_id ? user.mm.dm_channel_id : undefined)
                            : undefined

        if (dm_channel_id != null) {
            for (str of strings) {
                this.client.postMessage(str, user.mm.dm_channel_id);
            }

        } else {

            let self = this

            // Otherwise, create a new DM channel ID and message it.
            this.client.getUserDirectMessageChannel(user.id, channel => {
                if (!user.mm) { user.mm = {}; }
                user.mm.dm_channel_id = channel.id;

                for (str of strings) {
                    self.client.postMessage(str, channel.id);
                }
            });
        }
    }
}

reply(envelope, ...strings) {
    if (this.mmNoReply) {
      return this.send(envelope, ...strings);
    }

    strings = strings.map(s => `@${envelope.user.name} ${s}`);
    const postData = {};
    postData.message = strings[0];

    // Set the comment relationship
    postData.root_id = envelope.message.id;
    postData.parent_id = postData.root_id;

    postData.create_at = 0;
    postData.user_id = this.self.id;
    postData.filename = [];
    // Check if the target room is also a user's username
    const user = this.robot.brain.userForName(envelope.room);

    // If it's not, continue as normal
    if (!user) {
        const channel = this.client.findChannelByName(envelope.room);
        postData.channel_id = (channel ? channel.id : undefined) || envelope.room;
        this.client.customMessage(postData, postData.channel_id);
    }

    // If it is, we assume they want to DM that user
    // Message their DM channel ID if it already exists.
    if ((user.mm ? user.mm.dm_channel_id : undefined) != null) {
        postData.channel_id = user.mm.dm_channel_id;
        this.client.customMessage(postData, postData.channel_id);
        return;
    }

    // Otherwise, create a new DM channel ID and message it.
    return this.client.getUserDirectMessageChannel(user.id, channel => {
        if (!user.mm) { user.mm = {}; }
        user.mm.dm_channel_id = channel.id;
        postData.channel_id = channel.id;
        return this.client.customMessage(postData, postData.channel_id);
    });
}

message(msg) {
    if (this.mmIgnoreUsers.includes(msg.data.sender_name)) {
      this.robot.logger.info(`User ${msg.data.sender_name} is in MATTERMOST_IGNORE_USERS, ignoring them.`);
      return;
  }

    this.robot.logger.debug(msg);
    const mmPost = JSON.parse(msg.data.post);
    if (mmPost.user_id === this.self.id) { return; } // Ignore our own output
    this.robot.logger.debug(`From: ${mmPost.user_id}, To: ${this.self.id}`);

    const user = this.robot.brain.userForId(mmPost.user_id);
    user.room = mmPost.channel_id;
    user.room_name = msg.data.channel_display_name;
    user.channel_type = msg.data.channel_type;

    let text = mmPost.message;
    if (msg.data.channel_type === 'D') {
        if (!new RegExp(`^@?${this.robot.name}`, 'i').test(text)) { // Direct message
          text = `${this.robot.name} ${text}`;
        }
        if (!user.mm) { user.mm = {}; }
        user.mm.dm_channel_id = mmPost.channel_id;
    }
    this.robot.logger.debug(`Text: ${text}`);

    if (mmPost.file_ids) {
        this.receive(new AttachmentMessage(user, text, mmPost.file_ids, mmPost.id));
    // If there are interesting props, then include them for bot handlers.
    } else if ( mmPost.props ? mmPost.props.attachments : undefined ) {
        this.receive(new TextAndPropsMessage(user, text, mmPost.props, mmPost.id));
    } else {
        this.receive(new TextMessage(user, text, mmPost.id));
    }
    this.robot.logger.debug("Message sent to hubot brain.");
    return true;
}

userTyping(msg) {
    this.robot.logger.info('Someone is typing...', msg);
    return true;
}

userAdded(msg) {
    // update channels when this bot is added to a new channel
    if (msg.data.user_id === this.self.id) {
      this.client.loadChannels();
  }
    try {
      const mmUser = this.client.getUserByID(msg.data.user_id);
      this.userChange(mmUser);
      const user = this.robot.brain.userForId(mmUser.id);
      user.room = msg.broadcast.channel_id;
      this.receive(new EnterMessage(user));
      return true;
    } catch (error) {
      return false;
  }
}

userRemoved(msg) {
    // update channels when this bot is removed from a channel
    if (msg.broadcast.user_id === this.self.id) {
      this.client.loadChannels();
  }
    try {
      const mmUser = this.client.getUserByID(msg.data.user_id);
      const user = this.robot.brain.userForId(mmUser.id);
      user.room = msg.broadcast.channel_id;
      this.receive(new LeaveMessage(user));
      return true;
    } catch (error) {
      return false;
  }
}

changeHeader(channel, header) {
    if (channel == null || header == null) { return; }

    const channelInfo = this.client.findChannelByName(channel);

    if (channelInfo == null) { return this.robot.logger.error("Channel not found"); }

    return this.client.setChannelHeader(channelInfo.id, header);
}
}

module.exports.use = robot => new Matteruser(robot)
