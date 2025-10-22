/**
 * Theme management utilities for extension UI
 * Provides unified theme application logic for popups and options pages
 */

// Make ThemeManager available globally
class ThemeManager {
  /**
   * Apply theme to the current document
   * @param {string} theme - Theme to apply ('light', 'dark', 'device')
   */
  static applyTheme(theme) {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('joc-theme-light', 'joc-theme-dark', 'joc-theme-device');

    // Apply device theme detection if needed
    if (theme === 'device') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'joc-theme-dark' : 'joc-theme-light');

      // Listen for changes in system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        root.classList.remove('joc-theme-light', 'joc-theme-dark');
        root.classList.add(e.matches ? 'joc-theme-dark' : 'joc-theme-light');
      };
      mediaQuery.addEventListener('change', handleChange);

      // Store the listener to potentially remove it later if theme changes
      root._deviceThemeListener = handleChange;
    } else {
      root.classList.add(`joc-theme-${theme}`);
      // Remove device listener if it exists
      if (root._deviceThemeListener) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.removeEventListener('change', root._deviceThemeListener);
        delete root._deviceThemeListener;
      }
    }
  }

  /**
   * Load theme from storage and apply it
   * @param {Object} storage - Storage API (chrome.storage or similar)
   * @returns {Promise<string>} Applied theme
   */
  static async loadAndApplyTheme(storage = chrome.storage) {
    return new Promise((resolve) => {
      storage.local.get(['themeMode'], (result) => {
        const savedTheme = result.themeMode || 'light';
        this.applyTheme(savedTheme);
        resolve(savedTheme);
      });
    });
  }

  /**
   * Save theme to storage and apply it
   * @param {string} theme - Theme to save and apply
   * @param {Object} storage - Storage API (chrome.storage or similar)
   */
  static async saveAndApplyTheme(theme, storage = chrome.storage) {
    await new Promise((resolve, reject) => {
      storage.local.set({ themeMode: theme }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
    this.applyTheme(theme);
  }
}

// Make available globally
window.ThemeManager = ThemeManager;