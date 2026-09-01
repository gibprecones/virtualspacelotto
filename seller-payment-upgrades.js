(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='checkout-upgrades.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const roleLabels={owner:'Store Owner',manager:'Manager',supervisor:'Supervisor',cashier:'Cashier',staff:'Staff',live:'Live selling staff'};
  function log(action,detail){try{const role=localStorage.getItem('vslSellerCurrentRole')||'owner',logs=read('vslActivityHistory',[]);logs.unshift({id:'log-'+Date.now()+'-'+Math.random().toString(16).slice(2),time:Date.now(),actor:localStorage.getItem('vslSellerActorName')||roleLabels[role]||role,role:roleLabels[role]||role,action,detail});write('vslActivityHistory',logs.slice(0,300))}catch{}}

  function settings(){
    const panel=document.querySelector('.commerce-settings');if(!panel||panel.querySelector('.gcash-settings'))return;
    const area=document.createElement('div');area.className='gcash-settings';
    area.innerHTML='<label>GCash account name<input id="gcashName" placeholder="Account name"></label><label>GCash mobile number<input id="gcashNumber" inputmode="tel" placeholder="09XXXXXXXXX"></label><label>GCash QR code<input id="gcashQr" type="file" accept="image/*"></label><img class="gcash-qr-preview" hidden alt="GCash QR preview">';
    panel.querySelector('.payment-options').append(area);
    const saved=read('vslCheckoutSettings',{cash:true,gcash:true,discount:0});
    area.querySelector('#gcashName').value=saved.gcashName||'';
    area.querySelector('#gcashNumber').value=saved.gcashNumber||'';
    const preview=area.querySelector('.gcash-qr-preview');
    if(saved.gcashQr){preview.src=saved.gcashQr;preview.hidden=false}
    const sync=()=>{
      const current=read('vslCheckoutSettings',{cash:true,gcash:true,discount:0});
      Object.assign(current,{gcashName:area.querySelector('#gcashName').value.trim(),gcashNumber:area.querySelector('#gcashNumber').value.trim()});
      write('vslCheckoutSettings',current);
      area.classList.toggle('active',document.querySelector('#acceptGcash')?.checked);
    };
    area.querySelectorAll('input:not([type=file])').forEach(input=>input.oninput=sync);
    area.querySelector('#gcashQr').onchange=()=>{
      const file=area.querySelector('#gcashQr').files?.[0];if(!file)return;
      const reader=new FileReader();
      reader.onload=()=>{const current=read('vslCheckoutSettings',{});current.gcashQr=reader.result;current.gcashName=area.querySelector('#gcashName').value.trim();current.gcashNumber=area.querySelector('#gcashNumber').value.trim();write('vslCheckoutSettings',current);preview.src=reader.result;preview.hidden=false};
      reader.readAsDataURL(file);
    };
    document.querySelector('#acceptGcash')?.addEventListener('change',sync);
    sync();
  }

  function paymentModal(order){
    const modal=document.createElement('div');modal.className='payment-modal';
    modal.innerHTML='<form class="payment-card"><button type="button" class="drawer-close">×</button><p class="eyebrow">POS PAYMENT</p><h2>Process payment</h2><p>'+order.transaction+' · <b>₱'+Number(order.total).toFixed(2)+'</b></p><div class="payment-fields"><label>Payment type<select name="type"><option>Cash</option><option>GCash</option><option>Split: Cash + GCash</option></select></label><label class="cash-amount">Cash amount<input name="cash" type="number" min="0" step="0.01"></label><label class="gcash-amount">GCash amount<input name="gcash" type="number" min="0" step="0.01"></label><label class="reference">GCash reference number<input name="reference" maxlength="40"></label><p class="signup-error"></p></div><button class="place-order">Confirm payment</button></form>';
    document.body.append(modal);
    modal.querySelector('.drawer-close').onclick=()=>modal.remove();
    const form=modal.querySelector('form'),type=form.elements.type;
    const toggle=()=>{form.querySelector('.cash-amount').hidden=type.value==='GCash';form.querySelector('.gcash-amount').hidden=type.value==='Cash';form.querySelector('.reference').hidden=type.value==='Cash';if(type.value==='Cash')form.elements.cash.value=order.total;if(type.value==='GCash')form.elements.gcash.value=order.total};
    type.onchange=toggle;toggle();
    form.onsubmit=event=>{
      event.preventDefault();
      const cash=Number(form.elements.cash.value)||0,gcash=Number(form.elements.gcash.value)||0,reference=form.elements.reference.value.trim(),error=form.querySelector('.signup-error');
      if(type.value!=='Cash'&&!reference){error.textContent='GCash reference number is required.';return}
      if(Math.abs(cash+gcash-Number(order.total))>.01){error.textContent='Cash and GCash amounts must equal the order total.';return}
      const orders=read('vslOrders',[]),target=orders.find(item=>item.id===order.id);if(!target)return;
      Object.assign(target,{paymentStatus:'PAID',processedPayment:{type:type.value,cash,gcash,reference,processedAt:Date.now()}});
      write('vslOrders',orders);
      log('Processed payment',target.transaction+': '+type.value+' '+Number(target.total).toFixed(2)+(reference?' ref '+reference:''));
      modal.remove();
    };
  }
  window.vslOpenPaymentModal=paymentModal;

  function orderButtons(){
    document.querySelectorAll('.seller-order-list .order-card').forEach(card=>{
      if(card.querySelector('.process-payment'))return;
      const transaction=card.querySelector('.order-head b')?.textContent,order=read('vslOrders',[]).find(item=>item.transaction===transaction);
      if(!order||order.status==='Completed')return;
      if(order.paymentStatus==='PAID'){if(!card.querySelector('.paid-badge'))card.querySelector('.order-status')?.insertAdjacentHTML('afterend','<span class="paid-badge">PAID</span>');return}
      const button=document.createElement('button');button.className='process-payment';button.textContent='Process payment';button.onclick=()=>paymentModal(order);card.querySelector('.order-actions')?.append(button);
    });
  }
  setInterval(()=>{settings();orderButtons()},500);settings();
})();
