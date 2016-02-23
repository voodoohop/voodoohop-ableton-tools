/* eslint strict: 0 */
'use strict';

var webpack = require('webpack');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var baseConfig = require('./webpack.config.base');


var config = Object.create(baseConfig);

config.debug = true;

config.devtool = 'cheap-module-eval-source-map';

config.entry = [
  'babel-polyfill',
  'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
  './app/index'
];


config.module.loaders.push({
  test: /^((?!\.module).)*\.css$/,
  loaders: [
    'style-loader',
    'css-loader'
  ]
}, {
  test: /\.module\.css$/,
  loaders: [
    'style-loader',
    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!',
  ]
},{ test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/, loader: 'url-loader?limit=100000' });


config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': true,
    'process.env': {
      'NODE_ENV': JSON.stringify('development')
    }
  }),
  new webpack.IgnorePlugin(/vertx/) 
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
