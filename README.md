[![Downloads](https://img.shields.io/npm/dm/hubot-matteruser.svg)](https://www.npmjs.com/package/hubot-matteruser)
[![Version](https://img.shields.io/npm/v/hubot-matteruser.svg)](https://github.com/loafoe/hubot-matteruser/releases)
[![Licence](https://img.shields.io/npm/l/express.svg)](https://github.com/loafoe/hubot-matteruser/blob/master/LICENSE)

# hubot-matteruser

**Hubot** is "chat bot" created by GitHub that listens for commands and executes actions based on your requests. 

`hubot-matteruser` is a Hubot adapter for [Mattermost](https://about.mattermost.com/) written in coffee script that uses the Mattermost [Web Services API](https://api.mattermost.com/) and WebSockets to deliver Hubot functionality. 

- Learn more about [Hubot in Wired Magazine](https://www.wired.com/2015/10/the-most-important-startups-hardest-worker-isnt-a-person/)
- Learn more about [Mattermost as an open source, self-hosted team communication server](https://about.mattermost.com/)

## Description

This [Hubot](https://github.com/github/hubot) adapter connects to your Mattermost server. You can invite your bot to any channel just as a regular user. It listens and perform your commands. The adapter uses [mattermost-client](https://github.com/loafoe/mattermost-client) for all low level Mattermost communication.

## Docker usage

### Standalone

Clone this repository, then build the Hubot-Matteruser container:

```
$ docker build --build-arg hubot_owner=<owner> \
             --build-arg hubot_name=<name> \
             --build-arg hubot_description=<desc> \
             --tag=hubot-matteruser \
             .
```

Start the container:

```
$ docker run -it \
           --env MATTERMOST_HOST=<mm_host> \
           --env MATTERMOST_GROUP=<mm_team> \
           --env MATTERMOST_USER=<mm_user_email> \
           --env MATTERMOST_PASSWORD=<mm_user_password> \
           -p 8080:8080 \
           --name hubot-matteruser \
           hubot-matteruser
```

or if you have a personal access token:

```
$ docker run -it \
           --env MATTERMOST_HOST=<mm_host> \
           --env MATTERMOST_GROUP=<mm_team> \
           --env MATTERMOST_ACCESS_TOKEN=<personal>
           -p 8080:8080 \
           --name hubot-matteruser \
           hubot-matteruser
```

### Docker Compose

To integrate with a running Mattermost instance, update docker-compose.yml accordingly and launch the bot:

``` 
docker-compose build
docker-compose run -d
```

If you just want to test locally, you can find [here](https://github.com/banzo/mattermost-docker/tree/feature/hubot-matteruser) a fork of the [official Mattermost Docker Compose stack](https://github.com/mattermost/mattermost-docker) plugged to Hubot-Matteruser: 


## Installation

### 1) Install a Mattermost server

Follow the [Mattermost install guides](https://docs.mattermost.com/guides/administrator.html#install-guides) to set up the latest version of Mattermost 5.4.x.

**IMPORTANT:** Make sure your `hubot-matteruser` and `mattermost-client` versions **match** the major version of your Mattermost server so the API versions will match. 

### 2) Install hubot-matteruser

On a separate server, install `hubot-matteruser` using the following commands: 

  ```sh
npm install -g yo generator-hubot
yo hubot --adapter matteruser
  ```

Follow the instructions to set up your bot, including setup of [`mattermost-client`](https://github.com/loafoe/mattermost-client). 

#### Environment variables

The adapter requires the following environment variables to be defined before your Hubot instance will start:

| Variable | Required | Description |
|----------|----------|-------------|
| MATTERMOST\_HOST | Yes | The Mattermost host e.g. _mm.yourcompany.com_ |
| MATTERMOST\_GROUP | Yes | The team/group on your Mattermost server e.g. _core_ |
| MATTERMOST\_USER | No | The Mattermost user account name e.g. _hubot@yourcompany.com_ |
| MATTERMOST\_PASSWORD | No | The password of the user e.g. _s3cr3tP@ssw0rd!_ |
| MATTERMOST\_ACCESS\_TOKEN | No | The personal access token of the user |
| MATTERMOST\_WSS\_PORT | No | Overrides the default port `443` for  websocket (`wss://`) connections |
| MATTERMOST\_HTTP\_PORT | No | Overrides the default port (`80` or `443`) for `http://` or `https://` connections |
| MATTERMOST\_TLS\_VERIFY | No | (default: true) set to 'false' to allow connections when certs can not be verified (ex: self-signed, internal CA, ... - MITM risks) |
| MATTERMOST\_USE\_TLS | No | (default: true) set to 'false' to switch to http/ws protocols |
| MATTERMOST\_LOG\_LEVEL | No | (default: info) set log level (also: debug, ...) |
| MATTERMOST\_REPLY | No | (default: true) set to 'false' to stop posting `reply` responses as comments |
| MATTERMOST\_IGNORE\_USERS | No | (default: empty) Enter a comma-separated list of user senderi\_names to ignore. |

#### Example configuration

The below example assumes you have created a user `hubot@yourcompany.com` with username `hubot` and password `s3cr3tP@ssw0rd!` on your Mattermost server in the `core` team reachable on URL `https://mm.yourcompany.com/core`

  ```sh
export MATTERMOST_HOST=mm.yourcompany.com 
export MATTERMOST_GROUP=core
export MATTERMOST_USER=hubot@yourcompany.com
export MATTERMOST_PASSWORD=s3cr3tP@ssw0rd!
  ```

## Upgrade

To upgrade your Hubot for Mattermost 4.4.x, find the `package.json` file in your Hubot directory and look for the line in the `dependencies` section that references `hubot-matteruser`. Change the verion so it points to `^5.1.0` of the client. Example:

  ```json
    ...
    "dependencies": {
      "hubot-matteruser": "^5.1.0"
    },
    ...
  ```

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


## License

The MIT License. See `LICENSE` file.

