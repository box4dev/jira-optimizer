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
    /*
     Supports various input formats:
     - PROJ-123 (standard format)
     - PROJ123 (without dash)
     - PROJ 123 (with space)
     - 123 (numbers only for default project)
     - PROJ_IRM-123 (with underscores in project key)
     */

     // Input validation and normalization
     if (!inputValue || typeof inputValue !== 'string') {
       return { valid: false, normalized: null, error: 'INPUT_INVALID' };
     }

     let normalizedInput = inputValue.toString().toUpperCase().trim();

     // Reject empty strings after trimming
     if (!normalizedInput) {
       return { valid: false, normalized: null, error: 'INPUT_EMPTY' };
     }

     // Simple regex patterns (more permissive than strict JIRA spec)
     const fullTicketRegex = new RegExp("([A-Z_]{1,}-\\d+)", "i");
     const semiTicketRegex = new RegExp("([A-Z_]{1,}\\d+)", "i");
     const spaceTicketRegex = new RegExp("([A-Z_]{1,}(\\s+)\\d+)", "i");
     const numbersOnlyRegex = new RegExp("(\\d+)", "i");

     try {
       // Check for standard format first (PROJ-123)
       const fullTicketMatch = normalizedInput.match(fullTicketRegex);
       if (fullTicketMatch) {
         return {
           valid: true,
           normalized: fullTicketMatch[0],
           error: null,
           format: 'standard'
         };
       }

       // Check for compact format (PROJ123)
       const semiTicketMatch = normalizedInput.match(semiTicketRegex);
       if (semiTicketMatch) {
         const semiTicket = semiTicketMatch[0];
         const jprojectRegex = new RegExp("([A-Z_]{1,})", "i");
         const jprojectText = semiTicket.match(jprojectRegex);
         const jprojectNumber = semiTicket.match(numbersOnlyRegex);

         const normalized = jprojectText[0].concat("-", jprojectNumber[0]);

         return {
           valid: true,
           normalized: normalized,
           error: null,
           format: 'compact'
         };
       }

       // Check for space-separated format (PROJ 123)
       const spaceMatch = normalizedInput.match(spaceTicketRegex);
       if (spaceMatch) {
         const normalized = normalizedInput.replace(/\s+/g, "-");

         return {
           valid: true,
           normalized: normalized,
           error: null,
           format: 'space_separated'
         };
       }

       // Check for numeric-only format (123) - for default project
       const numericMatch = normalizedInput.match(numbersOnlyRegex);
       if (numericMatch) {
         return {
           valid: true,
           normalized: numericMatch[0],
           error: null,
           format: 'numeric_only'
         };
       }

       // If none of the patterns match
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
