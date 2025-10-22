/**
 * Storage utilities for cross-browser extension storage
 * Provides unified API for Chrome and Firefox storage
 */

export class Storage {
  /**
   * Check if storage APIs are available
   * @returns {boolean} True if storage is available
   */
  static isAvailable() {
    return (typeof chrome !== 'undefined' && chrome.storage) ||
           (typeof browser !== 'undefined' && browser.storage);
  }

  /**
   * Get data from storage
   * @param {string|string[]} keys - Keys to retrieve
   * @returns {Promise<Object>} Retrieved data
   */
  static async get(keys) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      } else if (typeof browser !== 'undefined' && browser.storage) {
        browser.storage.local.get(keys).then(resolve).catch(reject);
      } else {
        reject(new Error('Storage API not available'));
      }
    });
  }

  /**
   * Set data in storage
   * @param {Object} items - Items to store
   * @returns {Promise<void>}
   */
  static async set(items) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else if (typeof browser !== 'undefined' && browser.storage) {
        browser.storage.local.set(items).then(resolve).catch(reject);
      } else {
        reject(new Error('Storage API not available'));
      }
    });
  }

  /**
   * Clear storage
   * @returns {Promise<void>}
   */
  static async clear() {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else if (typeof browser !== 'undefined' && browser.storage) {
        browser.storage.local.clear().then(resolve).catch(reject);
      } else {
        reject(new Error('Storage API not available'));
      }
    });
  }
}