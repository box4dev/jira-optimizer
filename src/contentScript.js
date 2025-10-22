/**
 * Jira Optimizer Extension
 * Enhances Jira Cloud and Server with expandable modals and linked issue viewing
 * @author Marcelo Lourenço
 * @version 2.1 (Refactored)
 */

import { state } from './state.js';
import { Utils } from './utils.js';
import { JiraType } from './constants.js';

// Features
import { CollapsePanel } from './features/collapsePanel.js';
import { ExpandModal } from './features/expandModal.js';
import { LinkedIssues } from './features/linkedIssues.js';
import { ExpandImages } from './features/expandImages.js';

// Main Application
const JiraOptimizerExtension = {
  async init() {
    // console.log("[Jira Optimizer] Initializing extension...");
    state.jiraType = await Utils.waitForJiraType(); // Wait for JiraType to be determined
    //console.log(`[Jira Optimizer] Jira type detected: ${state.jiraType}`);
    if (state.jiraType === JiraType.UNKNOWN) {
      console.warn(`[Jira Optimizer] Unknown Jira type. Extension might not work correctly.`);
    }
    this.loadSettingsAndInitializeFeatures();
    this.setupMutationObserver();
  },

  async loadSettingsAndInitializeFeatures() {
    try {
      const response = await this.sendMessageToBackground({
        action: 'storage_get',
        keys: ['collapseRightPanel', 'expandCreateModal', 'viewLinkedTickets', 'expandImages']
      });

      if (response.success) {
        const settings = response.data;
        // console.log("[Jira Optimizer] Settings loaded:", settings);
        state.settings = {
          collapseRightPanel: settings.collapseRightPanel !== false,
          expandCreateModal: settings.expandCreateModal !== false,
          viewLinkedTickets: settings.viewLinkedTickets !== false,
          expandImages: settings.expandImages !== false
        };
      } else {
        console.warn('[Jira Optimizer] Error loading settings:', response.error);
        // Use defaults
      }
    } catch (error) {
      // Handle known extension errors gracefully
      if (error.message && error.message.includes('Extension context invalidated')) {
        // Extension was reloaded/refreshed, this is normal - silently use defaults
        console.log('[Jira Optimizer] Extension context invalidated, using default settings');
      } else {
        console.warn('[Jira Optimizer] chrome.runtime not available or messaging failed. Using default settings.', error);
      }
    }

    this.applyFeaturesBasedOnSettings();
  },

  applyFeaturesBasedOnSettings() {
    // console.log("[Jira Optimizer] Applying features based on settings:", state.settings);
    if (state.jiraType !== JiraType.UNKNOWN) {
      if (state.settings.collapseRightPanel) {
        // console.log("[Jira Optimizer] Initializing CollapsePanel");
        CollapsePanel.init();
      }
      if (state.settings.expandCreateModal) {
        // console.log("[Jira Optimizer] Initializing ExpandModal");
        ExpandModal.init();
      }
      if (state.settings.viewLinkedTickets) {
        // console.log("[Jira Optimizer] Initializing LinkedIssues");
        LinkedIssues.init();
      }
      if (state.settings.expandImages) {
        // console.log("[Jira Optimizer] Initializing ExpandImages");
        ExpandImages.init();
      }
    } else {
      console.log("[Jira Optimizer] Not a recognized Jira page or Jira type unknown. Features not activated.");
    }
  },

  async runFeatureInitializers() {
    // Re-determine JiraType in case of SPA navigation
    state.jiraType = await Utils.waitForJiraType(2000); // Shorter wait for re-initialization
    this.applyFeaturesBasedOnSettings();
  },

  setupMutationObserver() {
    const observer = new MutationObserver(Utils.debounce((mutations) => {
      // Check if significant DOM changes occurred
      //if (mutations.some(m => m.addedNodes.length > 0 || (m.type === 'attributes' && m.target.id === 'jira'))) {
      // console.log("[Jira Optimizer] DOM changes detected, re-running feature initializers.");
      this.runFeatureInitializers();
      //}
    }, 500)); // Debounce to avoid excessive calls

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true // Observe attribute changes on body, e.g. if 'id=jira' is added later
    });
  }
};

// Cross-browser messaging helper
JiraOptimizerExtension.sendMessageToBackground = function(message) {
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
};

// Cross-browser messaging helper for content script
JiraOptimizerExtension.sendMessageToBackground = function(message) {
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
};

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJiraInstance') {
    // Try to detect Jira instance from current page
    const jiraUrl = detectJiraInstanceFromPage();
    sendResponse({ jiraUrl: jiraUrl });
  }
});

// Function to detect Jira instance from the current page
function detectJiraInstanceFromPage() {
  try {
    const url = new URL(window.location.href);

    // Common Jira detection patterns
    if (url.hostname.includes('atlassian.net')) {
      return `${url.protocol}//${url.hostname}`;
    }

    if (url.hostname.includes('jira')) {
      return `${url.protocol}//${url.hostname}`;
    }

    // Look for Jira-specific elements or meta tags that indicate Jira instance
    const metaTags = document.querySelectorAll('meta[name]');
    for (let meta of metaTags) {
      if (meta.name.toLowerCase().includes('jira') || meta.content.toLowerCase().includes('jira')) {
        return `${url.protocol}//${url.hostname}`;
      }
    }

    // Check for specific Jira DOM elements
    const jiraSelectors = [
      'meta[name="ajs-context-path"]',
      'meta[name="ajs-base-url"]',
      '[data-testid*="jira"]',
      '.jira-header',
      '#jira-frontend',
      '#page'
    ];

    for (let selector of jiraSelectors) {
      if (document.querySelector(selector)) {
        return `${url.protocol}//${url.hostname}`;
      }
    }

    // Check for Jira-specific URL patterns
    const jiraPaths = [
      '/browse/',
      '/projects/',
      '/issues/',
      '/dashboard',
      '/secure/dashboard',
      '/jira/dashboard'
    ];

    if (jiraPaths.some(path => url.pathname.includes(path))) {
      return `${url.protocol}//${url.hostname}`;
    }

  } catch (error) {
    console.error('[Jira Optimizer] Error detecting Jira instance:', error);
  }

  return null;
}

// Initialize the extension
async function initialize() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => JiraOptimizerExtension.init());
  } else {
    await JiraOptimizerExtension.init();
  }
}

initialize();