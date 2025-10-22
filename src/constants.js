// BY constant is now handled through i18n in linkedIssues.js
export const BY_URL = 'https://chromewebstore.google.com/detail/occanfpdiglllenbekgbnhijeoincilf';

export const JiraType = {
  CLOUD: 'CLOUD',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

export const STATUS_COLORS = {
  new: { color: 'joc-status-color-new', bgColor: 'joc-status-bg-color-new' },
  indeterminate: { color: 'joc-status-color-indeterminate', bgColor: 'joc-status-bg-color-indeterminate' },
  done: { color: 'joc-status-color-done', bgColor: 'joc-status-bg-color-done' },
  other: { color: 'joc-status-color-other', bgColor: 'joc-status-bg-color-other' },
};

export const Selectors = {
  CLOUD: {
    // collapse panel
    containerRight: '[data-testid="issue.views.issue-details.issue-layout.container-right"]',
    resizerElement: '[data-testid="flex-resizer.ui.handle.resizer"]',

    // expand modal
    modalIssueCreatePositioner: '[data-testid="issue-create.ui.modal.modal-wrapper.modal--positioner"]',
    modalIssueCreate: '[data-testid="issue-create.ui.modal.modal-wrapper.modal"]',
    modalIcons: '[data-testid="minimizable-modal.ui.modal-container.modal-header.view-changer-wrapper"]',
    modalIssueDetailsDialogPositioner: '[data-testid="issue.views.issue-details.issue-modal.modal-dialog--positioner"]',
    modalIssueDetailsDialog: '[data-testid="issue.views.issue-details.issue-modal.modal-dialog"]',

    // board
    board: '[data-testid="platform-board-kit.ui.board.scroll.board-scroll"]',
    card: '[data-testid="platform-board-kit.ui.card.card"]',
    cardFooter: '[data-testid="platform-card.ui.card.card-content.footer"]',
    issueKey: '[data-testid="platform-card.common.ui.key.key"] a'
  },
  SERVER: {
    // collapse panel
    containerRight: '.issue-side-column',
    resizerElement: '.aui-toolbar2-secondary',

    // expand modal
    modalIssueCreatePositioner: '#create-issue-dialog',
    modalIssueCreate: '.jira-dialog-core-heading',
    modalIcons: '.qf-form-operations',
    modalIssueDetailsDialogPositioner: '#viewissuesidebar',
    modalIssueDetailsDialog: '#viewissuesidebar',

    // board
    board: '.ghx-board',
    card: '.ghx-issue',
    cardFooter: '.ghx-issue-footer',
    issueKey: '.ghx-key a'
  }
};
