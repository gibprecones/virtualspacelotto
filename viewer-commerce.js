(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='commerce.css';document.head.append(css);
  const drawerCss=document.createElement('link');drawerCss.rel='stylesheet';drawerCss.href='tiktok-shop-drawer.css';document.head.append(drawerCss);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const money=value=>'₱'+Number(value||0).toFixed(2);
  function orderAcceptance(){return read('vslOrderAcceptance',{enabled:true,updatedAt:Date.now(),updatedBy:'Store Owner'})}
  function cartTotal(){return groupedCart().reduce((sum,item)=>sum+Number(item.price)*item.quantity,0)}

  function featuredItems(){
    const featured=read('vslFeaturedProducts',[]);
    return products.filter(product=>featured.includes(product.id));
  }
  function groupedCart(){
    const map=new Map;
    cart.forEach(item=>{const current=map.get(item.id)||{...item,quantity:0};current.quantity++;map.set(item.id,current)});
    return[...map.values()];
  }
  function viewerKey(){return viewer?.email||'guest'}
  function favoriteList(){return read('vslFavorites:'+viewerKey(),[])}
  function toggleFavorite(product){
    if(!viewer){showSignup();return}
    let list=read('vslFavorites:'+viewer.email,[]);
    list=list.includes(product.id)?list.filter(id=>id!==product.id):[...list,product.id];
    write('vslFavorites:'+viewer.email,list);
    renderCommerceDrawer(true);
  }
  function addProduct(product){
    cart.push(product);
    write('vslStoreCart',cart);
    renderCommerceDrawer(true);
  }
  function setQuantity(product,quantity){
    const next=[];
    cart.forEach(item=>{if(item.id!==product.id)next.push(item)});
    for(let i=0;i<quantity;i++)next.push(product);
    cart=next;
    write('vslStoreCart',cart);
    renderCommerceDrawer(true);
  }
  function cartButton(){
    const video=document.querySelector('.video');if(!video)return;
    video.querySelector('.live-shop-tray')?.remove();
    let button=video.querySelector('.live-cart-button');
    if(!button){button=document.createElement('button');button.className='live-cart-button';button.type='button';button.onclick=()=>renderCommerceDrawer(true);video.append(button)}
    button.innerHTML='<span>🛒</span><b>Shop</b><small>'+cart.length+'</small><em>'+money(cartTotal())+'</em>';
  }
  function renderCommerceDrawer(open=false){
    cartButton();
    let drawer=document.querySelector('.commerce-drawer');
    if(!drawer){drawer=document.createElement('aside');drawer.className='commerce-drawer';document.body.append(drawer)}
    drawer.classList.toggle('open',open);
    const inventory=read('vslInventory',{}),items=featuredItems(),grouped=groupedCart(),subtotal=grouped.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0);
    drawer.innerHTML='<div class="commerce-drawer-head"><div><p class="eyebrow">LIVE STORE</p><h2>Products</h2></div><button class="drawer-close" type="button">×</button></div><div class="drawer-product-list"></div><div class="drawer-cart-box"><h3>Cart ('+cart.length+')</h3><div class="drawer-cart-lines"></div><p class="drawer-subtotal"><span>Subtotal</span><b>'+money(subtotal)+'</b></p><button id="storeCheckout" type="button">View cart & checkout</button></div>';
    drawer.querySelector('.drawer-close').onclick=()=>drawer.classList.remove('open');
    const list=drawer.querySelector('.drawer-product-list');
    list.innerHTML=items.length?'':'<p class="drawer-empty">No featured products yet.</p>';
    items.forEach(product=>{
      const stock=Number(inventory[product.id]||0),line=document.createElement('article');
      const saved=favoriteList().includes(product.id);
      line.className='drawer-product'+(stock<=0?' sold-out':'');
      line.innerHTML=(product.photo?'<img src="'+product.photo+'" alt="">':'<span class="drawer-icon">'+product.icon+'</span>')+'<div><b>'+product.name+'</b><small>'+money(product.price)+' · '+(stock>0?stock+' available':'Sold out')+'</small></div><div class="drawer-product-actions"><button class="drawer-add" type="button" '+(stock<=0?'disabled':'')+'>'+(stock>0?'Add':'Sold out')+'</button><button class="drawer-fave '+(saved?'active':'')+'" type="button">'+(saved?'♥':'♡')+'</button></div>';
      line.querySelector('.drawer-add').onclick=()=>addProduct(product);
      line.querySelector('.drawer-fave').onclick=()=>toggleFavorite(product);
      list.append(line);
    });
    const lines=drawer.querySelector('.drawer-cart-lines');
    lines.innerHTML=grouped.length?'':'<p class="drawer-empty">Cart is empty.</p>';
    grouped.forEach(item=>{
      const product=products.find(product=>product.id===item.id)||item,line=document.createElement('div');
      line.className='drawer-cart-line';
      line.innerHTML='<span>'+item.name+'</span><div class="drawer-qty"><button type="button">−</button><b>'+item.quantity+'</b><button type="button">+</button></div><strong>'+money(item.price*item.quantity)+'</strong>';
      const buttons=line.querySelectorAll('button');
      buttons[0].onclick=()=>setQuantity(product,Math.max(0,item.quantity-1));
      buttons[1].onclick=()=>setQuantity(product,item.quantity+1);
      lines.append(line);
    });
    bindCheckout();
  }
  function checkout(){
    if(!viewer){showSignup();return}
    const gate=orderAcceptance();
    if(!gate.enabled){alert('Online orders are currently offline. Please wait for the seller to reopen ordering.');return}
    const items=groupedCart();
    if(!items.length){alert('Your cart is empty.');return}
    const settings=read('vslCheckoutSettings',{cash:true,gcash:true,discount:0});
    if(!settings.cash&&!settings.gcash){alert('The seller has not enabled a payment method yet.');return}
    const subtotal=items.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0),discount=subtotal*(Number(settings.discount)||0)/100,total=subtotal-discount,modal=document.createElement('div');
    modal.className='checkout-modal';
    modal.innerHTML='<form class="checkout-card"><button type="button" class="close-checkout">×</button><p class="eyebrow">CHECKOUT</p><h2>Review your order</h2><div class="checkout-summary">'+items.map(item=>'<div class="checkout-row"><span>'+item.name+' × '+item.quantity+'</span><b>'+money(item.price*item.quantity)+'</b></div>').join('')+'<div class="checkout-row"><span>Subtotal</span><b>'+money(subtotal)+'</b></div><div class="checkout-row discount"><span>Discount ('+settings.discount+'%)</span><b>− '+money(discount)+'</b></div><div class="checkout-row total"><span>Total</span><b>'+money(total)+'</b></div></div><div class="checkout-group"><b>Payment method</b><div class="choice-row">'+(settings.cash?'<label><input required type="radio" name="payment" value="Cash"> Cash</label>':'')+(settings.gcash?'<label><input required type="radio" name="payment" value="GCash"> GCash</label>':'')+'</div></div><div class="checkout-group"><b>Receive order</b><div class="choice-row"><label><input required type="radio" name="fulfillment" value="Store pickup"> Store pickup</label><label><input required type="radio" name="fulfillment" value="Delivery"> Delivery</label></div></div><button class="place-order">Place order</button></form>';
    document.body.append(modal);
    modal.querySelector('.close-checkout').onclick=()=>modal.remove();
    modal.querySelector('form').onsubmit=event=>{
      event.preventDefault();
      const transaction='VSL-'+new Date().toISOString().slice(2,10).replaceAll('-','')+'-'+Math.floor(100000+Math.random()*900000),order={id:'order-'+Date.now(),transaction,customerEmail:viewer.email,customerName:viewer.name,items,subtotal,discount,total,payment:new FormData(event.target).get('payment'),fulfillment:new FormData(event.target).get('fulfillment'),status:'Confirming order',createdAt:Date.now(),updatedAt:Date.now()};
      const orders=read('vslOrders',[]);orders.push(order);write('vslOrders',orders);
      cart=[];write('vslStoreCart',cart);
      document.querySelector('.commerce-drawer')?.classList.remove('open');
      modal.querySelector('.checkout-card').innerHTML='<div class="order-success"><p class="eyebrow">ORDER RECEIVED</p><h2>Show this code at the store</h2><div class="transaction-code">'+transaction+'</div><p>Your order is now being confirmed. Track its status in My Orders.</p><button type="button" class="place-order">View my orders</button></div>';
      modal.querySelector('button').onclick=()=>{modal.remove();document.querySelector('.customer-orders')?.scrollIntoView({behavior:'smooth'})};
      renderCommerceDrawer(false);renderStore();renderOrders();
    };
  }
  function steps(status){const list=['Confirming order','Preparing order','Ready for pickup','Completed'],delivery=['Confirming order','Preparing order','Out for delivery','Completed'],sequence=status==='Out for delivery'?delivery:list,index=Math.max(0,sequence.indexOf(status));return sequence.map((step,i)=>'<span class="'+(i<=index?'done':'')+'" title="'+step+'"></span>').join('')}
  function cancelOrder(id){const orders=read('vslOrders',[]),order=orders.find(item=>item.id===id);if(!order||order.status!=='Confirming order')return;const inventory=read('vslInventory',{});order.items.forEach(item=>inventory[item.id]=(inventory[item.id]||0)+(item.quantity||1));order.status='Cancelled';order.stockRestored=true;order.updatedAt=Date.now();write('vslInventory',inventory);write('vslOrders',orders);renderOrders()}
  function renderOrders(){let panel=document.querySelector('.customer-orders');if(!panel){panel=document.createElement('section');panel.className='customer-orders';panel.innerHTML='<p class="eyebrow">CUSTOMER ACCOUNT</p><h2>My Orders</h2><div class="customer-order-list"></div>';document.body.append(panel)}const list=panel.querySelector('.customer-order-list'),orders=read('vslOrders',[]).filter(order=>viewer&&order.customerEmail===viewer.email).reverse();list.innerHTML=orders.length?'':'<p>No orders yet.</p>';orders.forEach(order=>{const card=document.createElement('article');card.className='order-card';card.innerHTML='<div class="order-head"><b>'+order.transaction+'</b><small>'+new Date(order.createdAt).toLocaleString()+'</small></div><span class="order-status">'+order.status+'</span><div class="status-track">'+steps(order.status)+'</div><p>'+order.fulfillment+' · '+order.payment+' · <b>'+money(order.total)+'</b></p><small>'+order.items.map(item=>item.name+' × '+item.quantity).join(', ')+'</small>'+(order.status==='Confirming order'?'<div class="order-actions"><button class="cancel-order">Cancel order</button></div>':'');card.querySelector('.cancel-order')?.addEventListener('click',()=>cancelOrder(order.id));list.append(card)})}
  function bindCheckout(){const button=document.querySelector('#storeCheckout');if(!button)return;button.disabled=!orderAcceptance().enabled;if(!button.dataset.commerce){button.dataset.commerce='1';button.onclick=checkout}button.textContent=orderAcceptance().enabled?'View cart & checkout':'Online orders are offline'}
  setInterval(()=>{cartButton();bindCheckout();renderOrders()},1000);
  cartButton();renderCommerceDrawer(false);bindCheckout();renderOrders();
})();

(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const money=value=>'₱'+Number(value||0).toFixed(2);
  function availableProducts(){
    const base=[{id:'p1',name:'Lotto Thermal Paper',price:85,icon:'🧾'},{id:'p2',name:'Seller Cap',price:250,icon:'🧢️'},{id:'p3',name:'Promo Poster Set',price:150,icon:'🖼️'}];
    const saved=read('vslSellerProducts',[]),edits=read('vslSellerProductEdits',{});
    return [...base,...saved].map(product=>Object.assign({},product,edits[product.id]||{}));
  }
  function featuredProducts(){
    const products=availableProducts(),featured=read('vslFeaturedProducts',[]),pinned=localStorage.getItem('vslPinnedProduct');
    const ids=featured.length?featured:(pinned?[pinned]:[]);
    return products.filter(product=>ids.includes(product.id));
  }
  function addFeaturedOverlay(){
    const video=document.querySelector('.video');
    if(!video)return;
    let tray=video.querySelector('.viewer-featured-products');
    const items=featuredProducts();
    if(!items.length){tray?.remove();return}
    if(!tray){tray=document.createElement('div');tray.className='viewer-featured-products';video.append(tray)}
    tray.innerHTML=items.slice(0,3).map(product=>'<button type="button" class="viewer-featured-card" data-product="'+product.id+'">'+(product.photo?'<img src="'+product.photo+'" alt="">':'<span>'+product.icon+'</span>')+'<b>'+product.name+'</b><strong>'+money(product.price)+'</strong></button>').join('');
    tray.querySelectorAll('button').forEach(button=>{
      button.onclick=()=>{
        const product=availableProducts().find(item=>item.id===button.dataset.product);
        if(!product)return;
        window.cart=window.cart||cart;
        cart.push(product);
        localStorage.setItem('vslStoreCart',JSON.stringify(cart));
        document.querySelector('.live-cart-button')?.click();
      };
    });
  }
  setInterval(addFeaturedOverlay,800);
  addFeaturedOverlay();
})();
