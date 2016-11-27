[![Downloads](https://img.shields.io/npm/dm/hubot-matteruser.svg)](https://www.npmjs.com/package/hubot-matteruser)
[![Version](https://img.shields.io/npm/v/hubot-matteruser.svg)](https://github.com/loafoe/hubot-matteruser/releases)
[![Licence](https://img.shields.io/npm/l/express.svg)](https://github.com/loafoe/hubot-matteruser/blob/master/LICENSE)

# hubot-matteruser

Hubot Adapter for Mattermost using the Web API and Websockets.

## Description

Use this [Hubot](https://github.com/github/hubot) Adapter to connect to your Mattermost server. You can invite your bot to any channel just as a regular user. It will listen and perform your commands. The adapter uses [mattermost-client](https://github.com/loafoe/mattermost-client) for all low level Mattermost communication.

## Try the Hubot demo

You can try out Hubot by joining the Mattermost community server and joining the Hubot channel: 

1. [Create an account](https://pre-release.mattermost.com/signup_user_complete/?id=f1924a8db44ff3bb41c96424cdc20676) on the Mattermost nightly builds server at https://pre-release.mattermost.com/
2. Join the "Hubot" channel
3. Type `hubot help` for instructions

### Sample commands

You can try a simple command like `hubot the rules` to bring some static text stored in Hubot: 

![s](https://cloud.githubusercontent.com/assets/177788/20645776/b25da69a-b41c-11e6-81d2-a40d76947e60.png)

Try `hubot animate me` to have Hubot reach out to Giphy and bring back a random animated image.

![s](https://cloud.githubusercontent.com/assets/177788/20645764/88c267a8-b41c-11e6-96c9-529c3ca844f3.png)

Try `hubot map me [NAME_OF_CITY]` to have Hubot reach out to Google Maps and bring back a map based on the name of a city you pass in as a parameter. For example, `hubot map me palo alto` brings back the below map of Palo Alto

![s](https://cloud.githubusercontent.com/assets/177788/20645769/9d58a786-b41c-11e6-90b1-6a9e7ab19172.png)




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

Find the `package.json` file in your Hubot directory and look for the line in the `dependencies` section that references `hubot-matteruser`. Change the verion so it points to `^3.5.1` of the client. Example:

  ```json
    ...
    "dependencies": {
      "hubot-matteruser": "^3.5.1"
    },
    ...
  ```

### On being backwards compatible

As the Mattermost API is still not stabilised this adapter does not attempt to be backwards compatible. We do our best to track the latest official release of Mattermost.

## License

The MIT License. See `LICENSE` file.

