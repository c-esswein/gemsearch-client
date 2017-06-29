"use strict";
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');


module.exports = function(env) {
  // whether to perform a compacted/optimized production build or not
  const IS_PRODUCTION_BUILD = env && env.production || false;


  const config = {
    entry: {
      'app': (
        IS_PRODUCTION_BUILD
        ? [
          'babel-polyfill',
          'whatwg-fetch',
          './src/index.tsx',
        ]
        : [
          'babel-polyfill',
          'whatwg-fetch',
          'react-hot-loader/patch',
          './src/index.tsx',
        ]
      )
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: IS_PRODUCTION_BUILD ? "[name].bundle.[hash].js" : "[name].bundle.js",
      publicPath: (IS_PRODUCTION_BUILD ? "./" : "/"),
    },
    devtool: IS_PRODUCTION_BUILD ? 'none' : 'cheap-module-inline-source-map', // https://github.com/webpack/webpack/issues/2145
    resolve: {
      // https://webpack.js.org/configuration/resolve/
      modules: [
        //path.resolve('.'),
        path.resolve(__dirname, "src/"),
        path.resolve(__dirname, "src/styles/"),
        'node_modules',
      ],
      alias: {
        // to get react-hot working with react 15.4.x https://github.com/gaearon/react-hot-loader/issues/417
        //'react/lib/ReactMount': 'react-dom/lib/ReactMount' // should be obsolete with hot reload 3

        styles: path.resolve(__dirname, "src/styles/"),
      },
      extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.html', 'css', 'scss'],
    },
    plugins: (
      IS_PRODUCTION_BUILD
      ? (
        // plugins for production
        [
          // https://github.com/s-panferov/awesome-typescript-loader
          new CheckerPlugin(),
          new TsConfigPathsPlugin({
            tsconfig: __dirname + '/tsconfig.json',
            compiler: 'typescript'
          }),

          // to skip the emitting phase whenever there are errors while compiling
          new webpack.NoEmitOnErrorsPlugin(),
          // create a foobar.gz file for all assets
          new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.(js|html|css|svg|woff|woff2|tff|eot)$/,
            threshold: 10240, // the min size in bytes
            minRatio: 0.9,
          }),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify('production'),
            }
          }),
          new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|de)$/), // only load de and en locales for moment.js
          new HtmlWebpackPlugin({
            title: 'Searchify',
            filename: 'index.html',
            template: 'src/index.ejs',
          }),
          new webpack.LoaderOptionsPlugin({
            minimize: true
          }),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: true,
            },
            mangle: false,
            sourceMap: false,
          }),
          new ExtractTextPlugin({
            filename: "[name].[contenthash].css",
            allChunks: true,
          }),
          new webpack.LoaderOptionsPlugin({
            // https://webpack.js.org/guides/migrating/#loaderoptionsplugin-context
            options: {
              context: __dirname
            }
          }),
        ]
      )
      : (
        // plugins for development
        [
          // https://github.com/s-panferov/awesome-typescript-loader
          new CheckerPlugin(),
          new TsConfigPathsPlugin({
            tsconfig: __dirname + '/tsconfig.json',
            compiler: 'typescript'
          }),

          new webpack.HotModuleReplacementPlugin(),

          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify('development'),
            }
          }),
          new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en|de)$/), // only load de and en locales for moment.js
          new HtmlWebpackPlugin({
            title: 'Searchify',
            filename: 'index.html',
            alwaysWriteToDisk: true,
            template: 'src/index.ejs',
          }),
          new HtmlWebpackHarddiskPlugin(),
          new ExtractTextPlugin({
            filename: "[name].[contenthash].css",
            allChunks: true,
          }),
          new webpack.LoaderOptionsPlugin({
            // https://webpack.js.org/guides/migrating/#loaderoptionsplugin-context
            options: {
              context: __dirname
            }
          }),
          new webpack.NamedModulesPlugin(),
        ]
      )
    ),
    module: {
      rules: [
        {
          // all the assets go to the same folder in the dist folder
          test: /\.((woff|woff2|otf|ttf|eot|ico|png|jpg|svg|json)(\?v=[0-9]\.[0-9]\.[0-9])?)$/,
          include: [
            path.resolve(__dirname, "src/assets"),
          ],
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
            context: "./src/",
          },
        },
        {
          // use json5 loader to allow single and double line comments in json files
          test: /\.(json|json5)?$/,
          use: [
            'json5-loader',
          ],
          exclude: [
            // do not modify json files in the assets folder
            path.resolve(__dirname, "src/assets"),
          ]
        },
        {
          test: /\.(html?)$/,
          loader: "file-loader?name=[path][name].[ext]&context=./src/",
        },
        {
          test: /\.[t|j]sx?$/,
          exclude: /(node_modules|bower_components)/,
          use: (
            IS_PRODUCTION_BUILD
            ? [
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,
                }
              },
              {
                loader: 'awesome-typescript-loader',
                options: {
                  useCache: true,
                  cacheDirectory: 'node_modules/.cache/awesome-typescript-loader',
                },
              },
            ]
            : [
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,
                },
              },
              {
                loader: 'awesome-typescript-loader',
                options: {
                  useCache: true,
                  cacheDirectory: 'node_modules/.cache/awesome-typescript-loader',
                },
              },
            ]
          ),
        },
        {
          test: /\.(css|scss)$/,
          use: (
            IS_PRODUCTION_BUILD
            ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: [
                {
                  loader: "css-loader",
                  options: {
                    importLoaders: 1, // tells the style-loader that the imports are handled by postcss
                  },
                },
                {
                  loader: "postcss-loader",
                  // see postcss.config.js for config
                },
              ],
            })
            : [
              {
                loader: "style-loader",
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1, // tells the style-loader that the imports are handled by postcss
                  sourceMap: true,
                },
              },
              {
                loader: "postcss-loader",
                // see postcss.config.js for config
                options: {
                  sourceMap: true,
                },
              },
            ]
          ),
        },
      ],
    },
  };

  if (!IS_PRODUCTION_BUILD) {
    config.devServer = {
      port: 8080,
      quiet: false,
      noInfo: false,
      hot: true,
      compress: true,
      clientLogLevel: 'error', // https://webpack.js.org/configuration/dev-server/#devserver-clientloglevel
      stats: "errors-only", // https://webpack.js.org/configuration/dev-server/#devserver-stats-
      contentBase: path.join(__dirname, "dist"),
      watchOptions: {
        poll: false, // enable polling here
      },
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          secure: false
        }
      },
      disableHostCheck: true, // FIXME: should be replaced with allowedHosts once https://github.com/webpack/webpack-dev-server/pull/899 is merged
    };
  }

  return config;
}
