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
  // Native, keyboard-accessible product details modal.
  let productDialogOpener=null;
  document.querySelectorAll('[data-product-details]').forEach(function(button){
    button.addEventListener('click',function(){
      const dialog=document.getElementById(button.getAttribute('data-product-details'));
      if(!dialog || typeof dialog.showModal!=='function')return;
      productDialogOpener=button;
      dialog.showModal();
      const close=dialog.querySelector('[data-close-product]');
      if(close)close.focus();
    });
  });
  document.querySelectorAll('dialog.vizcam-product-modal').forEach(function(dialog){
    dialog.querySelectorAll('[data-close-product]').forEach(function(button){
      button.addEventListener('click',function(){dialog.close()});
    });
    dialog.addEventListener('click',function(event){
      if(event.target===dialog)dialog.close();
    });
    dialog.addEventListener('close',function(){
      if(productDialogOpener){productDialogOpener.focus();productDialogOpener=null}
    });
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
