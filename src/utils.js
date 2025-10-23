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

  async waitForJiraType(maxWaitTime = 10000, checkInterval = 500) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkJiraType = () => {
        const jiraType = this.getJiraType();
        if (jiraType !== JiraType.UNKNOWN) {
          // console.log(`[Jira Optimizer] Jira type detected after ${(Date.now() - startTime)}ms: ${jiraType}`);
          resolve(jiraType);
          return;
        }

        if (Date.now() - startTime >= maxWaitTime) {
          // console.warn("[Jira Optimizer] Timeout waiting for Jira type detection, using UNKNOWN");
          resolve(JiraType.UNKNOWN);
          return;
        }

        setTimeout(checkJiraType, checkInterval);
      };

      checkJiraType();
    });
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

  validateAndNormalizeIssueId(inputValue) {
   /* Validation supporting: PROJ-123, PROJ123, PROJ 123, 123 */

   if (!inputValue || typeof inputValue !== 'string') {
     return { valid: false, normalized: null, error: 'INPUT_INVALID' };
   }

   const normalizedInput = inputValue.toUpperCase().trim();
   if (!normalizedInput) {
     return { valid: false, normalized: null, error: 'INPUT_EMPTY' };
   }

   // Define transformation patterns: [regex, transform function, format type]
   const patterns = [
     [/([A-Z_]{1,}-?\d+)/, (match) => match[1], 'standard'],                            // PROJ-123 or PROJ123
     [/([A-Z_]{1,})\s+(\d+)/, (match) => `${match[1]}-${match[2]}`, 'space_separated'], // PROJ 123
     [/^(\d+)$/, (match) => match[1], 'numeric_only']                                   // 123
   ];

   try {
     for (const [regex, transform, format] of patterns) {
       const match = normalizedInput.match(regex);
       if (match) {
         // Additional validation for project keys (must have at least one letter)
         if (format !== 'numeric_only' && !/[A-Z_]/.test(match[1])) {
           continue; // Skip if no letters in project part
         }

         return {
           valid: true,
           normalized: transform(match),
           error: null,
           format
         };
       }
     }

     return { valid: false, normalized: null, error: 'FORMAT_INVALID' };

   } catch (error) {
     console.error('[Jira Optimizer] Error validating issue ID:', error);
     return { valid: false, normalized: null, error: 'VALIDATION_ERROR' };
   }
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
