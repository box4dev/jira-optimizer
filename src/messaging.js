/**
 * Messaging utilities for cross-browser extension communication
 * Provides unified API for Chrome and Firefox messaging
 */

export class Messaging {
  /**
   * Check if messaging APIs are available
   * @returns {boolean} True if messaging is available
   */
  static isAvailable() {
    return (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) ||
           (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage);
  }

  /**
   * Send message to background script
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} Response from background
   */
  static sendToBackground(message) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
        browser.runtime.sendMessage(message).then(resolve).catch(reject);
      } else {
        reject(new Error('Runtime messaging not available'));
      }
    });
  }

  /**
   * Send message to content script in specific tab
   * @param {number} tabId - Tab ID to send message to
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} Response from content script
   */
  static sendToContent(tabId, message) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } else if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.sendMessage) {
        browser.tabs.sendMessage(tabId, message).then(resolve).catch(reject);
      } else {
        reject(new Error('Tab messaging not available'));
      }
    });
  }
}