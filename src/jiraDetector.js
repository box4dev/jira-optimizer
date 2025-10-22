/**
 * Jira detection utilities
 * Handles detection of Jira instances and types
 */

export class JiraDetector {
  /**
   * Detect Jira type from DOM
   * @returns {string} Jira type (CLOUD, SERVER, or UNKNOWN)
   */
  static detectType() {
    if (document.getElementById('jira-frontend')) {
      return 'CLOUD';
    } else if (document.getElementById('page')) {
      return 'SERVER';
    }
    return 'UNKNOWN';
  }

  /**
   * Wait for Jira type to be detectable
   * @param {number} maxWaitTime - Maximum wait time in ms
   * @param {number} checkInterval - Check interval in ms
   * @returns {Promise<string>} Jira type
   */
  static async waitForType(maxWaitTime = 10000, checkInterval = 500) {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkJiraType = () => {
        const jiraType = this.detectType();
        if (jiraType !== 'UNKNOWN') {
          resolve(jiraType);
          return;
        }

        if (Date.now() - startTime >= maxWaitTime) {
          resolve('UNKNOWN');
          return;
        }

        setTimeout(checkJiraType, checkInterval);
      };

      checkJiraType();
    });
  }

  /**
   * Detect Jira instance URL from page
   * @returns {string|null} Detected Jira URL or null
   */
  static detectUrlFromPage() {
    try {
      const url = new URL(window.location.href);

      // Common Jira detection patterns
      if (url.hostname.includes('atlassian.net')) {
        return `${url.protocol}//${url.hostname}`;
      }

      if (url.hostname.includes('jira')) {
        return `${url.protocol}//${url.hostname}`;
      }

      // Look for Jira-specific elements or meta tags
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
      // console.error('[Jira Optimizer] Error detecting Jira instance:', error);
    }

    return null;
  }

  /**
   * Improved Jira URL detection function
   * @param {URL} url - URL object to check
   * @returns {boolean} True if it's a Jira URL
   */
  static isJiraUrl(url) {
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    // Common Jira patterns
    if (hostname.includes('atlassian.net')) {
      return true;
    }

    if (hostname.includes('jira')) {
      return true;
    }

    // Check for Jira-specific paths that indicate it's a Jira instance
    const jiraPaths = [
      '/browse/',
      '/projects/',
      '/issues/',
      '/dashboard',
      '/secure/dashboard',
      '/jira/dashboard'
    ];

    return jiraPaths.some(path => pathname.includes(path));
  }
}