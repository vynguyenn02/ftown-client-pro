// karma.conf.js
const path = require('path');

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // tất cả spec.ts
    files: ['test/**/*.spec.ts'],

    preprocessors: {
      'test/**/*.spec.ts': ['webpack']
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',

      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          'env.mjs': path.resolve(__dirname, 'test/env.stub.js'),
          '@/config': path.resolve(__dirname, 'test/config.stub.js'),
          '@config': path.resolve(__dirname, 'test/config.stub.js'),
        }
      },

      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            use: {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                compilerOptions: {
                  // ← Ép module sang CommonJS
                  module: 'commonjs'
                }
              }
            }
          }
        ]
      }
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    reporters: ['dots'],
    browsers: ['ChromeHeadless'],
    singleRun: true,
    logLevel: config.LOG_INFO
  });
};
