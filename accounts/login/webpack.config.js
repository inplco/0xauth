const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  resolve: {
    fallback: {
      fs: false,
      path: false,
      util: false
    }
  },
  output: {
    filename: 'main.js',
    path: path.join(__dirname,'/../../public_html/accounts')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      path: path.join(__dirname,'/../../public_html/accounts')
    }),
    new webpack.DefinePlugin({
      __API__: 'http://interplanetary.company:8080/'
    })
  ]
};
