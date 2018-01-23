const path = require('path');

module.exports = {
  entry: './html/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './html/dist')
  },
  module: {
    rules: [{
      test: /\.js$/, // files ending with .js
      exclude: /node_modules/, // exclude the node_modules directory
      loader: "babel-loader" // use this (babel-core) loader
    }]
  }
};
