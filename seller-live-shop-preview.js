(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='tiktok-shop-drawer.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const money=value=>'₱'+Number(value||0).toFixed(2);
  function productList(){return typeof products!=='undefined'&&Array.isArray(products)?products:[]}
  function storedFeatured(){
    const saved=read('vslFeaturedProducts',[]);
    if(saved.length)return saved;
    const checked=[...document.querySelectorAll('.product-panel .product-card .feature-select:checked')].map(box=>box.dataset.productId).filter(Boolean);
    if(checked.length)write('vslFeaturedProducts',checked);
    return checked;
  }
  function syncFeatureBoxes(){
    const saved=new Set(read('vslFeaturedProducts',[]));
    document.querySelectorAll('.product-panel .product-card').forEach((card,index)=>{
      const product=productList()[index];if(!product)return;
      let box=card.querySelector('.feature-select');
      if(!box){
        box=document.createElement('input');
        box.type='checkbox';
        box.className='feature-select';
        box.title='Feature this product on live shop';
        card.prepend(box);
      }
      box.dataset.productId=product.id;
      box.checked=saved.has(product.id);
      if(!box.dataset.shopSync){
        box.dataset.shopSync='1';
        box.addEventListener('change',()=>{
          const current=new Set(read('vslFeaturedProducts',[]));
          if(box.checked)current.add(product.id);else current.delete(product.id);
          write('vslFeaturedProducts',[...current]);
          button();
          drawer(document.querySelector('.seller-commerce-preview')?.classList.contains('open'));
        });
      }
    });
  }
  function items(){
    const featured=storedFeatured();
    return productList().filter(product=>featured.includes(product.id));
  }
  function button(){
    const camera=document.querySelector('.camera');if(!camera)return;
    syncFeatureBoxes();
    camera.querySelector('.live-featured-tray')?.remove();
    camera.querySelector('.live-product-overlay')?.remove();
    camera.querySelector('.seller-preview-cart')?.remove();
    let btn=camera.querySelector('.seller-shop-preview-button');
    if(!btn){btn=document.createElement('button');btn.className='live-cart-button seller-shop-preview-button';btn.type='button';btn.onclick=()=>drawer(true);camera.append(btn)}
    const featured=items(),total=featured.reduce((sum,product)=>sum+Number(product.price||0),0);
    btn.innerHTML='<span>🛒</span><b>Shop</b><small>'+featured.length+'</small><em>'+money(total)+'</em>';
  }
  function drawer(open=false){
    button();
    let panel=document.querySelector('.seller-commerce-preview');
    if(!panel){panel=document.createElement('aside');panel.className='commerce-drawer seller-commerce-preview';document.body.append(panel)}
    panel.classList.toggle('open',open);
    const inventory=read('vslInventory',{}),featured=items();
    panel.innerHTML='<div class="commerce-drawer-head"><div><p class="eyebrow">SELLER PREVIEW</p><h2>Live Shop</h2></div><button class="drawer-close" type="button">×</button></div><div class="drawer-product-list"></div><div class="drawer-cart-box"><h3>Buyer view</h3><p class="drawer-empty">This matches the product drawer buyers open from the live video.</p></div>';
    panel.querySelector('.drawer-close').onclick=()=>panel.classList.remove('open');
    const list=panel.querySelector('.drawer-product-list');
    list.innerHTML=featured.length?'':'<p class="drawer-empty">No featured products yet.</p>';
    featured.forEach(product=>{
      const stock=Number(inventory[product.id]||0),line=document.createElement('article');
      line.className='drawer-product'+(stock<=0?' sold-out':'');
      line.innerHTML=(product.photo?'<img src="'+product.photo+'" alt="">':'<span class="drawer-icon">'+(product.icon||'📦')+'</span>')+'<div><b>'+product.name+'</b><small>'+money(product.price)+' · '+(stock>0?stock+' in stock':'Sold out')+'</small></div><strong>'+money(product.price)+'</strong>';
      list.append(line);
    });
  }
  setInterval(button,700);
  button();drawer(false);
})();
