'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PATHS = require('./paths');
const path = require('path');

// Function to create configuration for a specific browser
const createConfig = (browser) => {
  const isFirefox = browser === 'firefox';

  return merge(common, {
    output: {
      path: isFirefox ? PATHS.buildFirefox : PATHS.buildChrome,
      filename: '[name].js',
    },
    entry: {
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
      // popup: PATHS.src + '/popup.js',
    },
    plugins: [
      // Copy and modify manifest.json according to the environment
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(
              PATHS.src, isFirefox
              ? 'manifest.firefox.json'
              : 'manifest.chrome.json'
            ),
            to: 'manifest.json',
            transform(content) {
              const manifest = JSON.parse(content.toString());
              return JSON.stringify(manifest, null, 2);
            }
          }
        ]
      })
    ]
  });
};

module.exports = () => {
  // Retorna configurações para Chrome e Firefox
  return [
    createConfig('chrome'),
    createConfig('firefox')
  ];
};
