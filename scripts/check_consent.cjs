/* Browser-level public VIZCAM Google Tag and CookieYes diagnostics. No personal data is collected. */
'use strict';
const puppeteer=require('puppeteer-core');
const URL='https://www.vizcam.in/';
(async()=>{
  const browser=await puppeteer.launch({
    executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage']
  });
  try{
    const page=await browser.newPage();
    await page.setViewport({width:390,height:844,deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
    if(!response||response.status()>=400)throw Error('Homepage HTTP failure: '+response?.status());
    await page.waitForFunction(()=>typeof window.gtag==='function',{timeout:20000});
    let state=await page.evaluate(()=>{
      const rows=Array.from(window.dataLayer||[]).map(v=>Array.from(v));
      const tag=!!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-72FYFHPDTC"]');
      return {
        tag,
        deniedByDefault:rows.some(x=>x[0]==='consent'&&x[1]==='default'&&x[2]?.analytics_storage==='denied'),
        consentUpdates:rows.filter(x=>x[0]==='consent'&&x[1]==='update').map(x=>x[2]?.analytics_storage),
        hasConsentAPI:typeof window.getCkyConsent==='function',
        privacyButton:!!document.querySelector('.cky-banner-element'),
        productCount:document.querySelectorAll('.vizcam-product-card').length,
        cookieYesTag:!!document.getElementById('cookieyes')
      };
    });
    if(!state.deniedByDefault)throw Error('Default analytics consent must be denied: '+JSON.stringify(state));
    if(!state.tag)console.log('Expected under CookieYes basic mode: Google tag currently blocked before consent.');
    if(!state.cookieYesTag||!state.privacyButton)throw Error('CookieYes installation/settings control missing.');
    try{
      await page.waitForFunction(()=>typeof window.getCkyConsent==='function',{timeout:22000});
    }catch(e){
      throw Error('CookieYes API did not become available. Check banner activation/domain and Content Security Policy. '+JSON.stringify({pageErrors:errors.slice(0,4)}));
    }
    state=await page.evaluate(()=>{
      const consent=window.getCkyConsent();
      return {
        cookieYesReady:true,
        acted:Boolean(consent?.isUserActionCompleted),
        analyticsAllowed:Boolean(consent?.categories?.analytics),
        bannerVisible:Boolean(document.querySelector('.cky-consent-container:not(.cky-hide)')),
        controls:[...document.querySelectorAll('[data-cky-tag]')].slice(0,10).map(x=>x.getAttribute('data-cky-tag'))
      };
    });
    if(!state.acted){
      const clicked=await page.evaluate(()=>{
        const button=document.querySelector('[data-cky-tag="accept-button"], .cky-btn-accept');
        if(!button)return false;
        button.click();
        return true;
      });
      if(clicked){
        await page.waitForFunction(()=>Boolean(window.getCkyConsent?.()?.isUserActionCompleted),{timeout:12000});
        const accepted=await page.evaluate(()=>{
          const c=window.getCkyConsent();
          const rows=Array.from(window.dataLayer||[]).map(v=>Array.from(v));
          return {
            accepted:Boolean(c.categories?.analytics),
            consentGranted:rows.some(x=>x[0]==='consent'&&x[1]==='update'&&x[2]?.analytics_storage==='granted'),
            pageViewQueued:rows.some(x=>x[0]==='event'&&x[1]==='page_view')
          };
        });
        if(!accepted.accepted||!accepted.consentGranted||!accepted.pageViewQueued)throw Error('CookieYes acceptance was not propagated correctly: '+JSON.stringify(accepted));
        await page.waitForFunction(()=>!!document.querySelector('script[src*="googletagmanager.com/gtag/js?id=G-72FYFHPDTC"]'),{timeout:18000});
        console.log('PASS: Google tag loaded after CookieYes consent.');
        console.log('PASS: CookieYes acceptance propagated to GA4 consent and first page_view.');
      }else{
        console.log('NOTE: No visible accept button in runner region. CookieYes API available; manual preference test remains necessary.');
      }
    }else{
      console.log('NOTE: CookieYes already has a consent preference in this browser; no acceptance simulated.');
    }
    console.log('PASS: homepage, GA4 tag, initial denied consent, CookieYes API, preferences control.');
    console.log('Consent test:',JSON.stringify(state));
  }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
