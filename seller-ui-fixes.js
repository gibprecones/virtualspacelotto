(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-ui-fixes.css';document.head.append(css);
  function saveControls(){
    const area=document.querySelector('.gcash-settings');if(!area||area.querySelector('.save-gcash-details'))return;
    const row=document.createElement('div');row.className='save-gcash-row';row.innerHTML='<button type="button" class="save-gcash-details">Save GCash Details</button><span class="gcash-save-status"></span>';area.append(row);
    row.querySelector('button').onclick=()=>{let settings={};try{settings=JSON.parse(localStorage.getItem('vslCheckoutSettings')||'{}')}catch{}settings.gcashName=area.querySelector('#gcashName')?.value.trim()||'';settings.gcashNumber=area.querySelector('#gcashNumber')?.value.trim()||'';const preview=area.querySelector('.gcash-qr-preview');if(preview?.src&&!preview.hidden)settings.gcashQr=preview.src;localStorage.setItem('vslCheckoutSettings',JSON.stringify(settings));row.querySelector('.gcash-save-status').textContent='✓ GCash details saved';setTimeout(()=>row.querySelector('.gcash-save-status').textContent='',3000)};
  }
  function stabilizePaidOrders(){
    document.querySelectorAll('.seller-order-list .order-card').forEach(card=>{
      const badges=[...card.querySelectorAll('.paid-badge')];badges.slice(1).forEach(badge=>badge.remove());
      if(!badges.length)return;badges[0].textContent='PAID';
      if(!card.querySelector('.paid-loop-guard')){const guard=document.createElement('span');guard.className='process-payment paid-loop-guard';guard.hidden=true;card.querySelector('.order-actions')?.append(guard)}
    });
  }
  setInterval(()=>{saveControls();stabilizePaidOrders()},500);saveControls();stabilizePaidOrders();
})();
