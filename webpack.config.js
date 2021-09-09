const path = require('path');

module.exports = {
  entry: {
    dealer: './public/scripts/dealer.js',
    player: './public/scripts/player.js',
    home: './public/scripts/home.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/script'),
  },
  mode: 'production',
};
