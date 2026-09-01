(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='commerce.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  function actor(){const session=read('vslSellerAccessUser',null),role=session?.role||localStorage.getItem('vslSellerCurrentRole')||'owner',labels={owner:'Store Owner',manager:'Manager',supervisor:'Supervisor',cashier:'Cashier',staff:'Staff',live:'Live selling staff'};return {name:session?.name||localStorage.getItem('vslSellerActorName')||labels[role]||role,role:labels[role]||role,key:role}}
  function log(action,detail){const who=actor(),list=read('vslActivityHistory',[]);list.unshift({id:'log-'+Date.now()+'-'+Math.random().toString(16).slice(2),time:Date.now(),actor:who.name,role:who.role,action,detail});write('vslActivityHistory',list.slice(0,300))}
  let lastOrders='';
  function canToggleOrders(){return ['owner','manager','supervisor'].includes(actor().key)}
  function settings(){
    if(document.querySelector('.commerce-settings'))return;
    const panel=document.createElement('section');panel.className='commerce-settings';
    panel.innerHTML='<p class="eyebrow">SETTINGS</p><h2>Checkout settings</h2><div class="payment-options"><b>Accept:</b><label><input id="acceptCash" type="checkbox"> Cash</label><label><input id="acceptGcash" type="checkbox"> GCash</label><label>Store discount <input id="storeDiscount" type="number" min="0" max="100" value="0">%</label></div><div class="payment-options order-acceptance-row"><b>Online orders:</b><label class="order-toggle-line"><input id="acceptOrders" type="checkbox"> Open to accept online orders</label><small id="acceptOrdersMeta" class="payment-meta"></small></div>';
    document.querySelector('#live').after(panel);
    const saved=read('vslCheckoutSettings',{cash:true,gcash:true,discount:0});
    const orderGate=read('vslOrderAcceptance',{enabled:true,updatedAt:Date.now(),updatedBy:'Store Owner'});
    panel.querySelector('#acceptCash').checked=saved.cash;panel.querySelector('#acceptGcash').checked=saved.gcash;panel.querySelector('#storeDiscount').value=saved.discount;
    panel.querySelector('#acceptOrders').checked=orderGate.enabled;
    panel.querySelector('#acceptOrdersMeta').textContent='Last updated by '+orderGate.updatedBy;
    panel.querySelector('#acceptCash').onchange=panel.querySelector('#acceptGcash').onchange=panel.querySelector('#storeDiscount').onchange=()=>{const current=read('vslCheckoutSettings',{});Object.assign(current,{cash:panel.querySelector('#acceptCash').checked,gcash:panel.querySelector('#acceptGcash').checked,discount:Math.min(100,Math.max(0,Number(panel.querySelector('#storeDiscount').value)||0))});write('vslCheckoutSettings',current)};
    panel.querySelector('#acceptOrders').onchange=event=>{
      if(!canToggleOrders()){
        event.target.checked=read('vslOrderAcceptance',{enabled:true}).enabled;
        alert('Only owner, manager, or supervisor can change online order availability.');
        return;
      }
      const current={enabled:event.target.checked,updatedAt:Date.now(),updatedBy:actor().name};
      write('vslOrderAcceptance',current);
      panel.querySelector('#acceptOrdersMeta').textContent='Last updated by '+current.updatedBy;
      log(current.enabled?'Opened online orders':'Paused online orders',current.updatedBy+' changed buyer checkout availability.');
    };
  }
  function restore(order){if(order.stockRestored)return;const inventory=read('vslInventory',{});order.items.forEach(item=>inventory[item.id]=(inventory[item.id]||0)+(item.quantity||1));write('vslInventory',inventory);order.stockRestored=true}
  function orders(force=false){
    const data=read('vslOrders',[]),signature=JSON.stringify(data);if(!force&&signature===lastOrders)return;lastOrders=signature;
    let panel=document.querySelector('.seller-orders');if(!panel){panel=document.createElement('section');panel.className='seller-orders';panel.innerHTML='<p class="eyebrow">ORDER MANAGEMENT</p><h2>Live selling orders</h2><div class="seller-order-list"></div>';document.querySelector('main').append(panel)}
    const list=panel.querySelector('.seller-order-list');list.replaceChildren();if(!data.length){list.innerHTML='<p>No customer orders yet.</p>';return}
    data.slice().reverse().forEach(order=>{const card=document.createElement('article');card.className='order-card';const itemSummary=order.items.map(item=>item.name+' × '+(item.quantity||1)).join(', '),paid=order.paymentStatus==='PAID',locked=order.status==='Completed';card.innerHTML='<div class="order-head"><div><span class="order-label">ORDER</span><b>'+order.transaction+'</b></div><small>'+new Date(order.createdAt).toLocaleString()+'</small></div><div class="order-state"><span class="order-label">STATUS</span><span class="order-status">'+order.status+'</span>'+(paid?'<span class="paid-badge">PAID</span>':order.paymentStatus==='REFUNDED'?'<span class="unpaid-badge">REFUNDED</span>':'<span class="unpaid-badge">PAYMENT NOT PROCESSED</span>')+'</div><div class="order-detail buyer-detail"><span class="order-label">CUSTOMER</span><p>'+order.customerName+'</p><small>'+order.fulfillment+' · '+order.payment+'</small></div><div class="order-detail items-detail"><span class="order-label">ITEMS</span><p>'+itemSummary+'</p></div><div class="order-actions '+(locked?'locked':'')+'"><label for="status-'+order.id+'">Update status</label><select id="status-'+order.id+'" aria-label="Update order status" '+(locked?'disabled':'')+'><option>Confirming order</option><option>Preparing order</option><option>Ready for pickup</option><option>Out for delivery</option><option value="Completed" '+(paid?'':'disabled')+'>Completed'+(paid?'':' - process payment first')+'</option><option>Cancelled</option><option>Refunded</option></select>'+(locked?'<small class="payment-required-note">Completed orders are locked.</small>':paid?'':'<small class="payment-required-note">Process payment before marking completed.</small>')+'</div>';const select=card.querySelector('select');select.value=order.status==='Completed'&&!paid?'Preparing order':order.status;select.onchange=()=>{const all=read('vslOrders',[]),target=all.find(item=>item.id===order.id);if(!target)return;if(target.status==='Completed'){alert('Completed orders are locked.');select.value='Completed';return}if(select.value==='Completed'&&target.paymentStatus!=='PAID'){alert('Process payment first before marking this order as completed.');select.value=target.status;return}const previous=target.status;target.status=select.value;target.updatedAt=Date.now();if(target.status==='Cancelled')restore(target);write('vslOrders',all);log('Updated order status',target.transaction+': '+previous+' to '+target.status);orders(true)};list.append(card)});
  }
  window.addEventListener('storage',event=>{if(event.key==='vslOrders')orders()});setInterval(()=>orders(),1000);settings();orders(true);
})();
