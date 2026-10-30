'use strict';
(function(){
  // GA4 loads only after a visitor has opted in. No identifiers or form contents are sent by us.
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

  function loadAnalytics(){
    if(analyticsActive) return;
    analyticsActive=true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',GA_ID,{
      allow_google_signals:false,
      allow_ad_personalization_signals:false
    });
    const script=document.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA_ID);
    script.onerror=function(){ console.warn('VIZCAM: Google Analytics could not load.'); };
    document.head.appendChild(script);
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
    if(value==='accepted')loadAnalytics();
    else if(wasActive){
      clearGACookies();
      // Rebuild the page without the tracking library when consent is withdrawn.
      window.location.reload();
    }
  }
  accept.addEventListener('click',function(){setChoice('accepted')});
  reject.addEventListener('click',function(){setChoice('declined')});
  if(settings)settings.addEventListener('click',function(){showBanner()});
  if(choice==='accepted') loadAnalytics();
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
