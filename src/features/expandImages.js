import { state } from '../state.js';
import { Utils } from '../utils.js';
import { UI } from '../ui.js';
import { JiraType } from '../constants.js';

const { getI18nMessage } = Utils;

export const ExpandImages = {
  init() {
    this.addExpandImagesButton();
    this.applyAutoResize();
    this.setupKeyboardShortcuts();
  },

  applyAutoResize() {
    if (!state.settings.expandImages) return;

    // Injeção de estilos CSS para auto-resize
    if (!document.getElementById('ewj-auto-resize-styles')) {
      const style = document.createElement('style');
      style.id = 'ewj-auto-resize-styles';
      style.innerHTML = `
        img.ewj-img-resized {
          max-height: auto !important;
          width: 100% !important;
          position: static !important;
          transform: none !important;
          object-fit: contain !important;
        }

        div.ewj-new-file-experience-wrapper {
          width: 100% !important;
          max-width: 100% !important;
        }

        div.ewj-rich-media-item.mediaSingleView-content-wrap {
          width: 100% !important;
          max-width: 100% !important;
        }
      `;
      document.head.appendChild(style);
    }

    try {
      this.resizeImagesAndContainers();
    } catch (error) {
      console.warn('[Jira Optimizer] Error in applyAutoResize:', error.message);
    }
  },

  resizeImagesAndContainers() {
    if (!state.settings.expandImages) return;

    // Redimensiona imagens
    const images = document.querySelectorAll('img[data-testid="media-image"]:not(.ewj-img-resized)');
    images.forEach(img => {
      img.classList.add('ewj-img-resized');
      if (state.jiraType === JiraType.CLOUD) {
        img.classList.add('ewj-img-auto-expanded');
      }
    });

    // Ajusta containers de mídia
    const mediaContainers = document.querySelectorAll('div.rich-media-item.mediaSingleView-content-wrap:not(.ewj-container-processed)');
    mediaContainers.forEach(container => {
      container.classList.add('ewj-container-processed');
      container.style.width = '100%';
      container.style.maxWidth = '100%';

      // Aplicar recursivamente aos descendentes
      const descendants = container.querySelectorAll('*');
      descendants.forEach(el => {
        el.style.width = '100%';
        el.style.maxWidth = '100%';
      });
    });
  },

  toggleImageExpansion(event, targetImage = null) {
    try {
      // Only handle global toggle, not individual image clicks
      if (targetImage) {
        return; // Exit if called for individual image
      }

      // Try multiple selectors to find images
      const selectors = [
        'img[data-fileid]',  // Jira's specific image attribute
        'img[data-testid="media-image"]',
        '.rich-media-item img',
        '.mediaSingleView-content-wrap img',
        '#newFileExperienceWrapper img',
        '[data-testid="ImageRendererWrapper"] img'
      ];

      let images;
      for (const selector of selectors) {
        images = document.querySelectorAll(selector);
        if (images.length > 0) {
          console.log(`[Jira Optimizer] Found ${images.length} images with selector: ${selector}`);
          break;
        }
      }

      // console.log(`Jira Expand Extension: Total images found: ${images ? images.length : 0}`);

      if (!images || images.length === 0) {
        // console.log('Jira Expand Extension: No images found with any selector');
        return;
      }

      // Determine if we should expand or collapse based on the first image
      const shouldExpand = !images[0]?.classList.contains('ewj-img-expanded');

      images.forEach(img => {
        // Find the parent containers that should follow the image height
        const containers = [
          img.closest('#newFileExperienceWrapper'),
          img.closest('[data-testid="media-file-card-view"]'),
          img.closest('[data-testid="ImageRendererWrapper"]'),
          img.closest('.rich-media-item.mediaSingleView-content-wrap'),
          img.closest('.mediaSingleView-content-wrap')
        ].filter(Boolean);

        if (shouldExpand) {
          // Expand all images
          img.classList.add('ewj-img-expanded');
          img.classList.remove('ewj-img-collapsed');
          img.style.maxHeight = 'none';
          img.style.width = '100%';
          img.style.maxWidth = 'none'; // Remove maxWidth restriction

          // Update containers to follow image dimensions
          containers.forEach(container => {
            container.style.maxWidth = '100%'; // Restore full width
            container.style.width = '100%'; // Ensure full width
            container.style.maxHeight = 'none';
            container.style.height = 'auto';
            container.style.overflow = 'visible';
          });
        } else {
          // Collapse all images
          img.classList.remove('ewj-img-expanded');
          img.classList.add('ewj-img-collapsed');
          img.style.maxHeight = 'none';
          img.style.maxWidth = '400px'; // Collapse to max width
          img.style.height = 'auto'; // Allow natural height calculation

          // Update containers to follow collapsed image dimensions
          containers.forEach(container => {
            container.style.maxWidth = '400px'; // Match collapsed image maxWidth
            container.style.width = 'auto'; // Allow natural width
            container.style.maxHeight = 'none';
            container.style.height = 'auto';
            container.style.overflow = 'visible';
          });
        }
      });

      // console.log(`Jira Expand Extension: Toggled ${images.length} images`);
    } catch (error) {
      console.error('[Jira Optimizer] Error in toggleImageExpansion:', error);
    }
  },

  addExpandImagesButton() {
    try {
      // Create the expand images button span (similar to collapse button)
      if (!document.getElementById('ewj-span-expand-images')) {
        const spanExpandImages = Utils.createElement('span', {
          id: 'ewj-span-expand-images',
          className: 'ewj-icon-resize',
          title: getI18nMessage('expandImagesTitle')
        });

        spanExpandImages.addEventListener('click', (event) => {
          event.preventDefault();
          this.toggleImageExpansion(event);
        });

        // Try to find the collapse button wrapper and add our button before it
        const collapseWrapper = document.getElementById('jira-expand-collapse-wrapper');

        if (collapseWrapper) {
          // Insert before the collapse button span
          const collapseButton = document.getElementById('ewj-span-collapse-open');
          if (collapseButton) {
            collapseWrapper.insertBefore(spanExpandImages, collapseButton);
          } else {
            collapseWrapper.appendChild(spanExpandImages);
          }
        } else {
          // Fallback: try to find the resizer element (Server version)
          const resizerElementSelector = Utils.getSelector('resizerElement');
          if (resizerElementSelector) {
            const resizerElement = document.querySelector(resizerElementSelector);
            if (resizerElement) {
              resizerElement.insertBefore(spanExpandImages, resizerElement.firstChild);
            }
          }
        }

      }

      // Setup observer for dynamic content
      if (!this.observerAdded) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              this.resizeImagesAndContainers();
            }
          });
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        this.observerAdded = true;
      }
    } catch (error) {
      console.error('[Jira Optimizer] Error adding expand images button:', error);
    }
  },


  setupKeyboardShortcuts() {
    if (this.keyboardListenerAdded) return;

    document.addEventListener('keydown', (event) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.isContentEditable);

      if (isInputActive) return;

      // Ctrl+Shift+Z to toggle all images
      if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
        event.preventDefault();
        this.toggleImageExpansion(event);
      }
    });

    this.keyboardListenerAdded = true;
  }
};