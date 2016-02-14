[![Downloads](https://img.shields.io/npm/dm/hubot-matteruser.svg)](https://www.npmjs.com/package/hubot-matteruser)
[![Version](https://img.shields.io/npm/v/hubot-matteruser.svg)](https://github.com/loafoe/hubot-matteruser/releases)
[![Licence](https://img.shields.io/npm/l/express.svg)](https://github.com/loafoe/hubot-matteruser/blob/master/LICENSE)

# hubot-matteruser

Hubot Adapter for Mattermost using the Web API and Websockets.

## Description

Use this [Hubot](https://github.com/github/hubot) Adapter to connect to your Mattermost server. You can invite your bot to any channel just as a regular user. It will listen and perform your commands. The adapter uses [mattermost-client](https://github.com/loafoe/mattermost-client) for all low level Mattermost communication.


## Installation

Creating a bot from scratch is easy:

  ```sh
npm install -g yo generator-hubot
yo hubot --adapter matteruser
  ```
Follow the instructions to set up your bot. 

## Environment variables

The adapter requires the following environment variables to be defined before your Hubot instance will start:

| Variable | Required | Description |
|----------|----------|-------------|
| MATTERMOST\_HOST | Yes | The Mattermost host e.g. _mm.yourcompany.com_ |
| MATTERMOST\_GROUP | Yes | The team/group on your Mattermost server e.g. _core_ |
| MATTERMOST\_USER | Yes | The Mattermost user account name e.g. _hubot_ |
| MATTERMOST\_PASSWORD | Yes | The password of the user e.g. _s3cr3tP@ssw0rd!_ |
| MATTERMOST\_WSS_PORT | No | Overrides the default port `443` for  websocket (`wss://`) connections |

## Example

The below example assumes you have created a user `hubot` with password `s3cr3tP@ssw0rd!` on your Mattermost server with a `core` team reachable on URL `https://mm.yourcompany.com/core`

  ```sh
export MATTERMOST_HOST=mm.yourcompany.com 
export MATTERMOST_GROUP=core
export MATTERMOST_USER=hubot
export MATTERMOST_PASSWORD=s3cr3tP@ssw0rd!
  ```

### Known limitations

Only `https` is supported at this time. Go check out [Let's Encrypt](https://letsencrypt.org) if you need a certificate.

## License

The MIT License. See `LICENSE` file.

