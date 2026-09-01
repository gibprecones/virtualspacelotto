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

(()=>{
  const normalize=value=>String(value||'').trim().toLowerCase();
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  function allProducts(){
    const base=[{id:'p1',name:'Lotto Thermal Paper',category:'General'},{id:'p2',name:'Seller Cap',category:'General'},{id:'p3',name:'Promo Poster Set',category:'General'}];
    const saved=read('vslSellerProducts',[]);
    const edits=read('vslSellerProductEdits',{});
    return [...base,...saved].map(product=>Object.assign({},product,edits[product.id]||{}));
  }
  function stabilizeCategoryFilter(){
    const panel=document.querySelector('.product-panel'),select=panel?.querySelector('.catalog-filter select');
    if(!panel||!select)return;
    const products=allProducts();
    panel.querySelectorAll('.product-card').forEach(card=>{
      const title=normalize(card.querySelector('h3')?.childNodes?.[0]?.textContent||card.querySelector('h3')?.textContent);
      const product=products.find(item=>normalize(item.name)===title);
      card.dataset.category=product?.category||'General';
    });
    if(!select.dataset.categoryStable){
      select.dataset.categoryStable='1';
      select.addEventListener('change',()=>setTimeout(stabilizeCategoryFilter,0));
    }
    const selected=select.value||'ALL';
    panel.querySelectorAll('.product-card').forEach(card=>{
      const visible=selected==='ALL'||normalize(card.dataset.category)===normalize(selected);
      card.hidden=!visible;
    });
    const shown=panel.querySelector('.shown-count')||[...panel.querySelectorAll('span')].find(node=>/shown/i.test(node.textContent));
    if(shown){
      const count=[...panel.querySelectorAll('.product-card')].filter(card=>!card.hidden).length;
      shown.textContent=count+' / '+panel.querySelectorAll('.product-card').length+' shown';
    }
  }
  setInterval(stabilizeCategoryFilter,350);
  stabilizeCategoryFilter();
})();
