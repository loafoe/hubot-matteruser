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
        @robot.logger.info "Send"

    reply: (envelope, strings...) ->
        @robot.logger.info "Reply"

    run: ->
        @client = new MatterMostClient mmHost, mmGroup, mmUser, mmPassword, {wssPort: mmWSSPort}

        @client.on 'open', @.open
        @client.on 'loggedIn', @.loggedIn
        @client.on 'message', @.message
        @robot.logger.info "Running"
        
        @client.login()

    open: =>
        return true

    loggedIn: =>
        @robot.logger.info 'Received loggedIn signal from MatterMostClient...'
        return true

    message: =>
        return true

exports.use = (robot) ->
    new Matteruser robot
