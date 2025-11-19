/**
 * Background script for Jira Optimizer Extension
 * Handles storage operations, messaging and cross-browser compatibility
 */

import { Storage } from './storage.js';
import { JiraDetector } from './jiraDetector.js';

// Message handlers for storage operations
const handleStorageGet = async (request, sendResponse) => {
  try {
    const result = await Storage.get(request.keys);
    sendResponse({ success: true, data: result });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

const handleStorageSet = async (request, sendResponse) => {
  try {
    await Storage.set(request.items);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'storage_get':
      handleStorageGet(request, sendResponse);
      return true; // Keep the message channel open for async response

    case 'storage_set':
      handleStorageSet(request, sendResponse);
      return true; // Keep the message channel open for async response

    case 'storage_local_get':
      Storage.get(request.keys)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'storage_local_set':
      Storage.set(request.items)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
  }
});

// Initialize default settings on install/update
chrome.runtime.onInstalled.addListener(async () => {
  const defaultSettings = {
    collapseRightPanel: true,
    expandCreateModal: true,
    viewLinkedTickets: true,
    expandImages: true,
    themeMode: 'light'
  };

  try {
    const savedSettings = await Storage.get(Object.keys(defaultSettings));
    const hasSavedSettings = Object.keys(savedSettings).length > 0;

    if (!hasSavedSettings) {
      await Storage.set(defaultSettings);
      // console.log('[Jira Optimizer] Default settings initialized');
    }
  } catch (error) {
    console.error('[Jira Optimizer] Error initializing default settings:', error);
  }
});

// Handle messages for Jira URL detection
const handleDetectJiraUrl = async (sendResponse) => {
  try {
    const tabs = await new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });

    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      if (JiraDetector.isJiraUrl(url)) {
        sendResponse({ detectedUrl: `${url.protocol}//${url.hostname}` });
      } else {
        sendResponse({ detectedUrl: null });
      }
    } else {
      sendResponse({ detectedUrl: null });
    }
  } catch (error) {
    sendResponse({ detectedUrl: null });
  }
};

const handleGetJiraUrlFromContent = async (sender, sendResponse) => {
  if (sender.tab && sender.tab.id) {
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(sender.tab.id, { action: 'getJiraInstance' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
      sendResponse({ detectedUrl: response?.jiraUrl || null });
    } catch (error) {
      sendResponse({ detectedUrl: null });
    }
  } else {
    sendResponse({ detectedUrl: null });
  }
};

// Additional message handlers
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'detectJiraUrl':
      handleDetectJiraUrl(sendResponse);
      return true;

    case 'getJiraUrlFromContent':
      handleGetJiraUrlFromContent(sender, sendResponse);
      return true;
  }
});