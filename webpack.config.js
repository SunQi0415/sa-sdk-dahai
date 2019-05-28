/**
 * Auth: sunqi
 * Date: May 23 2019
 * Desc: webpack library配置
 */
const path = require('path')

module.exports = {
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sa-dahai.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    // libraryExport: 'default',
    library: 'saDahai'
  },
  externals: {
    'sa-sdk-javascript': {
      commonjs: 'sa-sdk-javascript',
      commonjs2: 'sa-sdk-javascript',
      amd: 'sa-sdk-javascript',
      root: '_'
    }
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