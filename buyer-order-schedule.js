(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='buyer-order-schedule.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const defaults={openTime:'08:00',closeTime:'17:00',acceptStart:'09:00',ordersPerHour:5};
  const toMinutes=time=>{const [h,m]=String(time||'00:00').split(':').map(Number);return (h||0)*60+(m||0)};
  const toLabel=time=>{const [hour,minute]=String(time||'00:00').split(':').map(Number),date=new Date();date.setHours(hour||0,minute||0,0,0);return date.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})};
  const schedule=()=>({...defaults,...read('vslOrderSchedule',{})});
  function isOpen(){
    const data=schedule(),now=new Date(),current=now.getHours()*60+now.getMinutes();
    return current>=toMinutes(data.acceptStart)&&current<toMinutes(data.closeTime);
  }
  function slotValue(minutes){return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')}
  function orderCountForSlot(slot){return read('vslOrders',[]).filter(order=>order.pickupSlot===slot&&!['Cancelled','Refunded'].includes(order.status)).length}
  function availableSlots(){
    const data=schedule(),start=toMinutes(data.acceptStart),end=toMinutes(data.closeTime),slots=[];
    for(let minute=start;minute<end;minute+=60){
      const value=slotValue(minute),count=orderCountForSlot(value),capacity=Number(data.ordersPerHour)||1;
      slots.push({value,label:toLabel(value),count,capacity,available:count<capacity});
    }
    return slots;
  }
  function noticeText(){const data=schedule();return 'Online orders: '+toLabel(data.acceptStart)+' - '+toLabel(data.closeTime)+' · '+data.ordersPerHour+' orders/hour';}
  function renderVideoNotice(){
    const video=document.querySelector('.video');if(!video)return;
    let badge=video.querySelector('.buyer-order-window-badge');
    if(!badge){badge=document.createElement('div');badge.className='buyer-order-window-badge';video.append(badge)}
    badge.innerHTML='<b>'+noticeText()+'</b><span>'+(isOpen()?'Accepting orders now':'Orders not yet open')+'</span>';
  }
  function enforceDrawer(){
    const open=isOpen();
    document.querySelectorAll('.drawer-add').forEach(button=>{button.disabled=button.disabled||!open;if(!open)button.textContent='Opens later'});
    const checkout=document.querySelector('#storeCheckout');
    if(checkout){checkout.disabled=checkout.disabled||!open;checkout.textContent=open?checkout.textContent:'Orders open later'}
  }
  function injectCheckoutDetails(modal){
    const form=modal.querySelector('.checkout-card');
    if(!form||form.querySelector('.pickup-slot-group')||form.querySelector('.order-success'))return;
    const slots=availableSlots();
    const firstGroup=form.querySelector('.checkout-group');
    const pickup=document.createElement('div');
    pickup.className='checkout-group pickup-slot-group';
    pickup.innerHTML='<b>Pickup / order time</b><p class="slot-help">Choose an available time set by the seller.</p><div class="pickup-slot-grid">'+slots.map(slot=>'<label class="'+(slot.available?'':'slot-full')+'"><input required type="radio" name="pickupSlot" value="'+slot.value+'" '+(slot.available?'':'disabled')+'><span>'+slot.label+'</span><small>'+slot.count+' / '+slot.capacity+' orders</small></label>').join('')+'</div>';
    firstGroup?.before(pickup);
    const reminder=document.createElement('div');
    reminder.className='gcash-direct-reminder';
    reminder.textContent='GCash payment still needs to be paid directly to the store. Seller will verify the reference number before completing your order.';
    firstGroup?.after(reminder);
    reminder.hidden=true;
    form.querySelectorAll('[name="payment"]').forEach(radio=>radio.addEventListener('change',()=>{reminder.hidden=radio.value!=='GCash'||!radio.checked}));
  }
  document.addEventListener('click',event=>{
    const add=event.target.closest('.drawer-add');
    const checkout=event.target.closest('#storeCheckout,.drawer-checkout');
    if((add||checkout)&&!isOpen()){
      event.preventDefault();event.stopImmediatePropagation();
      alert('Online orders are not yet open. '+noticeText());
    }
  },true);
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!form.matches('.checkout-card')||form.querySelector('.order-success'))return;
    const slot=form.elements.pickupSlot?.value;
    if(!slot){event.preventDefault();event.stopImmediatePropagation();alert('Please choose an available pickup/order time.');return}
    if(orderCountForSlot(slot)>=Number(schedule().ordersPerHour||1)){event.preventDefault();event.stopImmediatePropagation();alert('That time slot is already full. Please choose another available time.');return}
    localStorage.setItem('vslPendingPickupSlot',slot);
    setTimeout(()=>{
      const orders=read('vslOrders',[]),target=orders.filter(order=>viewer&&order.customerEmail===viewer.email&&!order.pickupSlot).at(-1),pending=localStorage.getItem('vslPendingPickupSlot');
      if(target&&pending){target.pickupSlot=pending;target.pickupSlotLabel=toLabel(pending);target.scheduleSnapshot=schedule();write('vslOrders',orders);localStorage.removeItem('vslPendingPickupSlot')}
    },120);
  },true);
  new MutationObserver(()=>{renderVideoNotice();enforceDrawer();document.querySelectorAll('.checkout-modal').forEach(injectCheckoutDetails)}).observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{renderVideoNotice();enforceDrawer();document.querySelectorAll('.checkout-modal').forEach(injectCheckoutDetails)},500);
  renderVideoNotice();enforceDrawer();
})();
