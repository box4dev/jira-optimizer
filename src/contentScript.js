/**
 * Jira Optimizer Extension
 * Enhances Jira Cloud and Server with expandable modals and linked issue viewing
 * @author Marcelo Lourenço
 * @version 2.1 (Refactored)
 */

import { state } from './state.js';
import { Utils } from './utils.js';
import { JiraType } from './constants.js';
import { Messaging } from './messaging.js';
import { JiraDetector } from './jiraDetector.js';

// Features
import { CollapsePanel } from './features/collapsePanel.js';
import { ExpandModal } from './features/expandModal.js';
import { LinkedIssues } from './features/linkedIssues.js';
import { ExpandImages } from './features/expandImages.js';

// Main Application
const JiraOptimizerExtension = {
  async init() {
    // console.log("[Jira Optimizer] Initializing extension...");
    state.jiraType = await JiraDetector.waitForType(); // Wait for JiraType to be determined
    // console.log(`[Jira Optimizer] Jira type detected: ${state.jiraType}`);

    // Detect and save Jira URL automatically if not saved yet
    this.detectAndSaveJiraUrl();

    if (state.jiraType === JiraType.UNKNOWN) {
      // console.warn(`[Jira Optimizer] Unknown Jira type. Extension might not work correctly.`);
    }
    this.loadSettingsAndInitializeFeatures();
    this.setupMutationObserver();
  },

  async detectAndSaveJiraUrl() {
    try {
      // Check if we already have a saved URL
      const response = await Messaging.sendToBackground({
        action: 'storage_local_get',
        keys: ['jiraUrl']
      });

      if (response.success && response.data && response.data.jiraUrl) {
        // Already have a saved URL, no need to detect
        return;
      }

      // No saved URL, try to detect from current page
      const detectedUrl = JiraDetector.detectUrlFromPage();

      if (detectedUrl) {
        // Save the detected URL automatically
        await Messaging.sendToBackground({
          action: 'storage_local_set',
          items: { jiraUrl: detectedUrl }
        });
        console.log('[Jira Optimizer] Jira URL automatically detected and saved:', detectedUrl);
      }
    } catch (error) {
      // console.warn('[Jira Optimizer] Error detecting/saving Jira URL:', error);
    }
  },

  async loadSettingsAndInitializeFeatures() {
    try {
      const response = await Messaging.sendToBackground({
        action: 'storage_get',
        keys: ['collapseRightPanel', 'expandCreateModal', 'viewLinkedTickets', 'expandImages', 'themeMode']
      });

      if (response.success) {
        const settings = response.data;
        // console.log("[Jira Optimizer] Settings loaded:", settings);
        state.settings = {
          collapseRightPanel: settings.collapseRightPanel !== false,
          expandCreateModal: settings.expandCreateModal !== false,
          viewLinkedTickets: settings.viewLinkedTickets !== false,
          expandImages: settings.expandImages !== false,
          themeMode: settings.themeMode || 'light'
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
    state.jiraType = await JiraDetector.waitForType(2000); // Shorter wait for re-initialization
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

// Use unified messaging helper
JiraOptimizerExtension.sendMessageToBackground = Messaging.sendToBackground;

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJiraInstance') {
    // Try to detect Jira instance from current page
    const jiraUrl = JiraDetector.detectUrlFromPage();
    sendResponse({ jiraUrl: jiraUrl });
  }
});

// Initialize the extension
async function initialize() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => JiraOptimizerExtension.init());
  } else {
    await JiraOptimizerExtension.init();
  }
}

initialize();