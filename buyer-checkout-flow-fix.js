(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const money=value=>'₱'+Number(value||0).toFixed(2);
  const currentCart=()=>{try{return Array.isArray(cart)?cart:read('vslStoreCart',[])}catch{return read('vslStoreCart',[])}};
  const saveCart=items=>{try{cart=items}catch{};write('vslStoreCart',items)};
  function groupedCart(){
    const grouped=new Map();
    currentCart().forEach(item=>{const existing=grouped.get(item.id)||Object.assign({},item,{quantity:0});existing.quantity+=1;grouped.set(item.id,existing)});
    return [...grouped.values()];
  }
  function closeShopDrawer(){document.querySelectorAll('.commerce-drawer.open,.customer-drawer').forEach(drawer=>drawer.remove?.()||drawer.classList.remove('open'))}
  function rebuildCheckout(){
    const modal=document.querySelector('.checkout-modal');
    modal?.remove();
    closeShopDrawer();
    setTimeout(()=>document.querySelector('#storeCheckout')?.click(),0);
  }
  function removeProduct(productId){
    const updated=currentCart().filter(item=>String(item.id)!==String(productId));
    saveCart(updated);
    if(!updated.length){document.querySelector('.checkout-modal')?.remove();document.querySelector('.live-cart-button')?.click();return}
    rebuildCheckout();
  }
  function setQuantity(productId,nextQuantity){
    const items=currentCart();
    const sample=items.find(item=>String(item.id)===String(productId));
    if(!sample)return;
    const without=items.filter(item=>String(item.id)!==String(productId));
    for(let index=0;index<Math.max(0,nextQuantity);index+=1)without.push(sample);
    saveCart(without);
    if(!without.length){document.querySelector('.checkout-modal')?.remove();document.querySelector('.live-cart-button')?.click();return}
    rebuildCheckout();
  }
  function checkoutItemsMarkup(items){
    return items.map(item=>'<div class="checkout-review-line" data-product-id="'+item.id+'"><div><b>'+item.name+'</b><small>'+money(item.price)+' each</small></div><div class="checkout-review-controls"><button type="button" data-action="minus">−</button><span>'+item.quantity+'</span><button type="button" data-action="plus">+</button><strong>'+money(item.price*item.quantity)+'</strong><button type="button" class="checkout-remove" data-action="remove">Remove</button></div></div>').join('');
  }
  function enhanceCheckout(modal){
    if(!modal||modal.dataset.checkoutFixed==='1')return;
    const card=modal.querySelector('.checkout-card');
    const summary=modal.querySelector('.checkout-summary');
    if(!card||!summary||card.querySelector('.order-success'))return;
    closeShopDrawer();
    modal.dataset.checkoutFixed='1';
    const settings=read('vslCheckoutSettings',{discount:0});
    const items=groupedCart();
    const subtotal=items.reduce((sum,item)=>sum+Number(item.price||0)*Number(item.quantity||0),0);
    const discount=subtotal*(Number(settings.discount)||0)/100;
    const total=subtotal-discount;
    summary.innerHTML='<div class="checkout-review-note"><b>Check your order details</b><span>You can remove products or adjust quantity before confirming.</span></div>'+checkoutItemsMarkup(items)+'<div class="checkout-row"><span>Subtotal</span><b>'+money(subtotal)+'</b></div><div class="checkout-row discount"><span>Discount ('+(Number(settings.discount)||0)+'%)</span><b>− '+money(discount)+'</b></div><div class="checkout-row total"><span>Total</span><b>'+money(total)+'</b></div>';
  }
  document.addEventListener('click',event=>{
    const checkoutButton=event.target.closest('#storeCheckout,.drawer-checkout');
    if(checkoutButton)setTimeout(closeShopDrawer,0);
    const control=event.target.closest('.checkout-review-controls button');
    if(!control)return;
    event.preventDefault();
    event.stopPropagation();
    const line=control.closest('.checkout-review-line'),productId=line?.dataset.productId;
    const current=Number(line?.querySelector('.checkout-review-controls span')?.textContent||1);
    if(!productId)return;
    if(control.dataset.action==='remove')removeProduct(productId);
    if(control.dataset.action==='minus')setQuantity(productId,current-1);
    if(control.dataset.action==='plus')setQuantity(productId,current+1);
  },true);
  new MutationObserver(()=>document.querySelectorAll('.checkout-modal').forEach(enhanceCheckout)).observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll('.checkout-modal').forEach(enhanceCheckout);
})();
