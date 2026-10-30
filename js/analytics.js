'use strict';
(function(){
  // Google tag is initialized in the page head with consent denied by default.
  // Analytics storage and measurement events are enabled only after opt-in.
  const GA_ID = 'G-72FYFHPDTC';
  const STORAGE_KEY = 'vizcam-analytics-consent-v1';
  const banner = document.getElementById('vizcamAnalyticsConsent');
  const accept = document.getElementById('vizcamAcceptAnalytics');
  const reject = document.getElementById('vizcamRejectAnalytics');
  const settings = document.getElementById('vizcamPrivacySettings');
  if(!banner || !accept || !reject) return;
  let analyticsActive = false;
  let choice = null;

  try { choice = localStorage.getItem(STORAGE_KEY); } catch(error){}

  function store(value){
    try { localStorage.setItem(STORAGE_KEY,value); } catch(error){}
    choice=value;
  }
  function showBanner(){ banner.hidden=false; }
  function hideBanner(){ banner.hidden=true; }

  function enableAnalytics(){
    if(analyticsActive) return;
    if(typeof window.gtag!=='function'){
      console.warn('VIZCAM: Google tag initialization unavailable.');
      return;
    }
    analyticsActive=true;
    window.gtag('consent','update',{
      analytics_storage:'granted',
      ad_storage:'denied',
      ad_user_data:'denied',
      ad_personalization:'denied'
    });
    window.gtag('event','page_view',{
      page_title:document.title,
      page_location:window.location.href
    });
  }
  function denyAnalytics(){
    if(typeof window.gtag==='function'){
      window.gtag('consent','update',{
        analytics_storage:'denied',
        ad_storage:'denied',
        ad_user_data:'denied',
        ad_personalization:'denied'
      });
    }
  }
  function clearGACookies(){
    document.cookie.split(';').forEach(function(part){
      const name=part.split('=')[0].trim();
      if(!/^_ga(?:_|$)/.test(name))return;
      document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie=name+'=; Max-Age=0; Path=/; Domain=.vizcam.in; SameSite=Lax';
    });
  }
  function setChoice(value){
    const wasActive=analyticsActive;
    store(value);
    hideBanner();
    if(value==='accepted')enableAnalytics();
    else {
      denyAnalytics();
      clearGACookies();
      // Reset in-memory analytics state when a visitor withdraws consent.
      if(wasActive)window.location.reload();
    }
  }
  accept.addEventListener('click',function(){setChoice('accepted')});
  reject.addEventListener('click',function(){setChoice('declined')});
  if(settings)settings.addEventListener('click',function(){showBanner()});
  if(choice==='accepted') enableAnalytics();
  else if(choice!=='declined') showBanner();

  function recordEvent(name,params){
    if(!analyticsActive||typeof window.gtag!=='function')return;
    window.gtag('event',name,params||{});
  }
  // Clicks are counted only; no WhatsApp message contents, phone numbers or user-entered location sent.
  document.addEventListener('click',function(event){
    const link=event.target.closest('a[href]');
    if(!link)return;
    const href=link.getAttribute('href')||'';
    if(/^https:\/\/wa\.me\//i.test(href)){
      recordEvent('contact',{method:'whatsapp'});
    }else if(/^tel:/i.test(href)){
      recordEvent('contact',{method:'phone'});
    }else if(/^mailto:/i.test(href)){
      recordEvent('contact',{method:'email'});
    }
  },true);
  const enquiry=document.getElementById('enquiry-form');
  if(enquiry)enquiry.addEventListener('submit',function(){
    if(!enquiry.checkValidity())return;
    recordEvent('generate_lead',{method:'whatsapp_enquiry'});
  },true);
})();
