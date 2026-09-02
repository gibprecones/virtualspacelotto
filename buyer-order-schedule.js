(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='buyer-order-schedule.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const pad=value=>String(value).padStart(2,'0');
  const today=()=>{const date=new Date();return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())};
  const toLabel=time=>{const [hour,minute]=String(time||'00:00').split(':').map(Number),date=new Date();date.setHours(hour||0,minute||0,0,0);return date.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})};
  const addHour=time=>{const [hour,minute]=String(time||'00:00').split(':').map(Number);return pad(Math.min(23,(hour||0)+1))+':'+pad(minute||0)};
  function legacySlots(){const s=read('vslOrderSchedule',{}),start=s.acceptStart||'08:00',end=s.closeTime||'17:00',cap=Number(s.ordersPerHour)||10,slots=[];for(let h=Number(start.slice(0,2));h<Number(end.slice(0,2));h+=1){const value=pad(h)+':00';slots.push({id:'slot-'+value,start:value,end:addHour(value),capacity:cap})}return slots}
  function slotsForDate(date){return read('vslAppointmentSchedules',{})[date]||legacySlots()}
  function orderCount(date,slot){return read('vslOrders',[]).filter(order=>(order.pickupDate||today())===date&&order.pickupSlot===slot&&!['Cancelled','Refunded'].includes(order.status)).length}
  function availableSlots(date){return slotsForDate(date).map(slot=>{const count=orderCount(date,slot.start),capacity=Number(slot.capacity)||1;return {...slot,count,remaining:Math.max(0,capacity-count),available:count<capacity}})}
  function scheduleOpen(){return availableSlots(today()).some(slot=>slot.available)}
  function noticeText(){const slots=availableSlots(today());if(!slots.length)return 'No pickup slots set for today';const first=slots[0],last=slots[slots.length-1];return 'Today: '+toLabel(first.start)+' - '+toLabel(last.end)+' · '+slots.reduce((sum,slot)=>sum+slot.remaining,0)+' slots left'}
  function renderVideoNotice(){const video=document.querySelector('.video');if(!video)return;let badge=video.querySelector('.buyer-order-window-badge');if(!badge){badge=document.createElement('div');badge.className='buyer-order-window-badge';video.append(badge)}badge.innerHTML='<b>Online order schedule</b><span>'+noticeText()+'</span>'}
  function enforceDrawer(){const open=scheduleOpen();document.querySelectorAll('.drawer-add').forEach(button=>{button.disabled=button.disabled||!open;if(!open)button.textContent='No slots today'});const checkout=document.querySelector('#storeCheckout');if(checkout){checkout.disabled=checkout.disabled||!open;checkout.textContent=open?checkout.textContent:'No slots today'}}
  function renderSlotGrid(group,date){const grid=group.querySelector('.pickup-slot-grid'),slots=availableSlots(date);grid.innerHTML=slots.length?slots.map(slot=>'<label class="'+(slot.available?'':'slot-full')+'"><input required type="radio" name="pickupSlot" value="'+slot.start+'" data-label="'+toLabel(slot.start)+' - '+toLabel(slot.end)+'" '+(slot.available?'':'disabled')+'><span>'+toLabel(slot.start)+' - '+toLabel(slot.end)+'</span><small>'+slot.remaining+' slot(s) left</small></label>').join(''):'<p class="slot-empty">No available slots for this date.</p>'}
  function injectCheckoutDetails(modal){
    const form=modal.querySelector('.checkout-card');if(!form||form.querySelector('.pickup-slot-group')||form.querySelector('.order-success'))return;
    const firstGroup=form.querySelector('.checkout-group'),pickup=document.createElement('div');pickup.className='checkout-group pickup-slot-group';
    pickup.innerHTML='<b>Pickup / order schedule</b><p class="slot-help">Default is today. Pick date and time to see remaining available slots.</p><label class="pickup-date-field">Pickup date<input required type="date" name="pickupDate" value="'+today()+'"></label><div class="pickup-slot-grid"></div>';
    firstGroup?.before(pickup);renderSlotGrid(pickup,today());
    pickup.querySelector('[name="pickupDate"]').addEventListener('change',event=>renderSlotGrid(pickup,event.target.value||today()));
    const reminder=document.createElement('div');reminder.className='gcash-direct-reminder';reminder.textContent='GCash payment still needs to be paid directly to the store. Seller will verify the reference number before completing your order.';firstGroup?.after(reminder);reminder.hidden=true;
    form.querySelectorAll('[name="payment"]').forEach(radio=>radio.addEventListener('change',()=>{reminder.hidden=radio.value!=='GCash'||!radio.checked}));
  }
  document.addEventListener('click',event=>{const add=event.target.closest('.drawer-add'),checkout=event.target.closest('#storeCheckout,.drawer-checkout');if((add||checkout)&&!scheduleOpen()){event.preventDefault();event.stopImmediatePropagation();alert('No online order slots available for today. Please choose checkout when seller opens more slots.')}} ,true);
  document.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('.checkout-card')||form.querySelector('.order-success'))return;
    const date=form.elements.pickupDate?.value||today(),slot=form.elements.pickupSlot?.value,slotLabel=form.querySelector('[name="pickupSlot"]:checked')?.dataset.label||slot;
    if(!slot){event.preventDefault();event.stopImmediatePropagation();alert('Please choose an available pickup/order time.');return}
    const match=availableSlots(date).find(item=>item.start===slot);if(!match||!match.available){event.preventDefault();event.stopImmediatePropagation();alert('That slot is already full. Please choose another time.');return}
    localStorage.setItem('vslPendingPickupSlot',JSON.stringify({date,slot,label:slotLabel}));
    setTimeout(()=>{const orders=read('vslOrders',[]),pending=read('vslPendingPickupSlot',null),target=orders.filter(order=>viewer&&order.customerEmail===viewer.email&&!order.pickupSlot).at(-1);if(target&&pending){target.pickupDate=pending.date;target.pickupSlot=pending.slot;target.pickupSlotLabel=pending.label;target.scheduleSnapshot={date:pending.date,slot:pending.slot,label:pending.label};write('vslOrders',orders);localStorage.removeItem('vslPendingPickupSlot')}},120);
  },true);
  new MutationObserver(()=>{renderVideoNotice();enforceDrawer();document.querySelectorAll('.checkout-modal').forEach(injectCheckoutDetails)}).observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{renderVideoNotice();enforceDrawer();document.querySelectorAll('.checkout-modal').forEach(injectCheckoutDetails)},500);
  renderVideoNotice();enforceDrawer();
})();
