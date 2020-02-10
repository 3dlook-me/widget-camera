/* eslint import/no-dynamic-require: 0 */
const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const TerserPlugin = require('terser-webpack-plugin');
const cssnano = require('cssnano');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const RenameOutputPlugin = require('rename-output-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackCleanPlugin = require('webpack-clean');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();

// get required env vars
const { NODE_ENV } = process.env;
// throw error if they don't exist
if (!NODE_ENV) {
  throw new Error('Please set NODE_ENV environment variable');
}

// get right mode
const mode = (NODE_ENV && NODE_ENV.trim() === 'production') ? 'production' : 'development';

const shouldGenSourceMap = mode !== 'production';

/**
 * SCSS configs
 */
const sass = {
  loader: 'sass-loader',
  options: {
    modules: true,
  },
};

const css = {
  loader: 'css-loader',
};

const postcss = {
  loader: 'postcss-loader',
  options: {
    plugins: () => [
      autoprefixer('last 3 versions', 'ie 10'),
      cssnano(),
    ],
  },
};

/**
 * Plugins
 */
const plugins = [
  new webpack.DefinePlugin({
    VERSION: JSON.stringify(gitRevisionPlugin.version()),
    COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
    BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
  }),
  mode !== 'production' ? new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve('src/index.html'),
    inject: true,
    inlineSource: 'widget.(js/css)$',
  }) : false,
  mode !== 'production' ? new HtmlWebpackInlineSourcePlugin() : false,
  new MiniCssExtractPlugin({
    filename: "style.css",
    chunkFilename: "[name].css"
  }),
  new CleanWebpackPlugin([
    'dist',
  ]),
].filter(Boolean);

/**
 * Webpack config
 */
module.exports = {
  mode,
  watch: mode === 'development',
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/,
  },
  entry: {
    'index': path.resolve(`${__dirname}/src/Camera.jsx`),
  },
  output: {
    publicPath: '/',
    path: `${__dirname}/dist`,
    filename: '[name].js',
    libraryTarget: (mode === 'production') ? "commonjs2" : 'var',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['last 2 versions', 'safari >= 7'],
                  },
                }],
              ],
              plugins: [
                ['@babel/plugin-transform-async-to-generator'],
                ['@babel/plugin-proposal-class-properties', { loose: false }],
                ['@babel/plugin-transform-runtime', {
                  corejs: false,
                  helpers: true,
                  regenerator: true,
                  useESModules: false,
                }],
              ],
            },
          },
        ],
      },

      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage', // test turn it off for reduce bundle size
                  targets: {
                    browsers: ['last 2 versions', 'safari >= 7'],
                  },
                }],
              ],
              plugins: [
                ['@babel/plugin-transform-async-to-generator'],
                ['@babel/plugin-proposal-class-properties', { loose: false }],
                ['@babel/plugin-transform-react-jsx', {
                  pragma: 'h',
                }],
                ['@babel/plugin-transform-runtime', {
                  corejs: false,
                  helpers: true,
                  regenerator: true,
                  useESModules: false,
                }],
              ],
            },
          },
        ],
      },

      {
        test: /\.scss/,
        use: [MiniCssExtractPlugin.loader, css, postcss, sass],
      },

      {
        test: /\.(jpe?g|png|gif|svg)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'widget-assets/[name].[hash].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              disable: mode !== 'production',
            },
          },
        ],
      },

      {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader',
          options: {
            minimize: mode === 'production',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules',
    ],
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
      // Not necessary unless you consume a module using `createClass`
      'create-react-class': 'preact-compat/lib/create-react-class',
      // Not necessary unless you consume a module requiring `react-dom-factories`
      'react-dom-factories': 'preact-compat/lib/react-dom-factories',
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        cache: true,
        sourceMap: shouldGenSourceMap,
      }),
    ],
  },
  plugins,
  devtool: (mode === 'production') ? false : 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    host: '0.0.0.0',
    port: 9000,
    historyApiFallback: true,
  },
  externals: {
    preact: (mode === 'production') ? "preact" : false,
  },
};
