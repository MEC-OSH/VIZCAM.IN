'use strict';
(function () {
  // Non-blocking Google font CSS: system fonts remain usable while web fonts load.
  const fonts=document.querySelector('[data-async-fonts]');
  if(fonts){
    const enableFonts=()=>{fonts.media='all'};
    if(fonts.sheet)enableFonts();
    else fonts.addEventListener('load',enableFonts,{once:true});
  }
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

  // A separate gallery per card; future products only need data-product-slider markup.
  const prefersReducedMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-product-slider]').forEach(function(slider){
    const slides=Array.from(slider.querySelectorAll('[data-product-slide]'));
    const dots=Array.from(slider.querySelectorAll('[data-slide-dot]'));
    if(slides.length<2)return;
    let current=0;
    let clock=null;
    function showSlide(index){
      current=(index+slides.length)%slides.length;
      slides.forEach(function(img,i){img.hidden=i!==current});
      dots.forEach(function(dot,i){
        dot.classList.toggle('is-active',i===current);
        dot.setAttribute('aria-pressed',String(i===current));
      });
    }
    function pause(){if(clock!==null){clearInterval(clock);clock=null}}
    function play(){
      pause();
      if(!prefersReducedMotion && !document.hidden && !slider.matches(':hover') && !slider.contains(document.activeElement)){
        clock=setInterval(function(){showSlide(current+1)},4500);
      }
    }
    slider.querySelector('[data-slide-prev]')?.addEventListener('click',function(){pause();showSlide(current-1)});
    slider.querySelector('[data-slide-next]')?.addEventListener('click',function(){pause();showSlide(current+1)});
    dots.forEach(function(dot,i){dot.addEventListener('click',function(){pause();showSlide(i)})});
    slider.addEventListener('mouseenter',pause);
    slider.addEventListener('mouseleave',play);
    slider.addEventListener('focusin',pause);
    slider.addEventListener('focusout',function(){window.setTimeout(play,0)});
    document.addEventListener('visibilitychange',function(){if(document.hidden)pause();else play()});
    showSlide(0);
    play();
  });

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

  // Four original VIZCAM posters, shown one at a time.
  const posterCarousel=document.querySelector('[data-poster-carousel]');
  if(posterCarousel){
    const posterSlides=Array.from(posterCarousel.querySelectorAll('[data-poster-slide]'));
    const posterDots=Array.from(posterCarousel.querySelectorAll('[data-poster-dot]'));
    const posterCount=posterCarousel.querySelector('[data-poster-count]');
    const reducedPosterMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hoverCapable=window.matchMedia('(hover: hover)').matches;
    let currentPoster=0,posterTimer=null;
    function showPoster(index){
      currentPoster=(index+posterSlides.length)%posterSlides.length;
      posterSlides.forEach(function(slide,i){slide.hidden=i!==currentPoster});
      posterDots.forEach(function(dot,i){
        dot.classList.toggle('is-active',i===currentPoster);
        dot.setAttribute('aria-pressed',String(i===currentPoster));
      });
      if(posterCount)posterCount.textContent=(currentPoster+1)+' / '+posterSlides.length;
    }
    function stopPosterTimer(){
      if(posterTimer!==null){window.clearInterval(posterTimer);posterTimer=null}
    }
    function startPosterTimer(){
      stopPosterTimer();
      if(reducedPosterMotion||document.hidden||
        (hoverCapable&&posterCarousel.matches(':hover'))||
        posterCarousel.contains(document.activeElement))return;
      posterTimer=window.setInterval(function(){showPoster(currentPoster+1)},5000);
    }
    function choosePoster(index){showPoster(index);startPosterTimer()}
    posterCarousel.querySelector('[data-poster-prev]')?.addEventListener('click',function(){choosePoster(currentPoster-1)});
    posterCarousel.querySelector('[data-poster-next]')?.addEventListener('click',function(){choosePoster(currentPoster+1)});
    posterDots.forEach(function(dot,i){dot.addEventListener('click',function(){choosePoster(i)})});
    posterCarousel.addEventListener('mouseenter',stopPosterTimer);
    posterCarousel.addEventListener('mouseleave',startPosterTimer);
    posterCarousel.addEventListener('focusin',stopPosterTimer);
    posterCarousel.addEventListener('focusout',function(){window.setTimeout(startPosterTimer,0)});
    document.addEventListener('visibilitychange',function(){if(document.hidden)stopPosterTimer();else startPosterTimer()});
    window.addEventListener('pagehide',stopPosterTimer);
    if(posterSlides.length)showPoster(0);
    if(posterSlides.length>1)startPosterTimer();
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
