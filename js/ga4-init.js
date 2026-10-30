'use strict';
// This must run synchronously before gtag.js loads so denied consent takes effect first.
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag(){window.dataLayer.push(arguments)};
window.gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied'
});
window.gtag('set','ads_data_redaction',true);
window.gtag('js',new Date());
// Google tag is detectable immediately; no page_view event until analytics consent.
window.gtag('config','G-72FYFHPDTC',{
  send_page_view:false,
  allow_google_signals:false,
  allow_ad_personalization_signals:false
});
