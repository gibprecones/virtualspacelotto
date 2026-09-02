(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-online-order-flow.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const toLabel=time=>{if(!time)return '';const [hour,minute]=String(time).split(':').map(Number),date=new Date();date.setHours(hour||0,minute||0,0,0);return date.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})};
  function enhanceOrders(){
    const orders=read('vslOrders',[]);
    document.querySelectorAll('.seller-order-list .order-card').forEach(card=>{
      const code=card.querySelector('.order-head b')?.textContent;
      const order=orders.find(item=>item.transaction===code);
      if(!order)return;
      if(!card.querySelector('.seller-pickup-slot-note')){
        const note=document.createElement('p');
        note.className='seller-pickup-slot-note';
        note.innerHTML='<b>Pickup/order time:</b> '+(order.pickupSlotLabel||toLabel(order.pickupSlot)||'Not selected');
        card.querySelector('.buyer-detail')?.append(note);
      }
      if(order.payment==='GCash'&&!card.querySelector('.seller-gcash-direct-note')){
        const note=document.createElement('p');
        note.className='seller-gcash-direct-note';
        note.textContent='GCash selected by buyer. Confirm direct payment to store and require reference number before marking as paid/completed.';
        card.querySelector('.order-actions')?.prepend(note);
      }
    });
  }
  const originalOpen=window.vslOpenPaymentModal;
  function patchPaymentModal(){
    if(window.vslOpenPaymentModal?.dataset?.schedulePatched)return;
    const base=window.vslOpenPaymentModal;
    if(typeof base!=='function'||base===originalOpen&&base?.dataset?.schedulePatched)return;
    const wrapped=function(order){
      base(order);
      setTimeout(()=>{
        const modal=document.querySelector('.payment-modal .payment-card');
        if(!modal||modal.querySelector('.seller-payment-context'))return;
        const context=document.createElement('div');
        context.className='seller-payment-context';
        context.innerHTML='<b>Order check</b><p>Buyer payment method: '+(order.payment||'Not set')+'</p><p>Pickup/order time: '+(order.pickupSlotLabel||toLabel(order.pickupSlot)||'Not selected')+'</p>'+(order.payment==='GCash'?'<p class="warning">GCash must be paid directly to the store. Reference number is required.</p>':'');
        modal.querySelector('h2')?.after(context);
      },50);
    };
    wrapped.dataset={schedulePatched:'1'};
    window.vslOpenPaymentModal=wrapped;
  }
  setInterval(()=>{enhanceOrders();patchPaymentModal()},500);
  enhanceOrders();patchPaymentModal();
})();
