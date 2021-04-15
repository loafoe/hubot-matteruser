const {TextMessage} = require("hubot/es2015");
const {matterUserAfterEnv, matterUserBeforeEnv} = require("./helpers/test-helpers");
const {HUBOT_SELF_USER} = require("./helpers/samples");

const {use} = require('../src/matteruser.js');
jest.mock('mattermost-client');

const robot = require('robot');
const tested = use(robot);


beforeAll(matterUserBeforeEnv);
afterAll(matterUserAfterEnv);

beforeEach(() => {
  jest.resetAllMocks();
  jest.resetModules() // Most important - it clears the cache

  tested.run();
  tested.emit = jest.fn();
  tested.self = HUBOT_SELF_USER
});

describe('MatterUser message', () => {
  test('should receive from ignored user', () => {
    tested.mmIgnoreUsers = ['dsidious'];
    tested.message({
      data: {
        sender_name: 'dsidious',
        post: JSON.stringify({
          user_id: 'okenobi',
          root_id: '42',
          message: 'May the force',
        }),
        channel_name: 'jedi',
        channel_display_name: 'Jedi Room',
        channel_type: 'D'
      }
    });
    expect(robot.receive).not.toHaveBeenCalled();
  });

  test('should receive direct message without files', () => {
    tested.message({
      data: {
        sender_name: 'bfett',
        post: JSON.stringify({
          user_id: 'bfett',
          root_id: '42',
          message: 'May the force'
        }),
        channel_name: 'jedi',
        channel_display_name: 'Jedi Room',
        channel_type: 'D'
      }
    });

    expect(robot.receive).toHaveBeenCalledWith({
      done: false,
      text: 'May the force',
      user: {
        channel_type: 'D',
        id: 'bfett',
        mm: {},
        room_display_name: 'Jedi Room',
        room_name: 'jedi',
        root_id: '42',
        username: 'Boba Fett'
      }
    });
  });

  test('should receive direct message with files', () => {
    tested.message({
      data: {
        sender_name: 'Obiwan Kenobi',
        post: JSON.stringify({
          user_id: 'okenobi',
          root_id: '42',
          message: 'May the force',
          file_ids: [1, 2, 3]
        }),
        channel_name: 'jedi',
        channel_display_name: 'Jedi Room',
        channel_type: 'D'
      }
    });

    expect(robot.receive).toHaveBeenCalled();
    let actual = robot.receive.mock.calls[0][0];
    expect(actual).toBeInstanceOf(TextMessage);
    expect(actual).toEqual({
      done: false,
      text: 'May the force',
      user: {
        channel_type: 'D',
        faction: 'jedi',
        id: 'okenobi',
        mm: {},
        room_display_name: 'Jedi Room',
        room_name: 'jedi',
        root_id: '42',
        username: 'Obiwan Kenobi'
      }
    });
  });

  test('should receive direct message with attachments props', () => {
    tested.message({
      data: {
        sender_name: 'Obiwan Kenobi',
        post: JSON.stringify({
          user_id: 'okenobi',
          root_id: '42',
          message: 'May the force',
          props: {
            attachments: [
              {pretext: 'Yoda Says', title: 'Jedi Code', text: 'Emotion, yet peace'},
              {pretext: 'Yoda Says', title: 'Ignorance, yet knowledge', text: 'Emotion, yet peace'},
            ]
          }
        }),
        channel_name: 'jedi',
        channel_display_name: 'Jedi Room',
        channel_type: 'D'
      }
    });

    expect(robot.receive).toHaveBeenCalled();
    let actual = robot.receive.mock.calls[0][0];
    expect(actual).toBeInstanceOf(TextMessage);
    expect(actual).toEqual({
      done: false,
      origText: 'May the force',
      props: {
        attachments: [
          {
            pretext: 'Yoda Says',
            text: 'Emotion, yet peace',
            title: 'Jedi Code'
          },
          {
            pretext: 'Yoda Says',
            text: 'Emotion, yet peace',
            title: 'Ignorance, yet knowledge'
          }
        ]
      },
      text: [
        'May the force',
        '',
        '--',
        '',
        'Yoda Says',
        '',
        'Jedi Code',
        '',
        'Emotion, yet peace',
        '',
        '--',
        '',
        'Yoda Says',
        '',
        'Ignorance, yet knowledge',
        '',
        'Emotion, yet peace'
      ].join('\n'),
      user: {
        channel_type: 'D',
        faction: 'jedi',
        id: 'okenobi',
        mm: {
          dm_channel_id: undefined
        },
        room: undefined,
        room_display_name: 'Jedi Room',
        room_name: 'jedi',
        root_id: '42',
        username: 'Obiwan Kenobi'
      }
    });
  });
});
