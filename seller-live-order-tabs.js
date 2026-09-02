(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-live-order-tabs.css';document.head.append(css);
  function setupTabs(){
    const orders=document.querySelector('.seller-orders'),schedule=document.querySelector('.order-schedule-settings');
    if(!orders)return;
    document.querySelectorAll('.seller-order-window-badge').forEach(node=>node.remove());
    if(!orders.querySelector('.seller-order-tabs')){
      const tabs=document.createElement('div');
      tabs.className='seller-order-tabs';
      tabs.innerHTML='<button type="button" class="active" data-tab="orders">Live orders</button><button type="button" data-tab="schedule">Online order schedule</button>';
      orders.querySelector('h2')?.after(tabs);
      tabs.addEventListener('click',event=>{
        const button=event.target.closest('button');if(!button)return;
        tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));
        orders.classList.toggle('show-schedule',button.dataset.tab==='schedule');
      });
    }
    if(schedule&&schedule.parentElement!==orders){
      schedule.classList.add('order-schedule-tab-panel');
      orders.append(schedule);
    }
  }
  function addReplacementSearch(){
    document.querySelectorAll('.ops-modal').forEach(modal=>{
      const productGrid=modal.querySelector('.product-choice-grid');
      if(!productGrid||modal.querySelector('.replacement-search'))return;
      const search=document.createElement('input');
      search.className='replacement-search';
      search.type='search';
      search.placeholder='Search replacement item...';
      productGrid.before(search);
      search.addEventListener('input',()=>{
        const q=search.value.trim().toLowerCase();
        productGrid.querySelectorAll('.product-choice').forEach(choice=>{choice.hidden=q&&!choice.textContent.toLowerCase().includes(q)});
      });
    });
  }
  function cleanup(){document.getElementById('markCompletedShortcut')?.remove();document.querySelectorAll('.seller-order-list select option').forEach(option=>{if(option.value==='Completed'||option.textContent.includes('Completed'))option.remove()})}
  setInterval(()=>{setupTabs();addReplacementSearch();cleanup()},300);
  setupTabs();cleanup();
})();
