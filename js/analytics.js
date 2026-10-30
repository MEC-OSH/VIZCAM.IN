'use strict';
(function(){
  // CookieYes is the source of consent; no separate VIZCAM consent banner.
  // GA4 is initialized with denied consent before CookieYes and the Google tag.
  // No analytics event is sent until a visitor grants the analytics category.
  let analyticsAllowed=false;
  let pageViewSent=false;

  function consentAllowed(){
    if(typeof window.getCkyConsent!=='function')return false;
    try{
      const c=window.getCkyConsent();
      return Boolean(c && c.isUserActionCompleted && c.categories && c.categories.analytics===true);
    }catch(e){return false}
  }

  function clearAnalyticsCookies(){
    document.cookie.split(';').forEach(function(part){
      const name=part.split('=')[0].trim();
      if(!/^_ga(?:_|$)/.test(name))return;
      document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie=name+'=; Max-Age=0; Path=/; Domain=.vizcam.in; SameSite=Lax';
    });
  }

  function syncCookieYesConsent(){
    const allowed=consentAllowed();
    const previouslyAllowed=analyticsAllowed;
    analyticsAllowed=allowed;
    if(typeof window.gtag==='function'){
      // Keep advertising consent denied because VIZCAM uses only GA4 statistics.
      window.gtag('consent','update',{
        analytics_storage:allowed?'granted':'denied',
        ad_storage:'denied',
        ad_user_data:'denied',
        ad_personalization:'denied'
      });
      if(allowed && !pageViewSent){
        pageViewSent=true;
        window.gtag('event','page_view',{
          page_title:document.title,
          page_location:window.location.href
        });
      }
    }
    if(previouslyAllowed&&!allowed){
      clearAnalyticsCookies();
      pageViewSent=false;
    }
  }

  // Initial cookie state, new consent, and future withdrawals.
  document.addEventListener('cookieyes_banner_load',syncCookieYesConsent);
  document.addEventListener('cookieyes_banner_loaded',syncCookieYesConsent);
  document.addEventListener('cookieyes_consent_update',syncCookieYesConsent);
  syncCookieYesConsent();

  function recordEvent(eventName,detail){
    if(!analyticsAllowed || typeof window.gtag!=='function')return;
    window.gtag('event',eventName,detail||{});
  }
  // Keep product/visitor message contents out of Google Analytics.
  document.addEventListener('click',function(e){
    const anchor=e.target.closest('a[href]');
    if(!anchor)return;
    const href=anchor.getAttribute('href')||'';
    if(/^https:\/\/wa\.me\//i.test(href))recordEvent('contact',{method:'whatsapp'});
    else if(/^tel:/i.test(href))recordEvent('contact',{method:'phone'});
    else if(/^mailto:/i.test(href))recordEvent('contact',{method:'email'});
  },true);

  const enquiry=document.getElementById('enquiry-form');
  if(enquiry)enquiry.addEventListener('submit',function(){
    if(enquiry.checkValidity())recordEvent('generate_lead',{method:'whatsapp_enquiry'});
  },true);
})();
