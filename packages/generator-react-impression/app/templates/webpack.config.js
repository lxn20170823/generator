const path = require('path')
const merge = require('webpack-merge')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BabelWebpackPlugin = require('babel-minify-webpack-plugin')
const config = require('./package.json')

const paths = {
  dist: path.resolve(__dirname, 'dist'),
  src: path.resolve(__dirname, 'src'),
  html: path.resolve(__dirname, 'src/index.html'),
  css: path.resolve(__dirname, 'src/app/styles'),
}

const names = {
  image: 'images/[name].[hash:6].[ext]',
  font: 'fonts/[name].[ext]',
  css: 'styles/app.css',
  js: 'scripts/app.js',
}

const common = {
  output: {
    path: paths.dist,
    filename: names.js,
    publicPath: '/',
  },
  resolve: {
    alias: {
      src: paths.src,
    },
    modules: [paths.src, 'node_modules'],
    symlinks: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: paths.html,
      inject: true,
    }),
    new webpack.ContextReplacementPlugin(/moment\/locale$/, /zh-cn/),
  ],
}

const development = {
  entry: ['react-hot-loader/patch', paths.src],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          failOnError: true,
        },
      },
      {
        test: /\.js$/,
        include: [paths.src, /whatwg-fetch/],
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.scss$/,
        exclude: [paths.css, /node_modules/],
        use: ['style-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.scss$/,
        include: [paths.css, /node_modules/],
        use: [
          'style-loader',
          'css-loader?sourceMap',
          'postcss-loader?sourceMap',
          'sass-loader?sourceMap',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
      },
    ],
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    hot: true,
    historyApiFallback: true,
    stats: 'errors-only',
    overlay: {
      errors: true,
      warnings: true,
    },
    proxy: config.proxy || {},
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      DEBUG: JSON.stringify(true),
    }),
  ],
}

const production = {
  entry: paths.src,
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [paths.src, /whatwg-fetch/],
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        exclude: [paths.css, /node_modules/],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        }),
      },
      {
        test: /\.scss$/,
        include: [paths.css, /node_modules/],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: names.image,
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: names.font,
        },
      },
    ],
  },
  stats: {
    children: false,
    chunks: false,
    chunkModules: false,
    modules: false,
  },
  plugins: [
    new CleanWebpackPlugin([paths.dist]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      DEBUG: JSON.stringify(false),
    }),
    new BabelWebpackPlugin(),
    new ExtractTextPlugin(names.css),
  ],
}

module.exports = env =>
  env.development ? merge(common, development) : merge(common, production)
