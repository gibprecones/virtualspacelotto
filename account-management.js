(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='account-management.css';document.head.append(css);
  const tabsCss=document.createElement('link');tabsCss.rel='stylesheet';tabsCss.href='account-tabs-fix.css';document.head.append(tabsCss);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const normalize=email=>(email||'').trim().toLowerCase();
  const money=value=>'₱'+Number(value||0).toFixed(2);
  function productList(){try{return typeof products!=='undefined'&&Array.isArray(products)?products:[]}catch{return[]}}
  function currentViewer(){try{return JSON.parse(localStorage.getItem('vslViewer')||'null')}catch{return null}}
  function saveViewer(next){viewer=next;localStorage.setItem('vslViewer',JSON.stringify(next));const accounts=read('vslViewerAccounts',[]),index=accounts.findIndex(account=>normalize(account.email)===normalize(next.email));if(index>=0){accounts[index]=next;write('vslViewerAccounts',accounts)}}

  function prepareSignup(){
    const form=document.querySelector('#signup .signup');if(!form||form.querySelector('.gmail-signup-note'))return;
    form.querySelector('h2').textContent='Create customer account';
    const note=document.createElement('div');note.className='gmail-signup-note';note.innerHTML='<span>G</span> Sign up using Gmail';form.querySelector('h2').after(note);
    document.getElementById('viewerEmail').placeholder='yourname@gmail.com';
    document.getElementById('viewerEmail').setAttribute('pattern','.+@gmail\\.com');
    const error=document.createElement('p');error.id='viewerSignupError';error.className='signup-error';form.querySelector('button:last-child').before(error);
  }
  window.registerViewer=event=>{
    event.preventDefault();
    const name=document.getElementById('viewerName').value.trim(),email=normalize(document.getElementById('viewerEmail').value),error=document.getElementById('viewerSignupError');
    error.textContent='';
    if(!/^[^@\s]+@gmail\.com$/i.test(email)){error.textContent='Please use a valid Gmail address.';return}
    const accounts=read('vslViewerAccounts',[]),applications=read('vslApplications',[]);
    if(accounts.some(item=>normalize(item.email)===email)||applications.some(item=>normalize(item.email)===email)){error.textContent='This email has already been registered. Please use another email.';return}
    viewer={id:'viewer-'+Date.now(),name,email,createdAt:Date.now(),addresses:[],paymentMethods:[]};
    accounts.push(viewer);write('vslViewerAccounts',accounts);write('vslRegisteredEmails',[...new Set([...read('vslRegisteredEmails',[]),email])]);
    localStorage.setItem('vslViewer',JSON.stringify(viewer));hideSignup();render();buildAccount();
  };

  function renderProfile(page){
    const user=currentViewer()||viewer||{};
    page.innerHTML='<h2>My Profile</h2><div class="info-card profile-card"><b>'+((user.name)||'Customer')+'</b><p>'+((user.email)||'No email')+'</p><p>'+((user.phone)||'No phone number yet')+'</p></div>';
  }
  function renderPayments(page){
    const settings=read('vslCheckoutSettings',{cash:true,gcash:true}),methods=[settings.cash&&'Cash',settings.gcash&&'GCash'].filter(Boolean);
    page.innerHTML='<h2>Payment Methods</h2><div class="info-card"><b>Available from this seller</b><p>'+(methods.join(' and ')||'No payment method enabled yet')+'</p></div><div class="info-card"><b>Reminder</b><p>Payment method availability is controlled by the seller. GCash payments may require seller confirmation/reference number.</p></div>';
  }
  function renderFavorites(page){
    const user=currentViewer()||viewer,key=user?.email||'guest',favorites=read('vslFavorites:'+key,[]),items=productList().filter(product=>favorites.includes(product.id));
    page.innerHTML='<h2>Favorites</h2><div class="favorite-list"></div>';
    const list=page.querySelector('.favorite-list');
    if(!items.length){list.innerHTML='<div class="info-card">No favorite products yet. Tap Favorite on products you want to save.</div>';return}
    items.forEach(product=>{
      const card=document.createElement('article');card.className='favorite-card';
      card.innerHTML=(product.photo?'<img src="'+product.photo+'" alt="">':'<span>'+product.icon+'</span>')+'<div><b>'+product.name+'</b><p>'+money(product.price)+'</p></div><button type="button">Remove</button>';
      card.querySelector('button').onclick=()=>{const next=read('vslFavorites:'+key,[]).filter(id=>id!==product.id);write('vslFavorites:'+key,next);renderFavorites(page)};
      list.append(card);
    });
  }
  function renderHelp(page){
    page.innerHTML='<h2>Help Center</h2><div class="info-card"><b>Product or order concern</b><p>Please contact the seller directly through live chat or store pickup contact.</p></div><div class="info-card"><b>Account concern</b><p>Use your order details and transaction number when asking the seller for assistance.</p></div>';
  }
  function renderAddresses(page){
    const user=currentViewer()||viewer||{},addresses=user.addresses||[];
    page.innerHTML='<h2>Saved Addresses</h2><div class="info-card">'+(addresses.length?addresses.map(item=>'<p><b>'+(item.label||'Address')+'</b><br>'+(item.address||item)+'</p>').join(''):'No saved address yet. Add your delivery details here.')+'</div>';
  }
  function panel(type){
    const content=document.querySelector('.account-content');if(!content)return;
    content.querySelectorAll(':scope > *').forEach(child=>child.hidden=true);
    if(type==='orders'){const orders=content.querySelector('.customer-orders');if(orders){orders.hidden=false;addFilters()}return}
    let page=content.querySelector('[data-page="'+type+'"]');
    if(!page){page=document.createElement('section');page.className='account-placeholder';page.dataset.page=type;content.append(page)}
    if(type==='profile')renderProfile(page);
    if(type==='addresses')renderAddresses(page);
    if(type==='payments')renderPayments(page);
    if(type==='favorites')renderFavorites(page);
    if(type==='help')renderHelp(page);
    page.hidden=false;
  }
  function addFilters(){
    const orders=document.querySelector('.customer-orders');if(!orders||orders.querySelector('.order-filters'))return;
    const filters=document.createElement('div');filters.className='order-filters';
    ['All','Ongoing','Completed','Cancelled'].forEach((label,index)=>{const button=document.createElement('button');button.textContent=label;button.classList.toggle('active',index===0);button.onclick=()=>{filters.querySelectorAll('button').forEach(item=>item.classList.remove('active'));button.classList.add('active');orders.querySelectorAll('.order-card').forEach(card=>{const status=card.querySelector('.order-status')?.textContent||'',show=label==='All'||label==='Ongoing'&&!['Completed','Cancelled'].includes(status)||status===label;card.hidden=!show})};filters.append(button)});
    orders.querySelector('h2')?.after(filters);
  }
  function buildAccount(){
    const orders=document.querySelector('.customer-orders');if(!orders||document.querySelector('.account-management'))return;
    const shell=document.createElement('section');shell.className='account-management';
    shell.innerHTML='<aside class="account-sidebar"><h2>Account Management</h2><nav class="account-nav"><button data-view="profile">👤 My Profile</button><button data-view="addresses">⌖ Saved Addresses</button><button data-view="payments">▣ Payment Methods</button><button data-view="orders" class="active">▤ My Orders</button><button data-view="favorites">♡ Favorites</button><button data-view="help">? Help Center</button><button class="logout-viewer">↪ Log out</button></nav></aside><div class="account-content"></div>';
    orders.before(shell);shell.querySelector('.account-content').append(orders);
    shell.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>{shell.querySelectorAll('[data-view]').forEach(item=>item.classList.remove('active'));button.classList.add('active');panel(button.dataset.view)});
    shell.querySelector('.logout-viewer').onclick=()=>{localStorage.removeItem('vslViewer');location.reload()};
    addFilters();
  }
  setInterval(()=>{prepareSignup();buildAccount()},700);
  prepareSignup();buildAccount();
})();
