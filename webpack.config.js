/**
 * Auth: sunqi
 * Date: May 23 2019
 * Desc: webpack library配置
 */
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sa-dahai.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'DHSensor'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
}