/**
 * Auth: sunqi
 * Date: May 23 2019
 * Desc: webpack library配置
 */
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
  entry: './lib/index.ts',
  output: {
    path: path.resolve(__dirname),
    filename: 'sa-dahai.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'DHSensor'
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({
      uglifyOptions: {
          compress: {
            drop_console: true
          }
      },
      sourceMap: true
    }),
  ]
}