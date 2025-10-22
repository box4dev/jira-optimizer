/**
 * Substitui manualmente os placeholders i18n no HTML do options
 * O Chrome Extensions não faz isso automaticamente para options
 */
function replaceI18nPlaceholders() {
  // Mapeamento de placeholders para suas respectivas mensagens
  const i18nMap = {
    '__MSG_optionsPageTitle__': 'optionsPageTitle',
    '__MSG_optionsPageHeading__': 'optionsPageHeading',
    '__MSG_jiraInstanceConfiguration__': 'jiraInstanceConfiguration',
    '__MSG_configureJiraUrlMessage__': 'configureJiraUrlMessage',
    '__MSG_jiraBaseUrl__': 'jiraBaseUrl',
    '__MSG_saveButton__': 'saveButton',
    '__MSG_jiraUrlSavedSuccessfully__': 'jiraUrlSavedSuccessfully',
    // '__MSG_jiraUrlHelpText__': 'jiraUrlHelpText',
    '__MSG_themeConfiguration__': 'themeConfiguration',
    '__MSG_themeMode__': 'themeMode',
    '__MSG_themeLight__': 'themeLight',
    '__MSG_themeDark__': 'themeDark',
    '__MSG_themeDevice__': 'themeDevice',
    // '__MSG_themeSavedSuccessfully__': 'themeSavedSuccessfully',
    // '__MSG_themeHelpText__': 'themeHelpText'
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

  const jiraUrlInput = document.getElementById('jiraUrl');
  const saveButton = document.getElementById('saveJiraUrl');
  const saveMessage = document.getElementById('saveMessage');

  // Theme elements
  const themeSelect = document.getElementById('themeMode');
  // const saveThemeButton = document.getElementById('saveTheme');
  // const themeSaveMessage = document.getElementById('themeSaveMessage');

  // Load saved Jira URL
  chrome.storage.local.get(['jiraUrl'], (result) => {
    if (result.jiraUrl) {
      jiraUrlInput.value = result.jiraUrl;
      // Hide message if URL is configured
      const messageDiv = document.getElementById('jiraUrlMessage');
      if (messageDiv) {
        messageDiv.style.display = 'none';
      }
    } else {
      // Show message if no URL is configured
      const messageDiv = document.getElementById('jiraUrlMessage');
      if (messageDiv) {
        messageDiv.style.display = 'block';
      }
    }
  });

  // Load saved theme
  chrome.storage.local.get(['themeMode'], (result) => {
    const savedTheme = result.themeMode || 'light'; // Default to light theme
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);
  });

  // Save Jira URL
  saveButton.addEventListener('click', () => {
    const jiraUrl = jiraUrlInput.value.trim();

    // Basic validation
    if (jiraUrl && !jiraUrl.match(/^https?:\/\/.+/)) {
      showMessage('Please enter a valid URL starting with http:// or https://', 'joc-error-message');
      return;
    }

    chrome.storage.local.set({ jiraUrl: jiraUrl }, () => {
      if (chrome.runtime.lastError) {
        showMessage('Error saving Jira URL', 'joc-error-message');
      } else {
        showMessage('Jira URL saved successfully!', 'joc-success-message');
        // Hide the info message when URL is successfully saved
        const messageDiv = document.getElementById('jiraUrlMessage');
        if (messageDiv) {
          messageDiv.style.display = 'none';
        }
      }
    });
  });

  // Auto-save theme on change
  themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;

    chrome.storage.local.set({ themeMode: selectedTheme }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving theme:', chrome.runtime.lastError);
      } else {
        applyTheme(selectedTheme);
      }
    });
  });

  // Listen for theme changes (preview)
  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  function showMessage(text, type, messageElement = saveMessage) {
    messageElement.textContent = text;
    messageElement.className = type;
    messageElement.style.display = 'block';
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }

  function applyTheme(theme) {
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
});