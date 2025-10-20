import { state } from '../state.js';
import { Utils } from '../utils.js';
import { UI } from '../ui.js';
import { JiraType } from '../constants.js';

const { getI18nMessage } = Utils;

export const ExpandModal = {
  init() {
    this.addExpandButton();
    this.setupKeyboardShortcuts();
  },

  fnShrinkExpand(modalIssueCreate, spanShrinkExpand, modalIssueCreatePositioner) {
    const isCurrentlyExpanded = modalIssueCreate.style.width === '100%';

    if (!isCurrentlyExpanded) {
      // Modal is currently shrunk, will be expanded. Button should now offer to shrink.
      UI.addIconShrink(spanShrinkExpand);
      modalIssueCreate.style.width = '100%';
      const positionerStyles = state.jiraType === JiraType.CLOUD ? {
        width: "100%", maxWidth: "100%", maxHeight: "calc(-60px + 100vh)", insetBlockStart: "60px",
      } : {
        width: "100%", insetBlockStart: "40px", height: "calc(-40px + 100vh)",
      };
      Object.assign(modalIssueCreatePositioner.style, positionerStyles);
      spanShrinkExpand.title = getI18nMessage('collapseModalTitle');
    } else {
      // Modal is currently expanded, will be shrunk. Button should now offer to expand.
      UI.addIconExpand(spanShrinkExpand);
      modalIssueCreate.style.width = '';
      const defaultPositionerStyles = {
        width: '', maxWidth: '', maxHeight: '', height: '',
        insetBlockStart: state.jiraType === JiraType.CLOUD ? "60px" : '',
      };
      Object.assign(modalIssueCreatePositioner.style, defaultPositionerStyles);
      if (state.jiraType !== JiraType.CLOUD) {
        modalIssueCreatePositioner.style.insetBlockStart = '';
      }
      spanShrinkExpand.title = getI18nMessage('expandModalTitle');
    }
  },

  addExpandButton() {
    try {
      const modalIssueCreatePositionerSelector = Utils.getSelector('modalIssueCreatePositioner');
      const modalIssueCreateSelector = Utils.getSelector('modalIssueCreate');
      const modalIconsSelector = Utils.getSelector('modalIcons');

      if (!modalIssueCreatePositionerSelector || !modalIssueCreateSelector || !modalIconsSelector) return;

      const modalIssueCreatePositioner = document.querySelector(modalIssueCreatePositionerSelector);
      const modalIssueCreate = document.querySelector(modalIssueCreateSelector);
      const modalIcons = document.querySelector(modalIconsSelector);

      if (modalIssueCreate && modalIssueCreatePositioner && modalIcons && !document.getElementById('ewj-span-shrink-expand')) {
        if (state.jiraType !== JiraType.CLOUD) {
          modalIcons.style.display = 'flex';
        }

        const spanShrinkExpand = Utils.createElement('span', {
          id: 'ewj-span-shrink-expand',
          // Initial state: modal will be expanded by default, so button offers to "Collapse"
          title: getI18nMessage('collapseModalTitle')
        });

        // Initialize to expanded state
        UI.addIconShrink(spanShrinkExpand); // Icon shows "shrink" because it's expanded
        modalIssueCreate.style.width = '100%';
        const initialPositionerStyles = state.jiraType === JiraType.CLOUD ? {
          width: "100%", maxWidth: "100%", maxHeight: "calc(-60px + 100vh)", insetBlockStart: "60px",
        } : {
          width: "100%", insetBlockStart: "40px", height: "calc(-40px + 100vh)",
        };
        Object.assign(modalIssueCreatePositioner.style, initialPositionerStyles);

        spanShrinkExpand.addEventListener('click', () => {
          this.fnShrinkExpand(modalIssueCreate, spanShrinkExpand, modalIssueCreatePositioner);
        });
        modalIcons.appendChild(spanShrinkExpand);
      }
    } catch (error) {
      console.error('[Jira Optimizer] Error adding expand button:', error);
    }
  },

  setupKeyboardShortcuts() {
    if (this.keyboardListenerAddedExpandModal) return; // Use a unique flag

    document.addEventListener('keydown', (event) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      if (isInputActive) {
        return;
      }

      // Query elements dynamically inside the handler
      const modalIssueCreatePositionerSelector = Utils.getSelector('modalIssueCreatePositioner');
      const modalIssueCreateSelector = Utils.getSelector('modalIssueCreate');
      const spanShrinkExpand = document.getElementById('ewj-span-shrink-expand');

      const modalIssueCreatePositioner = modalIssueCreatePositionerSelector ? document.querySelector(modalIssueCreatePositionerSelector) : null;
      const modalIssueCreate = modalIssueCreateSelector ? document.querySelector(modalIssueCreateSelector) : null;

      // Check if the modal and its control button are present
      if (!modalIssueCreate || !modalIssueCreatePositioner || !spanShrinkExpand) {
        return;
      }

      if (event.key === ']') {
        this.fnShrinkExpand(modalIssueCreate, spanShrinkExpand, modalIssueCreatePositioner);
      }
    });
    this.keyboardListenerAddedExpandModal = true;
  }
};
