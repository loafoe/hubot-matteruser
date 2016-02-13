try
  {Robot,Adapter,TextMessage,User} = require 'hubot'
catch
  prequire = require('parent-require')
  {Robot,Adapter,TextMessage,User} = prequire 'hubot'

WebSocket = require 'ws'
url = require 'url'
MatterMostClient = require 'mattermost-client'

mmHost = process.env.MATTERMOST_HOST
mmUser = process.env.MATTERMOST_USER
mmPassword = process.env.MATTERMOST_PASSWORD
mmGroup = process.env.MATTERMOST_GROUP
mmWSSPort = process.env.MATTERMOST_WSS_PORT or '443'

class Matteruser extends Adapter

    send: (envelope, strings...) ->
        @robot.logger.info "Should send: " + strings

    reply: (envelope, strings...) ->
        @robot.logger.info "Should send reply: " + strings

    run: ->
        @client = new MatterMostClient mmHost, mmGroup, mmUser, mmPassword, {wssPort: mmWSSPort}

        @client.on 'open', @.open
        @client.on 'loggedIn', @.loggedIn
        @client.on 'connected', @.onConnected
        @client.on 'message', @.message
        @client.on 'error', @.error
        @robot.logger.info "Running"
        @robot.brain.on 'loaded', @.brainLoaded

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

    loggedIn: (user) =>
        @robot.logger.info 'Logged in as user "'+user.username+'" but not connected yet.'
        @self = user
        @robot.name = @self.username
        return true

    brainLoaded: =>
        @robot.logger.info 'Brain loaded'
        return true

    message: (msg) =>
        return if msg.user_id == @self.user_id

        mmChannel = @client.getChannelByID msg.channel_id if msg.channel_id
        mmUser = @client.getUserByID(msg.user_id)
        mmPost = JSON.parse(msg.props.post)

        #@robot.logger.info msg

        @robot.logger.info 'Received message from '+mmUser.username+': ' + mmPost.message
        user = @robot.brain.userForId msg.user_id, name: mmUser.username, room: msg.channel_id
        text = new TextMessage(user, mmPost.message, msg.id)
        @receive text
        @robot.logger.info "Message sent to hubot brain."
        return true

exports.use = (robot) ->
    new Matteruser robot
