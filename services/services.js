/**
 * ServicesAccordion — OOJS class for expandable service containers
 * Implements the accordion pattern for the services page.
 */
class ServicesAccordion {
  constructor(containerSelector) {
    this.containers = document.querySelectorAll(containerSelector);
    this._init();
  }

  _init() {
    this.containers.forEach(container => {
      container.addEventListener('click', () => this.toggle(container));
    });
  }

  toggle(container) {
    // Close all others (accordion behavior)
    this.containers.forEach(c => {
      if (c !== container) c.classList.remove('expanded');
    });
    container.classList.toggle('expanded');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window._servicesAccordion = new ServicesAccordion('.expandable-container');
});
