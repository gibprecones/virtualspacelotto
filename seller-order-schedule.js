(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-order-schedule.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const defaults={openTime:'08:00',closeTime:'17:00',acceptStart:'09:00',ordersPerHour:5};
  const toLabel=time=>{const [hour,minute]=String(time||'00:00').split(':').map(Number),date=new Date();date.setHours(hour||0,minute||0,0,0);return date.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})};
  function settings(){return {...defaults,...read('vslOrderSchedule',{})}}
  function save(panel){
    const next={
      openTime:panel.querySelector('#storeOpenTime')?.value||defaults.openTime,
      closeTime:panel.querySelector('#storeCloseTime')?.value||defaults.closeTime,
      acceptStart:panel.querySelector('#orderAcceptStart')?.value||defaults.acceptStart,
      ordersPerHour:Math.max(1,Math.floor(Number(panel.querySelector('#ordersPerHour')?.value)||defaults.ordersPerHour)),
      updatedAt:Date.now(),
      updatedBy:'Store Owner'
    };
    if(next.acceptStart<next.openTime)next.acceptStart=next.openTime;
    if(next.acceptStart>next.closeTime)next.acceptStart=next.closeTime;
    write('vslOrderSchedule',next);
    const status=panel.querySelector('.schedule-save-status');
    if(status){status.textContent='Saved. Buyers will only see available pickup/order times.';setTimeout(()=>status.textContent='',3000)}
    renderVisibility();
  }
  function enhanceSettings(){
    const panel=document.querySelector('.commerce-settings');
    if(!panel||panel.querySelector('.order-schedule-settings'))return;
    const data=settings();
    const block=document.createElement('div');
    block.className='order-schedule-settings';
    block.innerHTML='<div><b>Store order schedule</b><p>Control when buyers can add to cart, checkout, and choose pickup/order time.</p></div><div class="schedule-grid"><label>Store opens<input id="storeOpenTime" type="time" value="'+data.openTime+'"></label><label>Store closes<input id="storeCloseTime" type="time" value="'+data.closeTime+'"></label><label>Accept orders from<input id="orderAcceptStart" type="time" value="'+data.acceptStart+'"></label><label>Orders per hour<input id="ordersPerHour" type="number" min="1" step="1" value="'+data.ordersPerHour+'"></label></div><button type="button" class="save-order-schedule">Save order schedule</button><span class="schedule-save-status"></span>';
    panel.append(block);
    block.querySelector('.save-order-schedule').addEventListener('click',()=>save(block));
  }
  function renderVisibility(){
    const camera=document.querySelector('.camera,.video');
    if(!camera)return;
    let badge=camera.querySelector('.seller-order-window-badge');
    if(!badge){badge=document.createElement('div');badge.className='seller-order-window-badge';camera.append(badge)}
    const data=settings();
    badge.innerHTML='<b>Online orders</b><span>'+toLabel(data.acceptStart)+' - '+toLabel(data.closeTime)+'</span><small>'+data.ordersPerHour+' orders/hour</small>';
  }
  setInterval(()=>{enhanceSettings();renderVisibility()},600);
  enhanceSettings();renderVisibility();
})();
