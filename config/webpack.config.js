'use strict';

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PATHS = require('./paths');
const path = require('path');

module.exports = () => {
  const env = process.env.WEBPACK_ENV;
  const isFirefox = env.trim() === 'firefox'; // Define se é Firefox ou Chrome/Edge

  // Merge webpack configuration files
  const config = merge(common, {
    entry: {
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
      // popup: PATHS.src + '/popup.js',
    },
    plugins: [
      // Copia e modifica o manifest.json conforme o ambiente
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

  return config;
};
