import { Utils } from './utils.js';

class TooltipManager {
  constructor() {
    this.tooltip = null;
    // this.tooltipDelay = 1000; // Não utilizado, considerar remover
  }

  create(content) {
    this.destroy();
    this.tooltip = Utils.createElement('div', {
      className: 'joc-tooltip-style'
    }, [
      Utils.createElement('div', {
        className: 'joc-tooltip-content-container',
        innerHTML: content
      })
    ]);
    document.body.appendChild(this.tooltip);
    return this.tooltip;
  }

  destroy() {
    if (this.tooltip && this.tooltip.parentNode === document.body) {
      document.body.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }

  adjustPosition(event) {
    if (!this.tooltip) return;

    const SPACE = 10;
    const { pageX, pageY } = event;
    const tooltipRect = this.tooltip.getBoundingClientRect();

    let left = pageX + SPACE;
    let top = pageY + SPACE;

    if (left + tooltipRect.width > window.innerWidth) {
      left = pageX - tooltipRect.width - SPACE;
    }
    if (left < 0) { // Ensure tooltip doesn't go off-screen left
      left = SPACE;
    }

    if (top + tooltipRect.height > window.innerHeight) {
      top = pageY - tooltipRect.height - SPACE;
    }
    if (top < 0) { // Ensure tooltip doesn't go off-screen top
      top = SPACE;
    }

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }
}

export const tooltipManager = new TooltipManager();
