(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-dashboard-organization-fix.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const money=value=>'₱'+Number(value||0).toFixed(2);
  function productList(){try{return Array.isArray(products)?products:[]}catch{return[]}}
  function settingPanels(){return [...document.querySelectorAll('.commerce-settings,.seller-access-login,.security-staff-panel,#moderation')].filter(Boolean)}
  function organizeSettingsTabs(){
    const panels=settingPanels();if(!panels.length)return;
    let shell=document.querySelector('.settings-security-tabs-shell');
    if(!shell){
      shell=document.createElement('section');shell.className='seller-ops-panel settings-security-tabs-shell';shell.id='settings-security';
      shell.innerHTML='<div class="seller-ops-header"><div><p class="eyebrow">SETTINGS / SECURITY</p><h2>Manage store controls</h2></div></div><div class="settings-security-tabs"><button class="active" data-tab="checkout">Checkout settings</button><button data-tab="login">Seller user login</button><button data-tab="staff">Staff access</button><button data-tab="banned">Banned / Suspended users</button></div><div class="settings-security-tab-content"></div>';
      const first=panels[0];first.before(shell);
      shell.querySelector('.settings-security-tabs').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;shell.querySelectorAll('.settings-security-tabs button').forEach(item=>item.classList.toggle('active',item===button));showTab(button.dataset.tab)});
    }
    const content=shell.querySelector('.settings-security-tab-content');
    const map=[['checkout','.commerce-settings'],['login','.seller-access-login'],['staff','.security-staff-panel'],['banned','#moderation']];
    map.forEach(([tab,selector])=>document.querySelectorAll(selector).forEach(panel=>{panel.dataset.settingsTab=tab;if(panel.parentElement!==content)content.append(panel)}));
    showTab(shell.querySelector('.settings-security-tabs button.active')?.dataset.tab||'checkout');
  }
  function showTab(tab){document.querySelectorAll('[data-settings-tab]').forEach(panel=>panel.hidden=panel.dataset.settingsTab!==tab)}
  function soldStats(){const sold={};read('vslOrders',[]).filter(order=>order.paymentStatus==='PAID'||order.status==='Completed').forEach(order=>(order.items||[]).forEach(item=>{sold[item.id]=sold[item.id]||{id:item.id,name:item.name,qty:0,total:0};sold[item.id].qty+=Number(item.quantity||1);sold[item.id].total+=Number(item.price||0)*Number(item.quantity||1)}));return sold}
  function inventoryDetails(){
    const inventory=read('vslInventory',{}),sold=soldStats();
    const rows=productList().map(product=>({id:product.id,name:product.name,qty:Number(inventory[product.id]??20),sold:sold[product.id]?.qty||0,total:sold[product.id]?.total||0}));
    const low=rows.filter(item=>item.qty>0&&item.qty<=5).sort((a,b)=>a.qty-b.qty);
    const out=rows.filter(item=>item.qty<=0).sort((a,b)=>a.name.localeCompare(b.name));
    const fast=rows.filter(item=>item.sold>0).sort((a,b)=>b.sold-a.sold).slice(0,5);
    return {low,out,fast};
  }
  function renderInventorySummary(){
    const card=document.querySelector('.inventory-summary-card');if(!card)return;
    const {low,out,fast}=inventoryDetails();
    const lowCount=document.getElementById('inventoryLowCount'),outCount=document.getElementById('inventoryOutCount'),fastCount=document.getElementById('inventoryFastCount');
    if(lowCount)lowCount.textContent=low.length;if(outCount)outCount.textContent=out.length;if(fastCount)fastCount.textContent=fast.length;
    let details=card.querySelector('.inventory-detail-lists');
    if(!details){details=document.createElement('div');details.className='inventory-detail-lists';card.append(details)}
    const list=(title,items,empty,render)=>'<article><b>'+title+'</b>'+(items.length?items.map(render).join(''):'<p>'+empty+'</p>')+'</article>';
    details.innerHTML=list('Low stock items',low,'No low stock items.',item=>'<p><span>'+item.name+'</span><strong>'+item.qty+' left</strong></p>')+list('Out of stock',out,'No out of stock items.',item=>'<p><span>'+item.name+'</span><strong>0 left</strong></p>')+list('Fast moving',fast,'No paid sales yet.',item=>'<p><span>'+item.name+'</span><strong>'+item.sold+' sold</strong></p>');
  }
  function fixFeatureProductSearch(){
    const panel=document.querySelector('.product-panel');if(!panel)return;
    const toolbar=panel.querySelector('.catalog-toolbar');if(!toolbar)return;
    let input=toolbar.querySelector('.product-search');
    if(!input){input=document.createElement('input');input.className='product-search';input.type='search';input.placeholder='Search products...';toolbar.prepend(input)}
    const category=panel.querySelector('.catalog-filter select')?.value||'ALL',query=input.value.trim().toLowerCase();
    let visible=0,total=0;
    panel.querySelectorAll('.product-card').forEach((card,index)=>{
      const product=productList()[index];if(!product)return;total++;
      const cardCategory=(product.category||card.querySelector('.product-category')?.textContent||'General').trim();
      const haystack=[product.name,product.price,cardCategory,card.textContent].join(' ').toLowerCase();
      const show=(category==='ALL'||cardCategory===category)&&(!query||haystack.includes(query));
      card.hidden=!show;if(show)visible++;
    });
    let count=toolbar.querySelector('.product-search-count');if(!count){count=document.createElement('span');count.className='product-search-count';toolbar.append(count)}
    count.textContent=visible+' / '+total+' shown';
  }
  document.addEventListener('input',event=>{if(event.target.matches('.product-search'))fixFeatureProductSearch()},true);
  document.addEventListener('change',event=>{if(event.target.matches('.catalog-filter select'))setTimeout(fixFeatureProductSearch,0)},true);
  setInterval(()=>{organizeSettingsTabs();renderInventorySummary();fixFeatureProductSearch()},500);
  organizeSettingsTabs();renderInventorySummary();fixFeatureProductSearch();
})();

(()=>{
  function activeTab(){return document.querySelector('.settings-security-tabs button.active')?.dataset.tab||'checkout'}
  function shellContent(){return document.querySelector('.settings-security-tab-content')}
  function forceSettingsIsolation(){
    const content=shellContent();if(!content)return;
    const tab=activeTab();
    const panels=[['checkout','.commerce-settings'],['login','.seller-access-login'],['staff','.security-staff-panel'],['banned','#moderation']];
    panels.forEach(([name,selector])=>{
      document.querySelectorAll(selector).forEach(panel=>{
        panel.dataset.settingsTab=name;
        if(panel.parentElement!==content)content.append(panel);
        panel.hidden=name!==tab;
        panel.classList.toggle('active-settings-tab-panel',name===tab);
      });
    });
    document.querySelectorAll('#activity-history #moderation,.seller-activity #moderation,.commerce-settings #moderation,.seller-access-login #moderation,.security-staff-panel #moderation').forEach(panel=>content.append(panel));
  }
  document.addEventListener('click',event=>{if(event.target.closest('.settings-security-tabs button'))setTimeout(forceSettingsIsolation,0)},true);
  setInterval(forceSettingsIsolation,150);
  forceSettingsIsolation();
})();
