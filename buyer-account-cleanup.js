(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='buyer-account-cleanup.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const normalize=value=>String(value||'').trim().toLowerCase();
  function current(){try{return JSON.parse(localStorage.getItem('vslViewer')||'null')}catch{return null}}
  function saveViewer(next,oldEmail){
    try{viewer=next}catch{}
    write('vslViewer',next);
    const accounts=read('vslViewerAccounts',[]);
    const index=accounts.findIndex(account=>normalize(account.email)===normalize(oldEmail||next.email)||account.id===next.id);
    if(index>=0)accounts[index]=next;else accounts.push(next);
    write('vslViewerAccounts',accounts);
  }
  function registeredEmail(email,user){
    const needle=normalize(email);
    const accounts=read('vslViewerAccounts',[]).filter(account=>account.id!==user.id&&normalize(account.email)!==normalize(user.email));
    const sellers=read('vslApplications',[]);
    return accounts.some(account=>normalize(account.email)===needle)||sellers.some(app=>normalize(app.email)===needle);
  }
  function renderProfile(page){
    const user=current();if(!user)return;
    page.innerHTML='<h2>My Profile</h2><form class="buyer-profile-form"><label>Full name<input name="name" required value="'+(user.name||'').replaceAll('"','&quot;')+'"></label><label>Email<input name="email" required type="email" value="'+(user.email||'').replaceAll('"','&quot;')+'"></label><label>Phone number<input name="phone" required inputmode="tel" value="'+(user.phone||'').replaceAll('"','&quot;')+'"></label><p class="signup-error"></p><button type="submit">Save profile</button></form>';
    page.querySelector('form').onsubmit=event=>{
      event.preventDefault();
      const form=event.target,error=form.querySelector('.signup-error'),oldEmail=user.email,next={...user,name:form.elements.name.value.trim(),email:normalize(form.elements.email.value),phone:form.elements.phone.value.trim()};
      error.textContent='';
      if(!next.name||!next.email||!next.phone){error.textContent='Name, email, and phone number are required.';return}
      if(registeredEmail(next.email,user)){error.textContent='This email is already used by another account. Please use a different email.';return}
      saveViewer(next,oldEmail);error.textContent='Profile saved.';
    };
  }
  function renderAddresses(page){
    const user=current();if(!user)return;
    const addresses=user.addresses||[];
    page.innerHTML='<h2>Saved Addresses</h2><form class="buyer-address-form"><label>Address label<input name="label" required placeholder="Home, Work, etc."></label><label>Phone number<input name="phone" required inputmode="tel" value="'+(user.phone||'').replaceAll('"','&quot;')+'"></label><label class="full">Complete address<textarea name="address" required rows="2" placeholder="House/Unit, Street, Barangay, City"></textarea></label><button type="submit">Add address</button><p class="signup-error"></p></form><div class="buyer-address-list">'+(addresses.length?addresses.map((item,index)=>'<article><b>'+(item.label||'Address')+'</b><p>'+(item.address||item)+'</p><small>'+(item.phone||user.phone||'No phone')+'</small><button type="button" data-index="'+index+'">Remove</button></article>').join(''):'<div class="info-card">No saved address yet.</div>')+'</div>';
    page.querySelector('form').onsubmit=event=>{
      event.preventDefault();
      const form=event.target,error=form.querySelector('.signup-error'),address={id:'address-'+Date.now(),label:form.elements.label.value.trim(),phone:form.elements.phone.value.trim(),address:form.elements.address.value.trim()};
      error.textContent='';
      if(!address.label||!address.phone||!address.address){error.textContent='Label, phone number, and address are required.';return}
      const next={...user,phone:address.phone,address:address.address,addresses:[...(user.addresses||[]),address]};
      saveViewer(next,user.email);renderAddresses(page);
    };
    page.querySelectorAll('[data-index]').forEach(button=>button.onclick=()=>{const next={...user,addresses:[...(user.addresses||[])]};next.addresses.splice(Number(button.dataset.index),1);saveViewer(next,user.email);renderAddresses(page)});
  }
  function activeView(){return document.querySelector('.account-nav [data-view].active')?.dataset.view||'orders'}
  function fixOrdersVisibility(){
    const account=document.querySelector('.account-management'),orders=account?.querySelector('.customer-orders');
    if(!account||!orders)return;
    orders.hidden=activeView()!=='orders';
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('.account-nav [data-view]');
    if(!button)return;
    setTimeout(()=>{
      const page=document.querySelector('.account-content [data-page="'+button.dataset.view+'"]');
      if(button.dataset.view==='profile'&&page)renderProfile(page);
      if(button.dataset.view==='addresses'&&page)renderAddresses(page);
      fixOrdersVisibility();
    },0);
  },true);
  setInterval(()=>{
    const view=activeView(),page=document.querySelector('.account-content [data-page="'+view+'"]');
    if(view==='profile'&&page&&!page.querySelector('.buyer-profile-form'))renderProfile(page);
    if(view==='addresses'&&page&&!page.querySelector('.buyer-address-form'))renderAddresses(page);
    fixOrdersVisibility();
  },400);
})();
