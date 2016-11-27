{Robot,Adapter,TextMessage,User,EnterMessage,LeaveMessage} = require 'hubot'

MatterMostClient = require 'mattermost-client'

class Matteruser extends Adapter

    run: ->
        mmHost = process.env.MATTERMOST_HOST
        mmUser = process.env.MATTERMOST_USER
        mmPassword = process.env.MATTERMOST_PASSWORD
        mmGroup = process.env.MATTERMOST_GROUP
        mmWSSPort = process.env.MATTERMOST_WSS_PORT or '443'
        mmHTTPPort = process.env.MATTERMOST_HTTP_PORT or null
        @mmNoReply = process.env.MATTERMOST_REPLY == 'false'

        unless mmHost?
            @robot.logger.emergency "MATTERMOST_HOST is required"
            process.exit 1
        unless mmUser?
            @robot.logger.emergency "MATTERMOST_USER is required"
            process.exit 1
        unless mmPassword?
            @robot.logger.emergency "MATTERMOST_PASSWORD is required"
            process.exit 1
        unless mmGroup?
            @robot.logger.emergency "MATTERMOST_GROUP is required"
            process.exit 1

        @client = new MatterMostClient mmHost, mmGroup, mmUser, mmPassword, {wssPort: mmWSSPort, httpPort: mmHTTPPort, pingInterval: 30000}

        @client.on 'open', @.open
        @client.on 'hello', @.onHello
        @client.on 'loggedIn', @.loggedIn
        @client.on 'connected', @.onConnected
        @client.on 'message', @.message
        @client.on 'profilesLoaded', @.profilesLoaded
        @client.on 'user_added', @.userAdded
        @client.on 'user_removed', @.userRemoved
        @client.on 'error', @.error

        @robot.brain.on 'loaded', @.brainLoaded

        @robot.on 'slack-attachment', @.slackAttachmentMessage
        @robot.on 'slack.attachment', @.slackAttachmentMessage

        @client.login()

    open: =>
        return true

    error: (err) =>
        @robot.logger.info 'Error: ' + err
        return true

    onConnected: =>
        @robot.logger.info 'Connected to Mattermost.'
        @emit 'connected'
        return true

    onHello: (event) =>
        @robot.logger.info 'Mattermost server: ' + event.data.server_version
        return true

    userChange: (user) =>
        return unless user?.id?
        @robot.logger.debug 'Adding user '+user.id
        newUser =
            name: user.username
            real_name: "#{user.first_name} #{user.last_name}"
            email_address: user.email
            mm: {}
        # Preserve the DM channel ID if it exists
        newUser.mm.dm_channel_id = @robot.brain.userForId(user.id).mm?.dm_channel_id
        for key, value of user
            newUser.mm[key] = value
        if user.id of @robot.brain.data.users
            for key, value of @robot.brain.data.users[user.id]
                unless key of newUser
                    newUser[key] = value
        delete @robot.brain.data.users[user.id]
        @robot.brain.userForId user.id, newUser

    loggedIn: (user) =>
        @robot.logger.info 'Logged in as user "'+user.username+'" but not connected yet.'
        @self = user
        @robot.name = @self.username
        return true

    profilesLoaded: =>
        for id, user of @client.users
            @userChange user

    brainLoaded: =>
        @robot.logger.info 'Brain loaded'
        for id, user of @client.users
            @userChange user
        return true

    send: (envelope, strings...) ->
        # Check if the target room is also a user's username
        user = @robot.brain.userForName(envelope.room)

        # If it's not, continue as normal
        unless user
            channel = @client.findChannelByName(envelope.room)
            @client.postMessage(str, channel?.id or envelope.room) for str in strings
            return

        # If it is, we assume they want to DM that user
        # Message their DM channel ID if it already exists.
        if user.mm?.dm_channel_id?
            @client.postMessage(str, user.mm.dm_channel_id) for str in strings
            return

        # Otherwise, create a new DM channel ID and message it.
        @client.getUserDirectMessageChannel user.id, (channel) =>
            user.mm.dm_channel_id = channel.id
            @client.postMessage(str, channel.id) for str in strings

    reply: (envelope, strings...) ->
        if @mmNoReply
          return @send(envelope, strings...)

        strings = strings.map (s) -> "@#{envelope.user.name} #{s}"
        postData = {}
        postData.message = strings[0]

        # Set the comment relationship
        postData.root_id = envelope.message.id
        postData.parent_id = postData.root_id

        postData.create_at = Date.now()
        postData.user_id = @self.id
        postData.filename = []
        # Check if the target room is also a user's username
        user = @robot.brain.userForName(envelope.room)

        # If it's not, continue as normal
        unless user
            channel = @client.findChannelByName(envelope.room)
            postData.channel_id = channel?.id or envelope.room
            @client.customMessage(postData, postData.channel_id)
            return

        # If it is, we assume they want to DM that user
        # Message their DM channel ID if it already exists.
        if user.mm?.dm_channel_id?
            postData.channel_id = user.mm.dm_channel_id
            @client.customMessage(postData, postData.channel_id)
            return

        # Otherwise, create a new DM channel ID and message it.
        @client.getUserDirectMessageChannel user.id, (channel) =>
            user.mm.dm_channel_id = channel.id
            postData.channel_id = channel.id
            @client.customMessage(postData, postData.channel_id)

    message: (msg) =>
        @robot.logger.debug msg
        mmPost = JSON.parse msg.data.post
        mmUser = @client.getUserByID mmPost.user_id
        return if mmPost.user_id == @self.id # Ignore our own output
        @robot.logger.debug 'From: ' + mmPost.user_id + ', To: ' + @self.id

        user = @robot.brain.userForId mmPost.user_id
        user.room = mmPost.channel_id

        text = mmPost.message
        if msg.data.channel_type == 'D'
          if !///^@?#{@robot.name} ///i.test(text) # Direct message
            text = "#{@robot.name} #{text}"
          user.mm.dm_channel_id = mmPost.channel_id
        @robot.logger.debug 'Text: ' + text

        @receive new TextMessage user, text, mmPost.id
        @robot.logger.debug "Message sent to hubot brain."
        return true

    userAdded: (msg) =>
        mmUser = @client.getUserByID msg.data.user_id
        @userChange mmUser
        user = @robot.brain.userForId mmUser.id
        user.room = msg.channel_id
        @receive new EnterMessage user
        return true

    userRemoved: (msg) =>
        mmUser = @client.getUserByID msg.data.user_id
        user = @robot.brain.userForId mmUser.id
        user.room = msg.channel_id
        @receive new LeaveMessage user
        return true

    slackAttachmentMessage: (data) =>
        return unless data.room
        msg = {}
        msg.text = data.text
        msg.type = "slack_attachment"
        msg.props = {}
        msg.channel_id = data.room
        msg.props.attachments = data.attachments || []
        msg.props.attachments = [msg.props.attachments] unless Array.isArray msg.props.attachments
        if data.username && data.username != @robot.name
            msg.as_user = false
            msg.username = data.username
            if data.icon_url?
                msg.icon_url = data.icon_url
            else if data.icon_emoji?
                msg.icon_emoji = data.icon_emoji
        else
            msg.as_user = true

        @client.customMessage(msg, msg.channel_id)

    changeHeader: (channel, header) ->
        return unless channel?
        return unless header?

        channelInfo = @client.findChannelByName(channel)

        return @robot.logger.error "Channel not found" unless channelInfo?

        @client.setChannelHeader(channelInfo.id, header)

exports.use = (robot) ->
    new Matteruser robot
