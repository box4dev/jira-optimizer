import { state } from './state.js';
import { JiraType } from './constants.js';

export const UI = {
  addIconCollapse(spanCollapseOpen) {
    spanCollapseOpen.classList.remove('joc-icon-open');
    spanCollapseOpen.classList.add('joc-icon-collapse');
  },

  addIconOpen(spanCollapseOpen) {
    spanCollapseOpen.classList.remove('joc-icon-collapse');
    spanCollapseOpen.classList.add('joc-icon-open');
  },

  addIconShrink(spanShrinkExpand) {
    spanShrinkExpand.classList.remove('joc-icon-expand');
    spanShrinkExpand.classList.add('joc-icon-shrink');
    if (state.jiraType !== JiraType.CLOUD) {
      Object.assign(spanShrinkExpand.style, {
        margin: '0px -10px -5px 10px',
      });
    }
  },

  addIconExpand(spanShrinkExpand) {
    spanShrinkExpand.classList.remove('joc-icon-shrink');
    spanShrinkExpand.classList.add('joc-icon-expand');
    if (state.jiraType !== JiraType.CLOUD) {
      Object.assign(spanShrinkExpand.style, {
        margin: '0px -10px -5px 10px',
      });
    }
  },

  expandIssueDetailsDialog(modalIssueDetailsDialog, modalIssueDetailsDialogPositioner) {
    if (modalIssueDetailsDialog && modalIssueDetailsDialogPositioner) {
      modalIssueDetailsDialog.style.width = state.jiraType === JiraType.CLOUD ? '100%' : '';
      Object.assign(modalIssueDetailsDialogPositioner.style, {
        maxWidth: "calc(-20px + 100vw)",
        maxHeight: "calc(-70px + 100vh)",
        insetBlockStart: "60px",
      });
    }
  }
};
