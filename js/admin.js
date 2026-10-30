'use strict';
(function () {
  const $=id=>document.getElementById(id);
  const home=$('homeView'), admin=$('adminView'), modal=$('loginBackdrop');
  const fields=['companyName','companyAddress','companyPhone','companyEmail','companyGST','quoteTitle','quoteNumber','quoteDate','validUntil','clientName','clientPhone','clientLocation','clientGST','discount','taxRate','terms'];
  const defaultItems=[{name:'CCTV Camera',qty:1,unit:'Nos',rate:0},{name:'Installation and Configuration',qty:1,unit:'Job',rate:0}];
  let items=defaultItems.map(x=>({...x}));let savedInitial={};
  const money=n=>'₹'+new Intl.NumberFormat('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(isFinite(n)?n:0);
  const shortDate=s=>{if(!s)return '—';const d=new Date(s+'T12:00:00');return isNaN(d.valueOf())?s:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});};
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),3200)}
  let pinUnlocked=false;  // This SHA-256 comparison is only a UI gate, not secure server authentication.
  const PIN_CHECK='a58bc8db2aa90235ae910d567fdf63d326de2b82ea7c98ffd11c9f491e559815';
  function openModal(){
    modal.classList.add('show');
    $('adminPin').value='';
    $('adminPin').setAttribute('aria-invalid','false');
    $('pinError').textContent='';
    $('adminPin').focus();
  }
  function closeModal(){modal.classList.remove('show')}
  function showAdmin(){
    if(!pinUnlocked){openModal();return}
    closeModal();home.style.display='none';admin.classList.add('open');showPanel('overview');window.scrollTo(0,0);render();
  }
  function showHome(){
    pinUnlocked=false;
    closeModal();admin.classList.remove('open');home.style.display='block';window.scrollTo(0,0);
  }
  $('openLogin').addEventListener('click',openModal);$('heroOpenLogin').addEventListener('click',openModal);
  $('quickPreview').addEventListener('click',openModal);
  $('pinForm').addEventListener('submit',async function(e){
    e.preventDefault();
    const pin=$('adminPin').value.trim();
    if(!pin){$('pinError').textContent='Please enter your PIN.';$('adminPin').focus();return}
    try {
      const bytes=new TextEncoder().encode('vizcam|admin|'+pin);
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
      if(hash!==PIN_CHECK){$('pinError').textContent='Incorrect PIN. Please try again.';$('adminPin').value='';$('adminPin').focus();return}
      pinUnlocked=true;showAdmin();
    }catch(err){$('pinError').textContent='This browser cannot open the admin screen. Please use a modern browser over HTTPS.'}
  });
  $('closeLogin').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show'))closeModal()});
  $('backHome').addEventListener('click',showHome);$('homeLogo').addEventListener('click',e=>{e.preventDefault();showHome()});
  $('quotesLink').addEventListener('click',newQuotation);
  function safeNum(x){const v=Number(x);return isFinite(v)&&v>0?v:0}
  function createInput(placeholder,value,onChange,type='text'){
    const input=document.createElement('input');input.placeholder=placeholder;input.type=type;input.value=value;input.addEventListener('input',e=>onChange(e.target.value));return input;
  }
  function lineEditor(){const editor=$('itemEditor');editor.replaceChildren();items.forEach((item,i)=>{
      const row=document.createElement('div');row.className='quote-line';const top=document.createElement('div');top.className='quote-line-top';const title=document.createElement('span');title.textContent='ITEM '+String(i+1).padStart(2,'0');const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.addEventListener('click',()=>{if(items.length===1){toast('At least one item is required.');return}items.splice(i,1);lineEditor();render()});top.append(title,remove);row.append(top);
      const nameGroup=document.createElement('div');nameGroup.className='input-group';const nameLabel=document.createElement('label');nameLabel.textContent='Description';const nameInput=createInput('Item / service',item.name,s=>{item.name=s;render()});nameInput.maxLength=150;nameGroup.append(nameLabel,nameInput);row.append(nameGroup);
      const bottom=document.createElement('div');bottom.className='quote-line-bottom';
      for(const spec of [{label:'Qty',key:'qty',type:'number'},{label:'Unit',key:'unit',type:'text'},{label:'Rate (₹)',key:'rate',type:'number'}]){
        const div=document.createElement('div');div.className='input-group';const lab=document.createElement('label');lab.textContent=spec.label;const inp=createInput(spec.label,item[spec.key],s=>{item[spec.key]=spec.type==='number'?Math.max(0,Number(s)||0):s;render()},spec.type);if(spec.type==='number'){inp.min='0';inp.step=spec.key==='qty'?'1':'0.01'}div.append(lab,inp);bottom.append(div);
      }
      row.append(bottom);editor.append(row)
    })}
  function show(id,value){$(id).textContent=value??''}
  function state(){const s={};fields.forEach(k=>s[k]=$(k).value);s.items=items.map(x=>({...x}));return s}
  function render(){
    show('printCompany',$('companyName').value||'VIZCAM');show('printAddress',$('companyAddress').value);show('printPhone',$('companyPhone').value);show('printEmail',$('companyEmail').value);
    const gst=$('companyGST').value.trim();show('printGST',gst?'GSTIN: '+gst:'');
    show('printTitle',$('quoteTitle').value);show('printClient',$('clientName').value||'Customer');show('printClientPhone',$('clientPhone').value);show('printClientLocation',$('clientLocation').value);
    const cg=$('clientGST').value.trim();show('printClientGST',cg?'Customer GSTIN: '+cg:'');
    show('printNumber',$('quoteNumber').value);show('printDate',shortDate($('quoteDate').value));show('printValid',shortDate($('validUntil').value));show('printTerms',$('terms').value);
    const tbody=$('printItems');tbody.replaceChildren();let sub=0;
    items.forEach((x,i)=>{const amount=safeNum(x.qty)*safeNum(x.rate);sub+=amount;const tr=document.createElement('tr');const cols=[String(i+1),x.name||'Item',String(safeNum(x.qty))+' '+(x.unit||'Nos'),money(x.rate),money(amount)];cols.forEach((v,j)=>{const td=document.createElement('td');if(j===1){const strong=document.createElement('span');strong.className='item-name';strong.textContent=v;td.append(strong)}else{td.textContent=v}tr.append(td)});tbody.append(tr)});
    let discount=Math.min(sub,safeNum($('discount').value));const rate=safeNum($('taxRate').value);const taxable=sub-discount;const tax=taxable*rate/100;const total=taxable+tax;
    show('printSubtotal',money(sub));show('printDiscount','−'+money(discount));show('printTaxLabel','GST ('+rate+'%)');show('printTax',money(tax));show('printTotal',money(total));
    $('printDiscountRow').style.display=discount?'flex':'none';$('printTaxRow').style.display=rate?'flex':'none';
    if(invoiceRecord)renderInvoicePresentation();
  }
  function todayISO(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
  const QUOTE_STORAGE='vizcam-quotes-v2';
  let currentRecord=null,invoiceRecord=null,activeFilter='all',records=[];
  function loadRecords(){
    try{const parsed=JSON.parse(localStorage.getItem(QUOTE_STORAGE)||'[]');return Array.isArray(parsed)?parsed.filter(x=>x&&typeof x.id==='string'&&/^VC-Q-\d{6}-\d{4,}$/.test(x.id)&&x.data&&x.data.clientName).slice(0,10000):[]}
    catch{return []}
  }
  function persist(){try{localStorage.setItem(QUOTE_STORAGE,JSON.stringify(records));return true}catch{toast('Could not save. Check browser storage and export a backup.');return false}}
  function datePart(iso){const parts=(iso||todayISO()).split('-');return (parts[2]||'01')+(parts[1]||'01')+(parts[0]||'2026').slice(-2)}
  function nextNumber(iso){const prefix='VC-Q-'+datePart(iso)+'-';let max=0;for(const record of records){if(record.id.startsWith(prefix)){max=Math.max(max,Number(record.id.slice(prefix.length))||0)}}return prefix+String(max+1).padStart(4,'0')}
  function calculateTotal(s){const sub=(s.items||[]).reduce((sum,item)=>sum+safeNum(item.qty)*safeNum(item.rate),0);const taxable=Math.max(0,sub-Math.min(sub,safeNum(s.discount)));return Math.round((taxable+taxable*safeNum(s.taxRate)/100)*100)/100}
  function nextInvoiceNumber(iso){
    const prefix='VC-INV-'+datePart(iso)+'-';
    let max=0;
    for(const record of records){
      const id=record.invoice?.number||'';
      if(id.startsWith(prefix))max=Math.max(max,Number(id.slice(prefix.length))||0);
    }
    return prefix+String(max+1).padStart(4,'0');
  }
  function resetInvoiceMode(){
    invoiceRecord=null;
    $('generatorPanel').classList.remove('invoice-mode');
    $('invoiceToolbar').hidden=true;
    $('invoiceShortcut').hidden=true;
    show('generatorHeading','Quotation Generator');
    show('generatorDescription','Create a professional, itemized quotation for a VIZCAM customer.');
    show('generatorPill','● Quotation workspace');
    show('previewModeTitle','Live Quotation Preview');
    show('printDocType','QUOTATION');
    show('printClientHeading','PREPARED FOR');
    show('printNumberLabel','Quotation No.');
    show('printDateLabel','Date');
    show('printValidLabel','Valid Until');
    show('printTotalLabel','Grand Total');
    show('printTermsHeading','TERMS & CONDITIONS');
    $('printSourceRow').hidden=true;
    $('quotePaper').setAttribute('aria-label','Printable VIZCAM quotation');
  }
  function renderInvoicePresentation(){
    if(!invoiceRecord?.invoice)return;
    const invoice=invoiceRecord.invoice;
    show('printDocType','INVOICE');
    show('printClientHeading','BILL TO');
    show('printNumberLabel','Invoice No.');
    show('printNumber',invoice.number);
    show('printDateLabel','Invoice Date');
    show('printDate',shortDate(invoice.date));
    show('printValidLabel','Payment Status');
    show('printValid','PAID'+(invoice.paidAt?' · '+new Date(invoice.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):''));
    show('printSource',invoiceRecord.id);
    $('printSourceRow').hidden=false;
    show('printTotalLabel','Invoice Total');
    show('printTermsHeading','PAYMENT INFORMATION');
    show('printTerms','Payment received in full. Items and applicable taxes reflect completed quotation '+invoiceRecord.id+'. Please retain this invoice for your records.');
  }
  function issueOrOpenInvoice(q){
    if(!q||q.status!=='completed'){toast('Complete the quotation payment before issuing an invoice.');return}
    if(!q.invoice){
      if(!window.confirm('Create an invoice for completed quotation '+q.id+'? The invoice will keep a copy of the completed quotation details.'))return;
      const now=new Date().toISOString();
      const data=JSON.parse(JSON.stringify(q.data));
      const invoice={number:nextInvoiceNumber(todayISO()),date:todayISO(),paidAt:q.paidAt||now,createdAt:now,data};
      const updated={...q,invoice,updatedAt:now};
      const previous=records;
      records=records.map(x=>x.id===q.id?updated:x);
      if(!persist()){records=previous;return}
      q=updated;
      renderOverview();
      toast('Invoice issued: '+invoice.number);
    }
    if(!q.invoice?.data){toast('Invoice details are unavailable. Restore your quotation backup.');return}
    chooseQuote(q);
    invoiceRecord=q;
    // The invoice uses the frozen data saved on its issue date.
    fields.forEach(k=>{$(k).value=String(q.invoice.data[k]??'')});
    items=(Array.isArray(q.invoice.data.items)?q.invoice.data.items:defaultItems).slice(0,40).map(x=>({...x}));
    $('generatorPanel').classList.add('invoice-mode');
    $('invoiceToolbar').hidden=false;
    show('generatorHeading','Invoice');
    show('generatorDescription','Issued from completed quotation '+q.id+'. Saved locally in this browser.');
    show('generatorPill','● Paid invoice');
    show('previewModeTitle','Invoice Preview');
    show('invoiceIdentity',q.invoice.number);
    show('invoiceSourceInfo','From '+q.id+' · Paid');
    $('quotePaper').setAttribute('aria-label','Printable VIZCAM invoice '+q.invoice.number);
    lineEditor();render();window.scrollTo(0,0);
  }
  function expiryAfterToday(){const d=new Date();d.setDate(d.getDate()+15);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
  function newQuotation(){
    resetInvoiceMode();
    fields.forEach(k=>{$(k).value=savedInitial[k]??''});
    $('quoteDate').value=todayISO();$('validUntil').value=expiryAfterToday();
    $('clientName').value='';$('clientPhone').value='';$('clientLocation').value='';$('clientGST').value='';
    $('quoteNumber').value=nextNumber($('quoteDate').value);
    items=defaultItems.map(x=>({...x}));currentRecord=null;lineEditor();render();showPanel('generator');
    toast('New quotation ready: '+$('quoteNumber').value);
  }
  function chooseQuote(q){
    if(!q||!q.data)return;
    resetInvoiceMode();
    fields.forEach(k=>{$(k).value=String(q.data[k]??savedInitial[k]??'')});
    $('quoteNumber').value=q.id;items=(Array.isArray(q.data.items)?q.data.items:defaultItems).slice(0,40).map(x=>({...x}));
    currentRecord=q.id;lineEditor();render();showPanel('generator');
    $('invoiceShortcut').hidden=q.status!=='completed';
    $('invoiceShortcut').textContent=q.invoice?'🧾 View Invoice':'🧾 Create Invoice';
    window.scrollTo(0,0);
  }
  function saveQuotation(){
    if(invoiceRecord){toast('Invoices are read-only. Use Invoice PDF actions instead.');return false}
    const name=$('clientName').value.trim();
    if(!name){toast('Please enter customer name before saving.');$('clientName').focus();return false}
    let id=currentRecord||nextNumber($('quoteDate').value);
    if(!currentRecord && records.some(x=>x.id===id))id=nextNumber($('quoteDate').value);
    $('quoteNumber').value=id;
    const s=state();s.quoteNumber=id;
    const older=records.find(x=>x.id===id);
    if(older&&older.status==='completed'&&!window.confirm('This quotation is marked Paid. Save changes to the completed quotation?'+(older.invoice?' Its issued invoice will not be modified.':'')))return false;
    if(older&&older.status==='rejected'&&!window.confirm('This quotation is Rejected. Save edits while keeping it in Rejected?'))return false;
    const q={id,customer:name,date:s.quoteDate,total:calculateTotal(s),status:older?.status||'pending',paidAt:older?.paidAt||null,rejectedAt:older?.rejectedAt||null,invoice:older?.invoice||null,createdAt:older?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),data:s};
    const next=records.filter(x=>x.id!==id);next.push(q);next.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    const before=records;records=next;
    if(!persist()){records=before;return false}
    currentRecord=id;renderOverview();toast('Quotation saved: '+id);return true;
  }
  function showPanel(view,filter){
    const showOverview=view!=='generator';
    $('overviewPanel').hidden=!showOverview;$('generatorPanel').hidden=showOverview;
    for(const id of ['overviewLink','pendingLink','completedLink','rejectedLink','quotesLink'])$(id).classList.remove('active');
    if(showOverview){
      activeFilter=filter||'all';
      $('overviewHeading').textContent=({pending:'Pending Quotations',completed:'Completed Quotations',rejected:'Rejected Quotations'})[activeFilter]||'Quotation Overview';
      $(({pending:'pendingLink',completed:'completedLink',rejected:'rejectedLink'})[activeFilter]||'overviewLink').classList.add('active');
      renderOverview();
    }else $('quotesLink').classList.add('active');
  }
  function updateQuotationStatus(q,newStatus){
    const oldStatus=q.status||'pending';
    const allowed=(oldStatus==='pending'&&(newStatus==='completed'||newStatus==='rejected'))||(oldStatus==='rejected'&&newStatus==='pending');
    if(!allowed){toast('This status change is not available.');return}
    const questions={
      completed:'Confirm full payment received from '+q.customer+' for '+q.id+'?',
      rejected:'Reject quotation '+q.id+' for '+q.customer+'?',
      pending:'Move rejected quotation '+q.id+' back to Pending?'
    };
    if(!window.confirm(questions[newStatus]))return;
    const previous={...q};
    const now=new Date().toISOString();
    q.status=newStatus;q.updatedAt=now;
    if(newStatus==='completed'){q.paidAt=now;q.rejectedAt=null}
    else if(newStatus==='rejected'){q.rejectedAt=now;q.paidAt=null}
    else{q.paidAt=null;q.rejectedAt=null}
    if(!persist()){Object.assign(q,previous);renderOverview();return}
    renderOverview();toast(q.id+' moved to '+newStatus[0].toUpperCase()+newStatus.slice(1));
  }
  function renderOverview(){
    show('statAll',String(records.length));
    show('statPending',String(records.filter(q=>(q.status||'pending')==='pending').length));
    show('statCompleted',String(records.filter(q=>q.status==='completed').length));
    show('statRejected',String(records.filter(q=>q.status==='rejected').length));
    show('sidePending',String(records.filter(q=>(q.status||'pending')==='pending').length));
    show('sideCompleted',String(records.filter(q=>q.status==='completed').length));
    show('sideRejected',String(records.filter(q=>q.status==='rejected').length));
    // Revenue-style dashboard total excludes all pending and rejected quotations.
    show('statValue',money(records.filter(q=>q.status==='completed').reduce((sum,q)=>sum+Number(q.total||0),0)));
    const query=$('quoteSearch').value.trim().toLowerCase();
    const body=$('recordsBody');body.replaceChildren();
    for(const tab of ['All','Pending','Completed','Rejected'])$('tab'+tab).classList.toggle('active',activeFilter===tab.toLowerCase());
    const visible=records.filter(q=>(activeFilter==='all'||(q.status||'pending')===activeFilter)&&(!query||(q.id+' '+q.customer).toLowerCase().includes(query)));
    for(const q of visible){
      const tr=document.createElement('tr');
      for(const value of [q.id,q.customer,shortDate(q.date),money(Number(q.total)||0)]){
        const td=document.createElement('td');td.textContent=value;tr.append(td)
      }
      const status=document.createElement('td');const tag=document.createElement('span');const qStatus=q.status||'pending';tag.className='record-status is-'+(qStatus==='completed'?'completed':qStatus==='rejected'?'rejected':'pending');tag.textContent=qStatus[0].toUpperCase()+qStatus.slice(1);status.append(tag);tr.append(status);
      const actions=document.createElement('td');actions.className='record-actions';
      const open=document.createElement('button');open.type='button';open.textContent='Open';open.addEventListener('click',()=>chooseQuote(q));actions.append(open);
      const printRecord=document.createElement('button');printRecord.type='button';printRecord.textContent='Print';printRecord.className='record-print';printRecord.setAttribute('aria-label','Print quotation '+q.id);printRecord.addEventListener('click',()=>{chooseQuote(q);printQuote(true)});actions.append(printRecord);
      const shareRecord=document.createElement('button');shareRecord.type='button';shareRecord.textContent='Share';shareRecord.className='record-share';shareRecord.setAttribute('aria-label','Share quotation '+q.id);shareRecord.addEventListener('click',()=>{chooseQuote(q);openShareDialog(true)});actions.append(shareRecord);
      if(qStatus==='pending'){
        const pay=document.createElement('button');pay.type='button';pay.textContent='Mark Payment Completed';pay.className='pay-action';
        pay.addEventListener('click',()=>updateQuotationStatus(q,'completed'));actions.append(pay);
        const reject=document.createElement('button');reject.type='button';reject.textContent='Reject Quotation';reject.className='reject-action';
        reject.addEventListener('click',()=>updateQuotationStatus(q,'rejected'));actions.append(reject);
      }else if(qStatus==='rejected'){
        const rejected=document.createElement('small');rejected.textContent=q.rejectedAt?'Rejected '+new Date(q.rejectedAt).toLocaleDateString('en-IN'):'Rejected';actions.append(rejected);
        const restore=document.createElement('button');restore.type='button';restore.textContent='Move to Pending';restore.className='restore-action';
        restore.addEventListener('click',()=>updateQuotationStatus(q,'pending'));actions.append(restore);
      }else{
        const paid=document.createElement('small');paid.textContent=q.paidAt?'Paid '+new Date(q.paidAt).toLocaleDateString('en-IN'):'';actions.append(paid);
        const invoice=document.createElement('button');invoice.type='button';
        invoice.textContent=q.invoice?'View Invoice':'Create Invoice';
        invoice.className='invoice-action';
        invoice.setAttribute('aria-label',(q.invoice?'View':'Create')+' invoice for quotation '+q.id);
        invoice.addEventListener('click',()=>issueOrOpenInvoice(q));actions.append(invoice);
        if(q.invoice){const number=document.createElement('small');number.textContent='Invoice: '+q.invoice.number;actions.append(number)}
      }
      tr.append(actions);body.append(tr);
    }
    $('recordsEmpty').hidden=visible.length!==0;
  }
  records=loadRecords();
  $('quoteDate').value=todayISO();$('validUntil').value=expiryAfterToday();$('quoteNumber').value=nextNumber($('quoteDate').value);
  fields.forEach(k=>{$(k).addEventListener('input',render);savedInitial[k]=$(k).value});lineEditor();render();
  $('addItem').addEventListener('click',()=>{if(items.length>=40){toast('Maximum 40 quotation items.');return}items.push({name:'New item / service',qty:1,unit:'Nos',rate:0});lineEditor();render()});
  $('quoteDate').addEventListener('change',()=>{if(!currentRecord){$('quoteNumber').value=nextNumber($('quoteDate').value);render()}});
  function printQuote(skipSave=false){
    if(invoiceRecord){render();window.print();return}
    if(!skipSave&&!saveQuotation())return;
    showPanel('generator');
    render();
    window.print();
  }

  // Keep Print, Save and Share separate from the quotation content.
  // The share dialog allows a real PDF attachment where the browser permits it.
  function shareMessage(){
    const q=state(),total=calculateTotal(q),formattedItems=q.items.map((item,i)=>{
      const qty=safeNum(item.qty),rate=safeNum(item.rate);
      return (i+1)+'. '+(item.name||'Item')+' - '+qty+' '+(item.unit||'Nos')+' x '+money(rate)+' = '+money(qty*rate);
    });
    const isInvoice=Boolean(invoiceRecord?.invoice);
    const invoice=isInvoice?invoiceRecord.invoice:null;
    return [
      'VIZCAM | CCTV, Networking & Security Systems',
      (isInvoice?'Invoice: '+invoice.number:'Quotation: '+($('quoteNumber').value||'')),
      ...(isInvoice?['Original Quotation: '+invoiceRecord.id,'Payment Status: PAID']:[]),
      'Customer: '+q.clientName,
      'Date: '+shortDate(isInvoice?invoice.date:q.quoteDate),
      'Installation location: '+(q.clientLocation||'Not specified'),
      '',
      'Items:',
      ...formattedItems,
      '',
      (isInvoice?'Invoice Total: ':'Grand Total: ')+money(total),
      ...(isInvoice?['Paid on: '+shortDate((invoice.paidAt||'').slice(0,10))]:['Valid Until: '+shortDate(q.validUntil)]),
      '',
      'Contact: +91 89438 54151 | service@vizcam.in',
      'www.vizcam.in'
    ].join('\n');
  }
  function openShareDialog(skipSave=false){
    if(!invoiceRecord&&!skipSave&&!saveQuotation())return;
    render();
    const isInvoice=Boolean(invoiceRecord?.invoice);
    const number=isInvoice?invoiceRecord.invoice.number:($('quoteNumber').value||'Quotation');
    show('shareTitle',isInvoice?'Share Invoice':'Share Quotation');
    show('shareDocumentBadge',isInvoice?'VIZCAM INVOICE':'VIZCAM QUOTATION');
    show('sharePdfDescription',isInvoice?'Share the complete paid invoice PDF on supported devices':'Share the complete quotation document on supported devices');
    show('shareWhatsappDescription',isInvoice?'Share invoice number, payment status, items and total as text':'Share quotation number, customer, items and total as text');
    $('shareQuoteInfo').textContent=number+' · '+$('clientName').value+' · '+$('printTotal').textContent;
    $('quoteShareDialog').showModal();
  }
  $('closeShare').addEventListener('click',()=>$('quoteShareDialog').close());
  $('quoteShareDialog').addEventListener('click',e=>{if(e.target===$('quoteShareDialog'))$('quoteShareDialog').close()});
  // Preserve the user's exact original stamp; never redraw or resample it.
  // During PDF export, inline the original same-origin JPEG bytes without modification.
  // Only the transparent signature is rasterized to ensure it also appears in the PDF.
  async function pdfSafeImageData(img){
    if(img.decode)await img.decode();
    if(!img.naturalWidth||!img.naturalHeight)throw new Error('Quotation image has not loaded: '+img.alt);
    if(img.classList.contains('quotation-stamp')){
      const response=await fetch(img.currentSrc || img.src,{cache:'force-cache',credentials:'same-origin'});
      if(!response.ok)throw new Error('Original VIZCAM stamp could not be loaded for PDF.');
      const blob=await response.blob();
      if(blob.type!=='image/jpeg' && blob.type!=='image/png')
        throw new Error('The original stamp file is not a supported image format.');
      const data=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(new Error('Original stamp could not be embedded in the PDF.'));
        reader.readAsDataURL(blob);
      });
      if(typeof data!=='string'||!data.startsWith('data:image/'))
        throw new Error('Original stamp image data was not prepared correctly.');
      return data;
    }
    const canvas=document.createElement('canvas');
    const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const context=canvas.getContext('2d');
    if(!context)throw new Error('This browser cannot prepare quotation images.');
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(img,0,0,canvas.width,canvas.height);
    const png=canvas.toDataURL('image/png');
    if(!png.startsWith('data:image/png;base64,'))
      throw new Error('Authorized signature could not be prepared for PDF.');
    return png;
  }
  async function getPdfFile(){
    if(!window.html2pdf){
      await new Promise((resolve,reject)=>{
        const tag=document.createElement('script');
        tag.src='js/vendor/html2pdf.bundle.min.js?v=0.14.0';
        tag.onload=resolve;tag.onerror=()=>reject(new Error('PDF library could not load.'));
        document.head.appendChild(tag);
      });
    }
    if(!window.html2pdf)throw new Error('PDF export not available.');
    const paper=$('quotePaper');
    const approvals=Array.from(paper.querySelectorAll('.quotation-stamp,.quotation-signature'));
    const originals=approvals.map(img=>({img,src:img.getAttribute('src')}));
    try{
      // If a stamp or signature cannot be prepared, fail visibly instead of silently omitting it.
      const dataUrls=[];
      for(const img of approvals)dataUrls.push(await pdfSafeImageData(img));
      approvals.forEach((img,i)=>{img.src=dataUrls[i]});
      await Promise.all(Array.from(paper.querySelectorAll('img')).map(img=>img.decode ? img.decode():Promise.resolve()));
      const blob=await window.html2pdf().set({
        margin:6,
        image:{type:'jpeg',quality:0.98},
        html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',scrollY:0},
        jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
        pagebreak:{mode:['css','legacy'],avoid:['tr','.quote-bottom','.quote-terms','.approval-images','.sign-off']}
      }).from(paper).outputPdf('blob');
      const name=(invoiceRecord?.invoice?.number||$('quoteNumber').value||'VIZCAM-Quotation').replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf';
      return new File([blob],name,{type:'application/pdf'});
    }finally{
      originals.forEach(item=>{item.img.setAttribute('src',item.src)});
    }
  }
  function downloadFile(file){
    const url=URL.createObjectURL(file);
    const a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),15000);
  }
  let pdfBusy=false;
  $('savePDF').addEventListener('click',async()=>{
    if(pdfBusy)return;
    pdfBusy=true;$('savePDF').disabled=true;
    try {
      const file=await getPdfFile();
      downloadFile(file);
      toast('PDF downloaded: '+file.name);
      $('quoteShareDialog').close();
    }catch(e){toast('PDF export unavailable. Use Print and choose Save as PDF.')}
    finally{pdfBusy=false;$('savePDF').disabled=false}
  });
  $('sharePDF').addEventListener('click',async()=>{
    if(pdfBusy)return;
    pdfBusy=true;$('sharePDF').disabled=true;
    try {
      const file=await getPdfFile();
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        try {
          await navigator.share({files:[file],title:(invoiceRecord?'VIZCAM Invoice ':'VIZCAM Quotation ')+(invoiceRecord?.invoice?.number||$('quoteNumber').value),text:(invoiceRecord?'Paid invoice for ':'Quotation for ')+$('clientName').value});
          $('quoteShareDialog').close();toast('Sharing completed.');
        }catch(e){if(e.name!=='AbortError')toast('Could not share PDF. Please try Download PDF.')}
      }else{
        downloadFile(file);
        toast('PDF downloaded. Attach it to WhatsApp or email to share.');
        $('quoteShareDialog').close();
      }
    }catch(e){toast('PDF sharing unavailable. Try WhatsApp Message or Print.')}
    finally{pdfBusy=false;$('sharePDF').disabled=false}
  });
  $('shareWhatsApp').addEventListener('click',()=>{
    const url='https://wa.me/?text='+encodeURIComponent(shareMessage());
    const tab=window.open(url,'_blank','noopener,noreferrer');
    if(!tab)window.location.href=url;
    $('quoteShareDialog').close();
  });

  $('invoiceShortcut').addEventListener('click',()=>{
    const q=records.find(x=>x.id===currentRecord);
    if(q)issueOrOpenInvoice(q);
    else toast('Select a completed quotation first.');
  });
  $('invoicePrint').addEventListener('click',()=>{
    if(!invoiceRecord)return;
    render();window.print();
  });
  $('invoiceDownload').addEventListener('click',async()=>{
    if(!invoiceRecord||pdfBusy)return;
    pdfBusy=true;$('invoiceDownload').disabled=true;
    try{
      const file=await getPdfFile();downloadFile(file);
      toast('Invoice PDF downloaded: '+file.name);
    }catch(e){toast('Invoice PDF unavailable. Use Print and choose Save as PDF.')}
    finally{pdfBusy=false;$('invoiceDownload').disabled=false}
  });
  $('invoiceShare').addEventListener('click',()=>{
    if(invoiceRecord)openShareDialog(true);
  });
  $('invoiceBack').addEventListener('click',()=>{
    resetInvoiceMode();showPanel('overview','completed');window.scrollTo(0,0);
  });

  document.querySelectorAll('[data-quote-action]').forEach(button=>{
    const action=button.getAttribute('data-quote-action');
    button.addEventListener('click',()=>{
      if(action==='print')printQuote();
      else if(action==='save')saveQuotation();
      else if(action==='share')openShareDialog();
    });
  });
  function downloadJSON(payload,filename){
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  $('downloadQuote').addEventListener('click',()=>downloadJSON({type:'vizcam-quotation',data:state()},($('quoteNumber').value||'VIZCAM')+'.json'));
  $('resetDemo').addEventListener('click',newQuotation);
  $('overviewLink').addEventListener('click',()=>showPanel('overview','all'));
  $('pendingLink').addEventListener('click',()=>showPanel('overview','pending'));
  $('completedLink').addEventListener('click',()=>showPanel('overview','completed'));
  $('rejectedLink').addEventListener('click',()=>showPanel('overview','rejected'));
  $('overviewNew').addEventListener('click',newQuotation);
  for(const [tab,filter] of [['tabAll','all'],['tabPending','pending'],['tabCompleted','completed'],['tabRejected','rejected']])$(tab).addEventListener('click',()=>showPanel('overview',filter));
  $('quoteSearch').addEventListener('input',renderOverview);
  $('exportBackup').addEventListener('click',()=>{
    downloadJSON({type:'vizcam-quotation-backup',version:2,exportedAt:new Date().toISOString(),quotations:records},'VIZCAM_Quotations_Backup_'+todayISO()+'.json');
    toast('Backup downloaded. Store it safely.');
  });
  $('importBackup').addEventListener('click',()=>$('backupFile').click());
  $('backupFile').addEventListener('change',async function(){
    const file=this.files?.[0];this.value='';if(!file)return;
    if(file.size>3000000){toast('Backup too large.');return}
    try{
      const obj=JSON.parse(await file.text());
      if(obj.type!=='vizcam-quotation-backup'||!Array.isArray(obj.quotations))throw new Error('Not a VIZCAM quotation backup');
      const incoming=obj.quotations.filter(q=>q&&/^VC-Q-\d{6}-\d{4,}$/.test(q.id)&&q.data&&q.data.clientName).slice(0,10000);
      if(!window.confirm('Restore '+incoming.length+' quotations? Records with the same number will be updated.'))return;
      const map=new Map(records.map(q=>[q.id,q]));
      incoming.forEach(q=>map.set(q.id,{...q,customer:String(q.customer||q.data.clientName).slice(0,100),status:q.status==='completed'?'completed':q.status==='rejected'?'rejected':'pending'}));
      const prev=records;records=Array.from(map.values());
      if(!persist())records=prev;
      else{renderOverview();toast('Backup imported: '+incoming.length+' quotations.')}
    }catch(err){toast('Import failed: '+err.message)}
  });
  window.addEventListener('storage',e=>{if(e.key===QUOTE_STORAGE){records=loadRecords();renderOverview()}});
  renderOverview();
  openModal();
})();
