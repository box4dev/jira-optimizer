import { state } from './state.js';
import { JiraType, Selectors } from './constants.js';

export const Utils = {
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  getI18nMessage(key, substitutions = []) {
    if (typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.getMessage) {
      return chrome.i18n.getMessage(key, substitutions);
    }
    return key; // Fallback to key if i18n is not available
  },

  getJiraType() {
    if (document.getElementById('jira-frontend')) {
      return JiraType.CLOUD;
    } else if (document.getElementById('page')) {
      return JiraType.SERVER;
    }
    return JiraType.UNKNOWN;
  },

  getProjectKeyFromURL() {
    const match = window.location.pathname.match(/\/projects\/([A-Z]+)\/board/);
    return match ? match[1] : null;
  },

  getSelector(key) {
    const typeSelectors = Selectors[state.jiraType];
    if (!typeSelectors) {
      console.warn(`[Jira Optimizer] JiraType ${state.jiraType} not found in Selectors.`);
      return Selectors[JiraType.UNKNOWN]?.[key] || ''; // Fallback
    }
    return typeSelectors[key] || '';
  },

  createElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);
    for (const key in attributes) {
      if (key === 'dataset') {
        for (const dataKey in attributes.dataset) {
          element.dataset[dataKey] = attributes.dataset[dataKey];
        }
      } else if (key === 'style' && typeof attributes.style === 'object') {
        Object.assign(element.style, attributes.style);
      } else {
        element[key] = attributes[key];
      }
    }
    children.forEach(child => element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child));
    return element;
  },

  async fetchWithRetry(url, retries = 3) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Utils.fetchWithRetry(url, retries - 1); // Use Utils.fetchWithRetry for explicit context
      }
      console.error('[Jira Optimizer] Fetch failed after multiple retries:', error);
      throw error;
    }
  }
};
