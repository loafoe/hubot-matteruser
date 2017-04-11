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
| MATTERMOST\_USER | Yes | The Mattermost user account name e.g. _hubot@yourcompany.com_ |
| MATTERMOST\_PASSWORD | Yes | The password of the user e.g. _s3cr3tP@ssw0rd!_ |
| MATTERMOST\_TOKEN | No | The authorization token of the user e.g. _hyr5dmb1mbb49c44qmx4whniso_ |
| MATTERMOST\_WSS\_PORT | No | Overrides the default port `443` for  websocket (`wss://`) connections |
| MATTERMOST\_HTTP\_PORT | No | Overrides the default port (`80` or `443`) for `http://` or `https://` connections |
| MATTERMOST\_TLS\_VERIFY | No | (default: true) set to 'false' to allow connections when certs can not be verified (ex: self-signed, internal CA, ... - MITM risks) |
| MATTERMOST\_USE\_TLS | No | (default: true) set to 'false' to switch to http/ws protocols |
| MATTERMOST\_LOG\_LEVEL | No | (default: info) set log level (also: debug, ...) |

## Example configuration

The below example assumes you have created a user `hubot@yourcompany.com` with username `hubot` and password `s3cr3tP@ssw0rd!` on your Mattermost server in the `core` team reachable on URL `https://mm.yourcompany.com/core`

  ```sh
export MATTERMOST_HOST=mm.yourcompany.com
export MATTERMOST_GROUP=core
export MATTERMOST_USER=hubot@yourcompany.com
export MATTERMOST_PASSWORD=s3cr3tP@ssw0rd!
  ```

## Example usage

For a complete working application that uses this client checkout the [Hubot Mattermost adapter](https://github.com/loafoe/hubot-matteruser)

## Mattermost 3.5

Recently Mattermost has received a major upgrade that introduces backwards incompatible changes. Since `hubot-matteruser` is using user credentials for interacting with the Mattermost API this will *break your Hubot* if you upgrade your Mattermost server without also upgrading the `mattermost-client` version it uses.

### Upgrading your Hubot for Mattermost 3.5

Find the `package.json` file in your Hubot directory and look for the line in the `dependencies` section that references `hubot-matteruser`. Change the verion so it points to `^3.5.0` of the client. Example:

  ```json
    ...
    "dependencies": {
      "hubot-matteruser": "^3.5.0"
    },
    ...
  ```

### On being backwards compatible

As the Mattermost API is still not stabilised this adapter does not attempt to be backwards compatible. We do our best to track the latest official release of Mattermost.

## License

The MIT License. See `LICENSE` file.
