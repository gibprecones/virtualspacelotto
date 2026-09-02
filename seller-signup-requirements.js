(()=>{
  const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());
  const validPHMobile=value=>/^(09\d{9}|\+639\d{9}|639\d{9})$/.test(String(value||'').replace(/[\s\-().]/g,''));
  const form=document.getElementById('appForm');
  const permit=document.getElementById('hasPermit');
  const support=document.getElementById('supportingDoc');
  const supportLabel=document.getElementById('supportingDocLabel');
  function resultBox(){return document.getElementById('result')}
  function showErrors(errors){resultBox().innerHTML='<div class="seller-signup-error">'+errors.map(error=>'<p>'+error+'</p>').join('')+'</div>';resultBox().scrollIntoView({behavior:'smooth',block:'center'})}
  function syncRequirement(){if(!permit||!support||!supportLabel)return;support.required=!!permit.value;supportLabel.childNodes[0].nodeValue=permit.value==='yes'?'Business Permit ':'NBI / supporting document '}
  permit?.addEventListener('change',syncRequirement);
  form?.addEventListener('submit',event=>{
    const idFile=form.querySelector('label input[type="file"]'),email=document.getElementById('appEmail')?.value||'',mobile=document.getElementById('appMobile')?.value||'',errors=[];
    if(!validEmail(email))errors.push('Valid email address is required as alternative contact.');
    if(!validPHMobile(mobile))errors.push('Enter a valid Philippine mobile number: 09XXXXXXXXX or +639XXXXXXXXX.');
    if(!idFile?.files?.length)errors.push('Valid government ID is required.');
    if(permit?.value==='yes'&&!support?.files?.length)errors.push('Business permit upload is required when you select Yes.');
    if(permit?.value==='no'&&!support?.files?.length)errors.push('NBI / supporting document is required when you select No business permit.');
    if(errors.length){event.preventDefault();event.stopImmediatePropagation();showErrors(errors)}
  },true);
  window.requestFollowUp=function(){
    try{const id=localStorage.getItem('vslApplication'),apps=JSON.parse(localStorage.getItem('vslApplications')||'[]'),app=apps.find(item=>item.id===id);if(app){app.followUp=true;localStorage.setItem('vslApplications',JSON.stringify(apps));localStorage.setItem('vslSupportApplication',app.id)}}catch{}
    location.href='seller-support.html';
  };
  const originalLogin=window.loginApplicant;
  window.loginApplicant=function(){
    const email=document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const app=(()=>{try{return JSON.parse(localStorage.getItem('vslApplications')||'[]').find(item=>item.email===email)}catch{return null}})();
    if(app&&app.status!=='APPROVED'){localStorage.setItem('vslSupportApplication',app.id);location.href='seller-support.html';return}
    originalLogin?.();
  };
  syncRequirement();
})();
