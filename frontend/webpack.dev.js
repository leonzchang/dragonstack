const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new BundleAnalyzerPlugin({ openAnalyzer: false }),
    new webpack.DefinePlugin({
      'process.env.BACKEND_URL': JSON.stringify(process.env.BACKEND_URL),
      'process.env.BACKEND_PORT': JSON.stringify(process.env.BACKEND_PORT),
    })
  ],
  //set up webpack server
  devServer: {
    // port: 1234,
    // for contarner 
    // host: '0.0.0.0', // lets the server listen for requests from the network, not just localhost.
    port: process.env.FRONTEND_PORT,
    contentBase: path.join(__dirname, 'build'),
    historyApiFallback: true,
  },
});
