const path = require('path');

module.exports = {
  entry: './src/matteruser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'matteruser.js',
    library: {
      name: 'HubotMatteruser',
      type: 'umd',
    },
    globalObject: 'this',
  },
  externals: {
    'mattermost-client': 'commonjs2 mattermost-client',
    'hubot/es2015': 'commonjs2 hubot/es2015',
  },
};
