/**
 * Substitui manualmente os placeholders i18n no HTML do popup
 * O Chrome Extensions não faz isso automaticamente para popups
 */
function replaceI18nPlaceholders() {
  // Mapeamento de placeholders para suas respectivas mensagens
  const i18nMap = {
    '__MSG_settingsTitle__': 'settingsTitle',
    '__MSG_optionsPageTitle__': 'optionsPageTitle',
    '__MSG_reloadRequired__': 'reloadRequired',
    '__MSG_globalSettings__': 'globalSettings',
    '__MSG_enableFeatures__': 'enableFeatures',
    '__MSG_features__': 'features',
    '__MSG_collapseRightPanel__': 'collapseRightPanel',
    '__MSG_expandCreateModal__': 'expandCreateModal',
    '__MSG_viewLinkedTickets__': 'viewLinkedTickets',
    '__MSG_expandImages__': 'expandImages',
    '__MSG_searchIssue__': 'searchIssue',
    '__MSG_issueId__': 'issueId',
    '__MSG_enterIssueIdPlaceholder__': 'enterIssueIdPlaceholder',
    '__MSG_openIssue__': 'openIssue',
    '__MSG_pleaseEnterIssueId__': 'pleaseEnterIssueId',
    '__MSG_errorOpeningIssue__': 'errorOpeningIssue'
  };

  // Função para substituir texto em um elemento e seus filhos
  function replaceInElement(element) {
    if (element.nodeType === Node.TEXT_NODE) {
      let text = element.textContent;
      let replaced = false;

      Object.keys(i18nMap).forEach(placeholder => {
        if (text.includes(placeholder)) {
          const messageKey = i18nMap[placeholder];
          const translatedText = chrome.i18n.getMessage(messageKey);
          if (translatedText) {
            text = text.replace(new RegExp(placeholder, 'g'), translatedText);
            replaced = true;
          }
        }
      });

      if (replaced) {
        element.textContent = text;
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      // Processar atributos que podem conter placeholders
      ['title', 'alt', 'placeholder'].forEach(attr => {
        if (element.hasAttribute(attr)) {
          let value = element.getAttribute(attr);
          Object.keys(i18nMap).forEach(placeholder => {
            if (value.includes(placeholder)) {
              const messageKey = i18nMap[placeholder];
              const translatedText = chrome.i18n.getMessage(messageKey);
              if (translatedText) {
                value = value.replace(new RegExp(placeholder, 'g'), translatedText);
              }
            }
          });
          element.setAttribute(attr, value);
        }
      });

      // Processar filhos recursivamente
      Array.from(element.childNodes).forEach(replaceInElement);
    }
  }

  // Aplicar substituição em todo o documento
  replaceInElement(document.body);

  // Atualizar o título da página se necessário
  const titleElement = document.querySelector('title');
  if (titleElement && titleElement.textContent.includes('__MSG_')) {
    Object.keys(i18nMap).forEach(placeholder => {
      if (titleElement.textContent.includes(placeholder)) {
        const messageKey = i18nMap[placeholder];
        const translatedText = chrome.i18n.getMessage(messageKey);
        if (translatedText) {
          titleElement.textContent = titleElement.textContent.replace(new RegExp(placeholder, 'g'), translatedText);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Definir lang dinamicamente baseado na localização atual
  const uiLanguage = chrome.i18n.getUILanguage();
  document.documentElement.lang = uiLanguage;

  // Aplicar internacionalização primeiro
  replaceI18nPlaceholders();

  // Adicionar funcionalidade ao ícone de configurações
  const settingsIcon = document.getElementById('joc-icon-settings');
  if (settingsIcon) {
    settingsIcon.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  const settingConfiguration = {
    'enableAll': {
      label: chrome.i18n.getMessage('enableFeatures'),
      dependentSettings: ['collapseRightPanel', 'expandCreateModal', 'viewLinkedTickets', 'expandImages'],
      default: true
    },
    'collapseRightPanel': {
      label: chrome.i18n.getMessage('collapseRightPanel'),
      functions: ['fnCollapseLoad', 'fnCollapseOpen'],
      default: true
    },
    'expandCreateModal': {
      label: chrome.i18n.getMessage('expandCreateModal'),
      functions: ['fnShrinkExpand'],
      default: true
    },
    'viewLinkedTickets': {
      label: chrome.i18n.getMessage('viewLinkedTickets'),
      functions: ['addIconToCard'],
      default: true
    },
    'expandImages': {
      label: chrome.i18n.getMessage('expandImages'),
      functions: [''],
      default: true
    },
  };

  const reloadMessageElement = document.getElementById('joc-reload-message');
  let reloadMessageTimeout;

  /**
   * Loads all settings at once from chrome.storage.local.
   */
  chrome.storage.local.get(Object.keys(settingConfiguration), (savedSettings) => {
    if (chrome.runtime.lastError) {
      console.error('[Jira Optimizer] Error loading settings:', chrome.runtime.lastError.message);
      return;
    }

    /** @type {boolean} - Indicates if settings have been previously saved in storage. */
    const hasSavedSettings = Object.keys(savedSettings).length > 0;
    const enableAllCheckbox = document.getElementById('toggle-enableAll');

    /**
     * Configures each checkbox individually based on stored settings or default values.
     */
    Object.keys(settingConfiguration).forEach(settingKey => {
      const checkbox = document.getElementById(`toggle-${settingKey}`);
      if (!checkbox) return;

      /** @type {boolean} - The initial checked state for the current checkbox. */
      let initialCheckedState = settingConfiguration[settingKey].default;
      if (hasSavedSettings && savedSettings[settingKey] !== undefined) {
        initialCheckedState = savedSettings[settingKey];
      }
      checkbox.checked = initialCheckedState;

      /**
       * Adds a change event listener to each checkbox to save its state
       * and handle master/dependent logic.
       */
      checkbox.addEventListener('change', () => {
        const isChecked = checkbox.checked;
        saveSetting(settingKey, isChecked);

        // If the master setting ('enableAll') changed, update dependent settings.
        if (settingKey === 'enableAll') {
          updateDependentSettings(isChecked);
        }

        // Show the "Reload Required" message.
        if (reloadMessageElement) {
          clearTimeout(reloadMessageTimeout);
          reloadMessageElement.style.opacity = '1';
          reloadMessageTimeout = setTimeout(() => {
            reloadMessageElement.style.opacity = '0';
          }, 2000); // Hide after 2 seconds.
        }
      });
    });

    /**
     * After all checkboxes are initialized, adjust the state of dependent settings
     * based on the loaded state of the 'enableAll' master checkbox.
     */
    if (enableAllCheckbox) {
      const masterEnableState = enableAllCheckbox.checked;
      settingConfiguration.enableAll.dependentSettings.forEach(depSettingKey => {
        const depCheckbox = document.getElementById(`toggle-${depSettingKey}`);
        if (depCheckbox) {
          depCheckbox.disabled = !masterEnableState;
          // Se o mestre está desabilitado, os filhos também devem estar desabilitados E desmarcados.
          // If the master is disabled, children should also be disabled AND unchecked.
          // Saves this state for consistency.
          if (!masterEnableState) {
            if (depCheckbox.checked) { // Only change and save if it was checked.
              depCheckbox.checked = false;
              saveSetting(depSettingKey, false);
            }
          }
          // Se o mestre está habilitado, os filhos ficam habilitados (disabled=false).
          // If the master is enabled, children are enabled (disabled=false).
          // Their 'checked' states (which were loaded from storage) are maintained.
        }
      });
    }

    /**
     * If there were no saved settings, save the default settings.
     * This happens after the checkboxes have been configured and dependent settings adjusted.
     */
    if (!hasSavedSettings) {
      saveDefaultSettings();
    }
  });

  /**
   * Updates dependent settings when the master 'enableAll' toggle is changed by the user.
   * @param {boolean} enable - Whether to enable or disable the dependent settings.
   */
  function updateDependentSettings(enable) {
    settingConfiguration.enableAll.dependentSettings.forEach(depSettingKey => {
      const checkbox = document.getElementById(`toggle-${depSettingKey}`);
      if (checkbox) {
        checkbox.checked = enable;
        checkbox.disabled = !enable; // Enable/disable the child checkbox.
        saveSetting(depSettingKey, enable); // Save the forced state of the child.
      }
    });
  }

  /**
   * Saves an individual setting to chrome.storage.local.
   * @param {string} key - The key of the setting to save.
   * @param {boolean} value - The value of the setting to save.
   */
  function saveSetting(key, value) {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        console.error(`[Jira Optimizer] Error saving setting "${key}":`, chrome.runtime.lastError.message);
      } else {
        console.log(`[Jira Optimizer] Setting "${key}" saved as: ${value}`); // Optional: for debugging
      }
    });
  }

  // Quick Open Issue functionality
  const openIssueButton = document.getElementById('openIssue');
  const idIssueInput = document.getElementById('idIssue');

  if (openIssueButton && idIssueInput) {
    openIssueButton.addEventListener('click', async () => {
      const issueId = idIssueInput.value.trim();
      if (!issueId) {
        const issueMessageDiv = document.getElementById('issueMessage');
        if (issueMessageDiv) {
          issueMessageDiv.style.display = 'block';
          setTimeout(() => {
            issueMessageDiv.style.display = 'none';
          }, 3000);
        }
        return;
      }

      try {
        // Get Jira URL from storage or detect from current tab
        let jiraUrl = await getJiraUrl();

        if (!jiraUrl) {
          // Open options page to configure Jira URL
          chrome.runtime.openOptionsPage();
          return;
        }

        // Construct the issue URL
        const issueUrl = `${jiraUrl}/browse/${issueId}`;

        // Open the issue in a new tab
        chrome.tabs.create({ url: issueUrl });
      } catch (error) {
        console.error('Error opening issue:', error);
        const errorMessageDiv = document.getElementById('errorMessage');
        if (errorMessageDiv) {
          errorMessageDiv.style.display = 'block';
          setTimeout(() => {
            errorMessageDiv.style.display = 'none';
          }, 5000);
        }
      }
    });

    // Allow Enter key to trigger open
    idIssueInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        openIssueButton.click();
      }
    });
  }

  /**
   * Gets the Jira URL either from storage or by detecting from current tab
   */
  async function getJiraUrl() {
    // First, try to get from sync storage (user configured)
    return new Promise((resolve) => {
      chrome.storage.sync.get(['jiraUrl'], async (result) => {
        if (result.jiraUrl) {
          resolve(result.jiraUrl);
          return;
        }

        // If not configured, try to detect from active tab via background script
        try {
          chrome.runtime.sendMessage({ action: 'detectJiraUrl' }, (response) => {
            if (response && response.detectedUrl) {
              resolve(response.detectedUrl);
              return;
            }

            // As fallback, try to get from content script if it's a Jira page
            chrome.runtime.sendMessage({ action: 'getJiraUrlFromContent' }, (response) => {
              if (response && response.detectedUrl) {
                resolve(response.detectedUrl);
              } else {
                resolve(null);
              }
            });
          });
        } catch (error) {
          console.error('Error detecting Jira URL:', error);
          resolve(null);
        }
      });
    });
  }

  /**
   * Saves all default settings to chrome.storage.local.
   * This is typically called when the extension is run for the first time
   * or if no settings are found in storage.
   */
  function saveDefaultSettings() {
    const defaultSettings = {};
    Object.keys(settingConfiguration).forEach(key => {
      defaultSettings[key] = settingConfiguration[key].default;
    });

    chrome.storage.local.set(defaultSettings, () => {
      if (chrome.runtime.lastError) {
        console.error('[Jira Optimizer] Error saving default settings:', chrome.runtime.lastError.message);
      } else {
        console.log('[Jira Optimizer] Default settings saved successfully');
      }
    });
  }
});