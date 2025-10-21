// Background script for Jira Optimizer Extension
// Handles storage operations and cross-browser compatibility

// Storage API abstraction for cross-browser compatibility
const storage = {
  async get(keys) {
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
        // Firefox
        browser.storage.local.get(keys).then(resolve).catch(reject);
      } else {
        reject(new Error('Storage API not available'));
      }
    });
  },

  async set(items) {
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
        // Firefox
        browser.storage.local.set(items).then(resolve).catch(reject);
      } else {
        reject(new Error('Storage API not available'));
      }
    });
  }
};

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'storage_get') {
    storage.get(request.keys)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }

  if (request.action === 'storage_set') {
    storage.set(request.items)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

// Initialize default settings on install/update
chrome.runtime.onInstalled.addListener(() => {
  const defaultSettings = {
    collapseRightPanel: true,
    expandCreateModal: true,
    viewLinkedTickets: true,
    expandImages: true
  };

  storage.get(Object.keys(defaultSettings)).then(savedSettings => {
    const hasSavedSettings = Object.keys(savedSettings).length > 0;
    if (!hasSavedSettings) {
      storage.set(defaultSettings).then(() => {
        console.log('[Jira Optimizer] Default settings initialized');
      }).catch(error => {
        console.error('[Jira Optimizer] Error initializing default settings:', error);
      });
    }
  }).catch(error => {
    console.error('[Jira Optimizer] Error checking saved settings:', error);
  });
});