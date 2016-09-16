
import path from 'path';

export default {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: [/*'react-hot',*/'babel-loader'],
      exclude: /node_modules/
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2',
      //  publicPath: 'http://localhost:3000/dist/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins: [

  ],
  externals: [

    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
    // "node-osc",
     "musicmetadata",
    "thomash-node-audio-metadata",
    "iconv-lite",
    "usage",
    "flac-metadata",
    "bindings"
  ]
};

