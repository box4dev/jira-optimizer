/**
 * Jira Expand Extension
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
const JiraExpandExtension = {
  init() {
    state.jiraType = Utils.getJiraType(); // Determine JiraType early
    if (state.jiraType === JiraType.UNKNOWN) {
      console.warn(`[Jira Optimizer] Unknown Jira type. Extension might not work correctly.`);
    }
    this.loadSettingsAndInitializeFeatures();
    this.setupMutationObserver();
  },

  loadSettingsAndInitializeFeatures() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local && chrome.runtime && chrome.runtime.id) {
      chrome.storage.local.get([
        'collapseRightPanel',
        'expandCreateModal',
        'viewLinkedTickets',
        'expandImages'
      ], (settings) => {
        if (chrome.runtime.lastError) {
          console.error('[Jira Optimizer] Error loading settings:', chrome.runtime.lastError.message);
          this.applyFeaturesBasedOnSettings(); // Use defaults
          return;
        }
        state.settings = {
          collapseRightPanel: settings.collapseRightPanel !== false,
          expandCreateModal: settings.expandCreateModal !== false,
          viewLinkedTickets: settings.viewLinkedTickets !== false,
          expandImages: settings.expandImages !== false
        };
        this.applyFeaturesBasedOnSettings();
      });
    } else {
      console.warn("[Jira Optimizer]  chrome.storage.local not available. Using default settings.");
      this.applyFeaturesBasedOnSettings();
    }
  },

  applyFeaturesBasedOnSettings() {
    if (state.jiraType !== JiraType.UNKNOWN) {
      if (state.settings.collapseRightPanel) {
        CollapsePanel.init();
      }
      if (state.settings.expandCreateModal) {
        ExpandModal.init();
      }
      if (state.settings.viewLinkedTickets) {
        LinkedIssues.init();
      }
      if (state.settings.expandImages) {
        ExpandImages.init();
      }
    } else {
      console.log("[Jira Optimizer] Not a recognized Jira page or Jira type unknown. Features not activated.");
    }
  },

  runFeatureInitializers() {
    // Re-determine JiraType in case of SPA navigation
    state.jiraType = Utils.getJiraType();
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

// Initialize the extension
function initialize() {
  setTimeout(() => JiraExpandExtension.init(), 100); // Small delay for page elements
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}