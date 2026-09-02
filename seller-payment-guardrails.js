(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-payment-guardrails.css';document.head.append(css);
  const money=value=>'₱'+Number(value||0).toFixed(2);
  function totalFromForm(form){return Number((form.querySelector('p b')?.textContent||'').replace(/[^0-9.]/g,''))||0}
  function field(form,name){return form.elements[name]}
  function sync(form){
    const type=field(form,'type')?.value,total=totalFromForm(form);
    const cashLabel=form.querySelector('.cash-amount'),gcashLabel=form.querySelector('.gcash-amount'),referenceLabel=form.querySelector('.reference');
    const cash=field(form,'cash'),gcash=field(form,'gcash'),reference=field(form,'reference');
    if(!type||!cash||!gcash||!reference)return;
    cashLabel.hidden=type==='GCash';
    gcashLabel.hidden=type==='Cash';
    referenceLabel.hidden=type==='Cash';
    cash.required=type==='Cash'||type==='Split: Cash + GCash';
    gcash.required=type==='GCash'||type==='Split: Cash + GCash';
    reference.required=type!=='Cash';
    cash.disabled=type==='GCash';
    gcash.disabled=type==='Cash';
    reference.disabled=type==='Cash';
    if(type==='Cash'){cash.value=total.toFixed(2);gcash.value='0.00';reference.value=''}
    if(type==='GCash'){cash.value='0.00';gcash.value=total.toFixed(2)}
    let confirm=form.querySelector('.payment-confirm-details');
    if(!confirm){confirm=document.createElement('div');confirm.className='payment-confirm-details';form.querySelector('.payment-fields')?.append(confirm)}
    confirm.innerHTML='<b>Confirm tender details</b><span>Total amount: '+money(total)+'</span><span>'+(type==='Cash'?'Cash received: '+money(cash.value):type==='GCash'?'GCash amount: '+money(gcash.value)+' · Ref required':'Cash + GCash must equal '+money(total)+' · Ref required')+'</span>';
  }
  document.addEventListener('change',event=>{const form=event.target.closest('.payment-card');if(form)sync(form)},true);
  document.addEventListener('input',event=>{const form=event.target.closest('.payment-card');if(form)sync(form)},true);
  document.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('.payment-card'))return;
    sync(form);
    const type=field(form,'type')?.value,total=totalFromForm(form),cash=Number(field(form,'cash')?.value)||0,gcash=Number(field(form,'gcash')?.value)||0,reference=String(field(form,'reference')?.value||'').trim(),error=form.querySelector('.signup-error');
    if(error)error.textContent='';
    if(type==='Cash'&&Math.abs(cash-total)>.01){event.preventDefault();event.stopImmediatePropagation();if(error)error.textContent='Cash received must equal the total amount.';return}
    if(type==='GCash'&&(!reference||Math.abs(gcash-total)>.01)){event.preventDefault();event.stopImmediatePropagation();if(error)error.textContent=!reference?'GCash reference number is required.':'GCash amount must equal the total amount.';return}
    if(type==='Split: Cash + GCash'&&(!reference||cash<=0||gcash<=0||Math.abs(cash+gcash-total)>.01)){event.preventDefault();event.stopImmediatePropagation();if(error)error.textContent=!reference?'GCash reference number is required for split payment.':'Cash + GCash must equal the total amount.'}
  },true);
  new MutationObserver(()=>document.querySelectorAll('.payment-card').forEach(sync)).observe(document.body,{childList:true,subtree:true});
})();
