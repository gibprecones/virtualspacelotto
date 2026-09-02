(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-order-schedule.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const pad=value=>String(value).padStart(2,'0');
  const today=()=>{const date=new Date();return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())};
  const toLabel=time=>{const [hour,minute]=String(time||'00:00').split(':').map(Number),date=new Date();date.setHours(hour||0,minute||0,0,0);return date.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})};
  const addHour=time=>{const [hour,minute]=String(time).split(':').map(Number);return pad(Math.min(23,(hour||0)+1))+':'+pad(minute||0)};
  function legacySlots(){
    const legacy=read('vslOrderSchedule',{}),start=legacy.acceptStart||'08:00',end=legacy.closeTime||'17:00',capacity=Number(legacy.ordersPerHour)||10,slots=[];
    for(let hour=Number(start.slice(0,2));hour<Number(end.slice(0,2));hour+=1){const value=pad(hour)+':00';slots.push({id:'slot-'+value,start:value,end:addHour(value),capacity})}
    return slots;
  }
  function allSchedules(){return read('vslAppointmentSchedules',{})}
  function dateSlots(date){const all=allSchedules();return all[date]||legacySlots()}
  function saveDateSlots(date,slots){const all=allSchedules();all[date]=slots;write('vslAppointmentSchedules',all);const first=slots[0],last=slots[slots.length-1];if(first&&last)write('vslOrderSchedule',{acceptStart:first.start,closeTime:last.end,ordersPerHour:Number(first.capacity)||10,updatedAt:Date.now(),appointmentMode:true});}
  function renderSlots(block,date){
    const list=block.querySelector('.appointment-slot-list'),slots=dateSlots(date);
    list.innerHTML=slots.map((slot,index)=>'<article class="appointment-slot-row" data-index="'+index+'"><div><b>'+toLabel(slot.start)+' - '+toLabel(slot.end)+'</b><small>'+date+'</small></div><label>Slots<input type="number" min="1" step="1" value="'+(slot.capacity||10)+'"></label><button type="button" class="remove-slot">Remove</button></article>').join('')||'<p class="schedule-empty">No slots yet. Add a time slot for this date.</p>';
    list.querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{const row=input.closest('.appointment-slot-row'),next=dateSlots(date);next[Number(row.dataset.index)].capacity=Math.max(1,Math.floor(Number(input.value)||1));saveDateSlots(date,next);renderSlots(block,date)}));
    list.querySelectorAll('.remove-slot').forEach(button=>button.addEventListener('click',()=>{const row=button.closest('.appointment-slot-row'),next=dateSlots(date);next.splice(Number(row.dataset.index),1);saveDateSlots(date,next);renderSlots(block,date)}));
  }
  function enhanceSettings(){
    const panel=document.querySelector('.commerce-settings');
    if(!panel||panel.querySelector('.order-schedule-settings'))return;
    const selected=today();
    const block=document.createElement('div');
    block.className='order-schedule-settings appointment-scheduler';
    block.innerHTML='<div class="appointment-head"><div><b>Online order appointment schedule</b><p>Select a date, then set available pickup/order hours and slots for that date.</p></div><label>Calendar date<input id="appointmentDate" type="date" value="'+selected+'"></label></div><div class="appointment-builder"><label>Start time<input id="slotStart" type="time" value="08:00"></label><label>End time<input id="slotEnd" type="time" value="09:00"></label><label>Slots for this hour<input id="slotCapacity" type="number" min="1" step="1" value="10"></label><button type="button" class="add-appointment-slot">Add time slot</button></div><div class="appointment-slot-list"></div><span class="schedule-save-status"></span>';
    panel.append(block);
    const dateInput=block.querySelector('#appointmentDate');
    dateInput.addEventListener('change',()=>renderSlots(block,dateInput.value||today()));
    block.querySelector('#slotStart').addEventListener('change',()=>{block.querySelector('#slotEnd').value=addHour(block.querySelector('#slotStart').value)});
    block.querySelector('.add-appointment-slot').addEventListener('click',()=>{
      const date=dateInput.value||today(),start=block.querySelector('#slotStart').value||'08:00',end=block.querySelector('#slotEnd').value||addHour(start),capacity=Math.max(1,Math.floor(Number(block.querySelector('#slotCapacity').value)||10));
      const next=dateSlots(date).filter(slot=>slot.start!==start);
      next.push({id:'slot-'+date+'-'+start,start,end,capacity});next.sort((a,b)=>a.start.localeCompare(b.start));saveDateSlots(date,next);renderSlots(block,date);
      const status=block.querySelector('.schedule-save-status');status.textContent='Saved '+toLabel(start)+' - '+toLabel(end)+' with '+capacity+' slots.';setTimeout(()=>status.textContent='',2500);
    });
    renderSlots(block,selected);
  }
  function renderVisibility(){document.querySelectorAll('.seller-order-window-badge').forEach(node=>node.remove())}
  setInterval(()=>{enhanceSettings();renderVisibility()},600);
  enhanceSettings();renderVisibility();
})();
