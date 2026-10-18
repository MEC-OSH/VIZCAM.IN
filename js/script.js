'use strict';
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    function closeMenu() {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    }
    menuButton.addEventListener('click', function () {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const service = document.getElementById('enquiry-service').value.trim();
      const location = document.getElementById('enquiry-location').value.trim().slice(0, 100);
      if (!location) return;
      const msg = 'Hello VIZCAM, I would like to enquire about ' + service + '. My location is ' + location + '. Please share the details and a quotation.';
      const url = 'https://wa.me/918943854151?text=' + encodeURIComponent(msg);
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) window.location.assign(url);
    });
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
