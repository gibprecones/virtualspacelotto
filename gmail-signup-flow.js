(()=>{const css=document.createElement('link');css.rel='stylesheet';css.href='gmail-signup-flow.css';document.head.append(css);const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}},write=(key,value)=>localStorage.setItem(key,JSON.stringify(value)),normalize=email=>email.trim().toLowerCase(),deriveName=email=>email.split('@')[0].replace(/[._-]+/g,' ').replace(/\d+/g,'').trim().replace(/\b\w/g,letter=>letter.toUpperCase())||'Customer';function duplicate(email){return read('vslViewerAccounts',[]).some(item=>normalize(item.email)===email)||read('vslApplications',[]).some(item=>normalize(item.email)===email)}function setup(){const form=document.querySelector('#signup .signup');if(!form||form.dataset.gmailFlow)return;form.dataset.gmailFlow='1';form.innerHTML='<button type="button" class="close" onclick="hideSignup()">×</button><p>VIRTUAL SPACE LOTTO</p><h2>Create customer account</h2><div class="gmail-signup-note"><span>G</span> Continue using Gmail</div><div id="gmailStep" class="gmail-step"><input id="gmailSignupEmail" required type="email" placeholder="yourname@gmail.com"><p id="gmailFlowError" class="signup-error"></p><button id="continueGmail" type="button">Continue with Gmail</button></div><div id="profileStep" class="gmail-step signup-confirmation" hidden><div class="gmail-account-preview"><span class="gmail-avatar">G</span><div><b id="gmailPreviewName"></b><small id="gmailPreviewEmail"></small></div></div><p class="profile-hint">Review and edit your details before completing signup.</p><label>Full name<input id="viewerName" required></label><label>Gmail address<input id="viewerEmail" type="email" readonly></label><label>Mobile number<input id="viewerPhone" required inputmode="tel" placeholder="09XXXXXXXXX"></label><label>Complete address<input id="viewerAddress" required placeholder="House/Unit, Street, Barangay, City"></label><p id="viewerSignupError" class="signup-error"></p><button type="submit">Confirm & Complete Sign Up</button><button id="changeGmail" class="secondary-action" type="button">Use another Gmail</button></div>';form.querySelector('#continueGmail').onclick=()=>{const email=normalize(form.querySelector('#gmailSignupEmail').value),error=form.querySelector('#gmailFlowError');error.textContent='';if(!/^[^@\s]+@gmail\.com$/i.test(email)){error.textContent='Please enter a valid Gmail address.';return}if(duplicate(email)){error.textContent='This email has already been registered. Please use another email.';return}const name=deriveName(email);form.querySelector('#viewerName').value=name;form.querySelector('#viewerEmail').value=email;form.querySelector('#gmailPreviewName').textContent=name;form.querySelector('#gmailPreviewEmail').textContent=email;form.querySelector('#gmailStep').hidden=true;form.querySelector('#profileStep').hidden=false};form.querySelector('#changeGmail').onclick=()=>{form.querySelector('#profileStep').hidden=true;form.querySelector('#gmailStep').hidden=false;form.querySelector('#gmailSignupEmail').focus()}}function complete(event){event.preventDefault();const name=document.getElementById('viewerName')?.value.trim(),email=normalize(document.getElementById('viewerEmail')?.value||''),phone=document.getElementById('viewerPhone')?.value.trim(),address=document.getElementById('viewerAddress')?.value.trim(),error=document.getElementById('viewerSignupError');if(error)error.textContent='';if(!name||!phone||!address){if(error)error.textContent='Please complete your name, phone number, and address.';return}if(duplicate(email)){if(error)error.textContent='This email has already been registered. Please use another email.';return}viewer={id:'viewer-'+Date.now(),name,email,phone,address,addresses:[address],paymentMethods:[],createdAt:Date.now(),autoFollowedSeller:'demo-seller'};const accounts=read('vslViewerAccounts',[]);accounts.push(viewer);write('vslViewerAccounts',accounts);write('vslRegisteredEmails',[...new Set([...read('vslRegisteredEmails',[]),email])]);const followers=read('vslFollowers',[]);if(!followers.includes(email))followers.push(email);write('vslFollowers',followers);localStorage.setItem('vslFollowing','yes');localStorage.setItem('vslViewer',JSON.stringify(viewer));hideSignup();render();document.querySelector('.account-management')?.remove();setTimeout(()=>{if(typeof buildAccount==='function')buildAccount()},0)}setInterval(()=>{setup();window.registerViewer=complete;const profile=document.querySelector('[data-page="profile"] .info-card');if(profile&&viewer)profile.innerHTML='<b>'+viewer.name+'</b><p>'+viewer.email+'</p><p>'+viewer.phone+'</p><p>'+viewer.address+'</p>'},500);setup();window.registerViewer=complete})();

(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const normalize=value=>String(value||'').trim().toLowerCase();
  const deriveName=email=>email.split('@')[0].replace(/[._-]+/g,' ').replace(/\d+/g,'').trim().replace(/\b\w/g,letter=>letter.toUpperCase())||'Customer';
  function savedViewer(){try{return JSON.parse(localStorage.getItem('vslViewer')||'null')}catch{return null}}
  function accounts(){return read('vslViewerAccounts',[])}
  function followSeller(user){
    const email=normalize(user?.email);if(!email)return;
    const followers=read('vslFollowers',[]);if(!followers.includes(email))followers.push(email);
    write('vslFollowers',followers);localStorage.setItem('vslFollowing','yes');
  }
  function refreshLoggedIn(user){
    try{viewer=user}catch{}
    localStorage.setItem('vslViewer',JSON.stringify(user));
    followSeller(user);
    document.getElementById('signup')?.setAttribute('hidden','');
    document.getElementById('chatGate')?.setAttribute('hidden','');
    const form=document.getElementById('chatForm');if(form)form.hidden=false;
    if(typeof render==='function')render();
    document.querySelector('.account-management')?.remove();
  }
  function enhanceGate(){
    const gate=document.getElementById('chatGate'),form=document.getElementById('chatForm');
    if(!gate)return;
    const current=savedViewer();
    if(current?.email){gate.hidden=true;if(form)form.hidden=false;return}
    gate.hidden=false;if(form)form.hidden=true;
    if(gate.dataset.joinFlow)return;
    gate.dataset.joinFlow='1';
    const hasAccounts=accounts().length>0;
    gate.innerHTML='<b>'+(hasAccounts?'Login to join the live chat':'Sign up to join the live chat')+'</b><p>'+(hasAccounts?'Use your existing buyer Gmail account to chat and order.':'Create a buyer account first, then you can message the seller.')+'</p><div class="join-chat-actions"><button type="button" class="viewer-login-option">Login</button><button type="button" class="viewer-signup-option">Sign up</button></div>';
    gate.querySelector('.viewer-login-option').onclick=showBuyerLogin;
    gate.querySelector('.viewer-signup-option').onclick=()=>{if(typeof showSignup==='function')showSignup()};
  }
  function showBuyerLogin(){
    const modal=document.getElementById('signup');if(!modal)return;
    modal.hidden=false;
    const form=modal.querySelector('.signup');
    form.dataset.loginFlow='1';
    form.innerHTML='<button type="button" class="close">×</button><p>VIRTUAL SPACE LOTTO</p><h2>Buyer login</h2><div class="gmail-signup-note"><span>G</span> Login using Gmail</div><label>Gmail address<input id="buyerLoginEmail" required type="email" placeholder="yourname@gmail.com"></label><p id="buyerLoginError" class="signup-error"></p><button type="submit">Login & Join Chat</button><button type="button" class="secondary-action buyer-create-new">Create new buyer account</button>';
    form.querySelector('.close').onclick=()=>modal.hidden=true;
    form.querySelector('.buyer-create-new').onclick=()=>{form.dataset.gmailFlow='';modal.hidden=true;setTimeout(()=>{if(typeof showSignup==='function')showSignup()},0)};
    form.onsubmit=event=>{
      event.preventDefault();
      const email=normalize(form.querySelector('#buyerLoginEmail').value),error=form.querySelector('#buyerLoginError');
      error.textContent='';
      const user=accounts().find(account=>normalize(account.email)===email);
      if(!/^[^@\s]+@gmail\.com$/i.test(email)){error.textContent='Please enter a valid Gmail address.';return}
      if(!user){error.textContent='No buyer account found. Please sign up first.';return}
      refreshLoggedIn(user);
    };
  }
  function addSignupGps(){
    const step=document.getElementById('profileStep'),address=document.getElementById('viewerAddress');
    if(!step||!address||step.querySelector('.signup-gps-box'))return;
    const box=document.createElement('div');box.className='signup-gps-box';
    box.innerHTML='<button type="button" class="gps-button signup-gps-button">📍 Use GPS exact location</button><p class="gps-status">Use GPS to pin your accurate delivery location.</p><iframe class="address-map" hidden loading="lazy"></iframe>';
    address.closest('label').after(box);
    box.querySelector('button').onclick=()=>{
      const status=box.querySelector('.gps-status'),map=box.querySelector('.address-map'),button=box.querySelector('button');
      if(!navigator.geolocation){status.textContent='GPS is not supported by this browser.';return}
      let best=null,watchId=null,done=false;
      button.disabled=true;button.textContent='📍 Checking GPS accuracy...';
      const finish=()=>{
        if(done)return;done=true;if(watchId!=null)navigator.geolocation.clearWatch(watchId);
        button.disabled=false;button.textContent='📍 Refresh GPS exact location';
        if(!best){status.textContent='Unable to get GPS. Allow precise location and try again.';return}
        const {latitude:lat,longitude:lng,accuracy}=best.coords,d=.004;
        status.textContent=(accuracy<=30?'High-accuracy pin':'Approximate pin')+' - accuracy about '+Math.round(accuracy)+' meters.';
        map.src='https://www.openstreetmap.org/export/embed.html?bbox='+(lng-d)+'%2C'+(lat-d)+'%2C'+(lng+d)+'%2C'+(lat+d)+'&layer=mapnik&marker='+lat+'%2C'+lng;
        map.hidden=false;step.dataset.gpsLat=lat;step.dataset.gpsLng=lng;step.dataset.gpsAccuracy=accuracy;
      };
      watchId=navigator.geolocation.watchPosition(position=>{if(!best||position.coords.accuracy<best.coords.accuracy)best=position;status.textContent='Checking GPS... best accuracy '+Math.round(best.coords.accuracy)+' meters';if(best.coords.accuracy<=20)finish()},()=>{status.textContent='GPS unavailable. Please allow location access.';finish()},{enableHighAccuracy:true,maximumAge:0,timeout:15000});
      setTimeout(finish,15000);
    };
  }
  const previousRegister=window.registerViewer;
  window.registerViewer=event=>{
    event.preventDefault();
    const name=document.getElementById('viewerName')?.value.trim(),email=normalize(document.getElementById('viewerEmail')?.value||document.getElementById('gmailSignupEmail')?.value||''),phone=document.getElementById('viewerPhone')?.value.trim(),address=document.getElementById('viewerAddress')?.value.trim(),error=document.getElementById('viewerSignupError');
    if(error)error.textContent='';
    if(!name||!phone||!address){if(error)error.textContent='Name, phone number, and address are required.';return}
    if(!/^[^@\s]+@gmail\.com$/i.test(email)){if(error)error.textContent='Please use a valid Gmail address.';return}
    if(accounts().some(account=>normalize(account.email)===email)){if(error)error.textContent='This Gmail already has an account. Please login instead.';return}
    const step=document.getElementById('profileStep');
    const user={id:'viewer-'+Date.now(),name:name||deriveName(email),email,phone,address,addresses:[{label:'Primary address',address,lat:Number(step?.dataset.gpsLat)||null,lng:Number(step?.dataset.gpsLng)||null,accuracy:Number(step?.dataset.gpsAccuracy)||null}],paymentMethods:[],createdAt:Date.now(),autoFollowedSeller:'demo-seller'};
    const list=accounts();list.push(user);write('vslViewerAccounts',list);write('vslRegisteredEmails',[...new Set([...read('vslRegisteredEmails',[]),email])]);
    refreshLoggedIn(user);
  };
  setInterval(()=>{enhanceGate();addSignupGps()},350);
  enhanceGate();addSignupGps();
})();


(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const normalize=value=>String(value||'').trim().toLowerCase();
  function accounts(){return read('vslViewerAccounts',[])}
  function follow(user){const email=normalize(user?.email);if(!email)return;const followers=read('vslFollowers',[]);if(!followers.includes(email))followers.push(email);write('vslFollowers',followers);localStorage.setItem('vslFollowing','yes')}
  function loginUser(user){try{viewer=user}catch{} localStorage.setItem('vslViewer',JSON.stringify(user));follow(user);document.getElementById('signup')?.setAttribute('hidden','');const gate=document.getElementById('chatGate');if(gate)gate.hidden=true;const form=document.getElementById('chatForm');if(form)form.hidden=false;if(typeof render==='function')render();document.querySelector('.account-management')?.remove()}
  function enhancedRegister(event){
    event.preventDefault();
    const name=document.getElementById('viewerName')?.value.trim(),email=normalize(document.getElementById('viewerEmail')?.value||''),phone=document.getElementById('viewerPhone')?.value.trim(),address=document.getElementById('viewerAddress')?.value.trim(),error=document.getElementById('viewerSignupError');
    if(error)error.textContent='';
    if(!name||!phone||!address){if(error)error.textContent='Name, phone number, and address are required.';return}
    if(!/^[^@\s]+@gmail\.com$/i.test(email)){if(error)error.textContent='Please use a valid Gmail address.';return}
    if(accounts().some(account=>normalize(account.email)===email)){if(error)error.textContent='This Gmail already has an account. Please login instead.';return}
    const step=document.getElementById('profileStep'),user={id:'viewer-'+Date.now(),name,email,phone,address,addresses:[{label:'Primary address',address,lat:Number(step?.dataset.gpsLat)||null,lng:Number(step?.dataset.gpsLng)||null,accuracy:Number(step?.dataset.gpsAccuracy)||null}],paymentMethods:[],createdAt:Date.now(),autoFollowedSeller:'demo-seller'};
    const list=accounts();list.push(user);write('vslViewerAccounts',list);write('vslRegisteredEmails',[...new Set([...read('vslRegisteredEmails',[]),email])]);loginUser(user);
  }
  function ensureJoinGate(){
    const gate=document.getElementById('chatGate'),form=document.getElementById('chatForm'),current=read('vslViewer',null);if(!gate)return;
    if(current?.email){gate.hidden=true;if(form)form.hidden=false;return}
    gate.hidden=false;if(form)form.hidden=true;
    if(!gate.querySelector('.join-chat-actions')){
      gate.innerHTML='<b>'+(accounts().length?'Login to join the live chat':'Sign up to join the live chat')+'</b><p>'+(accounts().length?'Use your existing buyer Gmail account to chat and order.':'Create a buyer account first, then you can message the seller.')+'</p><div class="join-chat-actions"><button type="button" class="viewer-login-option">Login</button><button type="button" class="viewer-signup-option">Sign up</button></div>';
      gate.querySelector('.viewer-signup-option').onclick=()=>showSignup();
      gate.querySelector('.viewer-login-option').onclick=()=>{
        const modal=document.getElementById('signup'),signup=modal?.querySelector('.signup');if(!modal||!signup)return;modal.hidden=false;
        signup.innerHTML='<button type="button" class="close">×</button><p>VIRTUAL SPACE LOTTO</p><h2>Buyer login</h2><div class="gmail-signup-note"><span>G</span> Login using Gmail</div><label>Gmail address<input id="buyerLoginEmail" required type="email" placeholder="yourname@gmail.com"></label><p id="buyerLoginError" class="signup-error"></p><button type="submit">Login & Join Chat</button><button type="button" class="secondary-action buyer-create-new">Create new buyer account</button>';
        signup.querySelector('.close').onclick=()=>modal.hidden=true;signup.querySelector('.buyer-create-new').onclick=()=>location.reload();
        signup.onsubmit=e=>{e.preventDefault();const email=normalize(document.getElementById('buyerLoginEmail')?.value),error=document.getElementById('buyerLoginError'),user=accounts().find(account=>normalize(account.email)===email);if(error)error.textContent='';if(!user){if(error)error.textContent='No buyer account found. Please sign up first.';return}loginUser(user)};
      };
    }
  }
  setInterval(()=>{window.registerViewer=enhancedRegister;ensureJoinGate()},250);
  window.registerViewer=enhancedRegister;ensureJoinGate();
})();

(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  function polishJoinChoice(){
    const gate=document.getElementById('chatGate');if(!gate||gate.hidden)return;
    const hasAccounts=read('vslViewerAccounts',[]).length>0;
    const login=gate.querySelector('.viewer-login-option'),signup=gate.querySelector('.viewer-signup-option'),title=gate.querySelector('b'),copy=gate.querySelector('p');
    if(title)title.textContent=hasAccounts?'Login to join the live chat':'Sign up to join the live chat';
    if(copy)copy.textContent=hasAccounts?'Use your existing buyer Gmail account to chat and order.':'Create a buyer account first, then you can message the seller.';
    if(login)login.hidden=!hasAccounts;
    if(signup)signup.hidden=hasAccounts;
  }
  setInterval(polishJoinChoice,250);
  polishJoinChoice();
})();
