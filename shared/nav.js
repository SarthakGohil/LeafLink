/**
 * NavMenu — OOJS class for shared hamburger menu logic
 * Used across all pages to avoid duplicated code (OOJS pattern).
 */
class NavMenu {
  constructor() {
    this.menuIcon   = document.querySelector('.menu-icon');
    this.navbarMenu = document.querySelector('.navbar-menu');
    this._init();
  }

  _init() {
    if (this.menuIcon && this.navbarMenu) {
      this.menuIcon.addEventListener('click', () => this.toggle());
    }
    // Close menu when a nav link is clicked (mobile UX)
    const links = document.querySelectorAll('.navbar-menu a');
    links.forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  }

  toggle() {
    this.navbarMenu.classList.toggle('active');
  }

  close() {
    this.navbarMenu.classList.remove('active');
  }
}

// Auto-init on every page that includes this script
document.addEventListener('DOMContentLoaded', () => {
  window._navMenu = new NavMenu();
});
