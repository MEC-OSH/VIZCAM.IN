'use strict';
const WA_NUMBER = '918943854151';
const nav = document.getElementById('primaryNav');
const menuBtn = document.getElementById('menuToggle');
const header = document.querySelector('.site-header');
const toggleMenu = (open) => {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
menuBtn.addEventListener('click', () => toggleMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) toggleMenu(false); });
window.addEventListener('resize', () => { if (innerWidth > 980) toggleMenu(false); });
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

// Reveal animations, with a visible fallback in browsers without IntersectionObserver.
const animated = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const appear = new IntersectionObserver(entries => {
    for(const e of entries) if(e.isIntersecting){ e.target.classList.add('visible'); appear.unobserve(e.target); }
  },{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  animated.forEach((el,i) => {el.style.transitionDelay = `${Math.min(i%3*80,160)}ms`;appear.observe(el);});
} else animated.forEach(el => el.classList.add('visible'));

// Keep the header's section highlight in sync with the user's position.
if ('IntersectionObserver' in window) {
 const anchors = [...document.querySelectorAll('.nav-link')];
 const current = new IntersectionObserver(entries=>{
   const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
   if(!visible.length) return;
   anchors.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+visible[0].target.id));
 },{rootMargin:'-22% 0px -60% 0px',threshold:[0,.1,.2,.5]});
 document.querySelectorAll('main section[id]').forEach(section=>current.observe(section));
}

// Make the service enquiry links select the relevant service in the quote form.
const serviceSelect=document.getElementById('qService');
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{
 const wanted=link.dataset.service;
 if([...serviceSelect.options].some(o=>o.value===wanted)) serviceSelect.value=wanted;
}));

// Gallery category filtering and accessible illustration preview.
const filters=[...document.querySelectorAll('.filter')];
const images=[...document.querySelectorAll('.gallery-item')];
filters.forEach(filter=>filter.addEventListener('click',()=>{
 const value=filter.dataset.filter;
 filters.forEach(btn=>{const selected=btn===filter;btn.classList.toggle('active',selected);btn.setAttribute('aria-pressed',String(selected));});
 images.forEach(item=>{item.hidden=value!=='all' && item.dataset.category!==value;});
}));
const lightbox=document.getElementById('lightbox');
const lightboxImg=document.getElementById('lightboxImage');
const lightboxTitle=document.getElementById('lightboxTitle');
const closeLightbox=document.getElementById('closeLightbox');
let lastFocused=null;
const closeGallery=()=>{lightbox.hidden=true;document.body.classList.remove('locked');lastFocused?.focus();};
images.forEach(item=>item.addEventListener('click',()=>{
 lastFocused=document.activeElement;
 lightboxImg.src=item.dataset.image;
 lightboxImg.alt=`Illustration: ${item.dataset.title}`;
 lightboxTitle.textContent=item.dataset.title;
 lightbox.hidden=false;document.body.classList.add('locked');closeLightbox.focus();
}));
closeLightbox.addEventListener('click',closeGallery);
lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeGallery();});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(!lightbox.hidden)closeGallery();else toggleMenu(false);}
 if(e.key==='Tab'&&!lightbox.hidden){e.preventDefault();closeLightbox.focus();}
});

// The form intentionally sends to WhatsApp, without pretending there is a hosted backend.
const quoteForm=document.getElementById('quoteForm');
const formNote=document.getElementById('formNote');
quoteForm.addEventListener('submit',e=>{
 e.preventDefault();
 if(!quoteForm.reportValidity())return;
 const get=id=>document.getElementById(id).value.trim();
 const name=get('qName'),phone=get('qPhone'),service=get('qService'),location=get('qLocation'),message=get('qMessage');
 const lines=['Hello VIZCAM, I would like to request a free quotation.','','Name: '+name,'Phone: '+phone,'Service: '+service];
 if(location)lines.push('Project Location: '+location);
 if(message)lines.push('Requirements: '+message);
 lines.push('','Sent from www.vizcam.in');
 const url=`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
 formNote.textContent='Opening WhatsApp with your enquiry. Press Send inside WhatsApp to submit it.';
 window.open(url,'_blank','noopener,noreferrer');
});

// English / Malayalam switch for core site copy. The technical service specifications remain in English.
const translations={
 navHome:'ഹോം',navAbout:'ഞങ്ങളെക്കുറിച്ച്',navServices:'സേവനങ്ങൾ',navProjects:'സൊല്യൂഷനുകൾ',navGallery:'ഗാലറി',navContact:'ബന്ധപ്പെടുക',freeQuote:'സൗജന്യ ക്വോട്ട്',
 heroLabel:'സുരക്ഷയുടെ പുതിയ കാലം ഇവിടെ തുടങ്ങുന്നു',heroLine1:'കൂടുതൽ സ്മാർട്ട്',heroLine2:'സുരക്ഷ.',heroLine3:'സുരക്ഷിത നാളെ.',
 heroDesc:'അത്യാധുനിക CCTV നിരീക്ഷണം, നെറ്റ്‌വർക്കിംഗ്, സ്മാർട്ട് സുരക്ഷ, ഓട്ടോമേഷൻ സൊല്യൂഷനുകളിലൂടെ നിങ്ങൾക്ക് പ്രധാനപ്പെട്ടതെല്ലാം സംരക്ഷിക്കാം.',
 exploreServices:'ഞങ്ങളുടെ സേവനങ്ങൾ',whatsappQuote:'WhatsApp-ൽ സൗജന്യ ക്വോട്ട്',heroFoot:'ആധുനിക ജീവിതത്തിനും മനസ്സമാധാനത്തിനുമായി.',
 aboutEyebrow:'ഞങ്ങൾ ആരാണ്',aboutHeading:'സുരക്ഷയ്ക്ക് <span class="text-gradient">സ്മാർട്ട് സമീപനം.</span>',
 aboutDesc:'വീടുകൾ, ഓഫീസുകൾ, വ്യാപാര സ്ഥാപനങ്ങൾ എന്നിവയ്ക്കായി ആധുനിക സുരക്ഷ, CCTV നിരീക്ഷണം, നെറ്റ്‌വർക്കിംഗ്, ഇന്റലിജന്റ് ഓട്ടോമേഷൻ സേവനങ്ങൾ VIZCAM നൽകുന്നു. നിങ്ങളുടെ ഇടങ്ങൾ കൂടുതൽ സുരക്ഷിതവും ബന്ധിതവുമാക്കുന്ന വിശ്വസനീയമായ സാങ്കേതികവിദ്യയിലാണ് ഞങ്ങളുടെ ശ്രദ്ധ.',
 aboutMore:'ആദ്യ ചർച്ച മുതൽ ഇൻസ്റ്റലേഷനും തുടർസഹായവും വരെ, നിങ്ങളുടെ ആവശ്യങ്ങൾക്കനുസരിച്ചുള്ള സേവനമാണ് ഞങ്ങൾ നൽകുന്നത്.',knowUs:'നിങ്ങളുടെ പ്രോജക്ടിനെക്കുറിച്ച് സംസാരിക്കാം',
 serviceEyebrow:'ഞങ്ങളുടെ സേവനങ്ങൾ',serviceHeading:'നിങ്ങൾക്കായി പ്രവർത്തിക്കുന്ന <span class="text-gradient">സാങ്കേതികവിദ്യ.</span>',serviceSubtitle:'ആധുനിക വീടുകൾക്കും വളരുന്ന ബിസിനസുകൾക്കും പൂർണ സുരക്ഷാ, ഓട്ടോമേഷൻ സേവനങ്ങൾ.'
};
const langButton=document.getElementById('langToggle');
const translatable=[...document.querySelectorAll('[data-i18n]')];
const originalTexts=new Map(translatable.map(el=>[el,el.innerHTML]));
let lang='en';
langButton.addEventListener('click',()=>{
 lang=lang==='en'?'ml':'en';
 translatable.forEach(el=>{el.innerHTML=lang==='ml'?(translations[el.dataset.i18n]??originalTexts.get(el)):originalTexts.get(el);});
 langButton.textContent=lang==='en'?'മലയാളം':'ENGLISH';
 langButton.setAttribute('aria-label',lang==='en'?'Switch language to Malayalam':'Switch language to English');
 document.documentElement.lang=lang;
});
