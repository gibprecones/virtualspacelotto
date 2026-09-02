(()=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='gmail-signup-flow.css';
  document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  function showFinalSignup(){if(typeof showSignup==='function')showSignup()}
  function enhanceGate(){
    const gate=document.getElementById('chatGate'),form=document.getElementById('chatForm'),current=read('vslViewer',null);
    if(!gate)return;
    if(current?.email){gate.hidden=true;if(form)form.hidden=false;return}
    gate.hidden=false;if(form)form.hidden=true;
    gate.innerHTML='<b>Sign up or login to join the live chat</b><p>Use Gmail to continue. No manual Gmail typing needed.</p><div class="join-chat-actions"><button type="button" class="viewer-login-option">Login with Gmail</button><button type="button" class="viewer-signup-option">Sign up with Gmail</button></div>';
    gate.querySelector('.viewer-login-option').onclick=showFinalSignup;
    gate.querySelector('.viewer-signup-option').onclick=showFinalSignup;
  }
  setInterval(enhanceGate,350);
  enhanceGate();
})();

(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const normalize=value=>String(value||'').trim().toLowerCase();
  function registeredEmails(){
    const fromAccounts=read('vslViewerAccounts',[]).map(account=>normalize(account.email)).filter(Boolean);
    const fromRegistry=read('vslRegisteredEmails',[]).map(normalize).filter(Boolean);
    const fromApps=read('vslApplications',[]).map(app=>normalize(app.email)).filter(Boolean);
    const merged=[...new Set([...fromAccounts,...fromRegistry,...fromApps])];
    write('vslRegisteredEmails',merged);
    return merged;
  }
  function emailUsed(email){return registeredEmails().includes(normalize(email))}
  function showEmailUsed(error,email){
    if(!error)return;
    error.innerHTML='This Gmail is already registered. Please login instead, or <button type="button" class="inline-change-email">change email</button>.';
    error.querySelector('.inline-change-email')?.addEventListener('click',()=>{
      const gmailStep=document.getElementById('gmailStep'),profileStep=document.getElementById('profileStep'),gmail=document.getElementById('gmailSignupEmail');
      if(profileStep)profileStep.hidden=true;
      if(gmailStep)gmailStep.hidden=false;
      if(gmail){gmail.value='';gmail.focus()}
      error.textContent='';
    });
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('#continueGmail');
    if(!button)return;
    const email=normalize(document.getElementById('gmailSignupEmail')?.value),error=document.getElementById('gmailFlowError');
    if(email&&emailUsed(email)){
      event.preventDefault();event.stopImmediatePropagation();
      showEmailUsed(error,email);
    }
  },true);
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!form.matches('#signup .signup')||form.querySelector('#buyerLoginEmail'))return;
    const email=normalize(document.getElementById('viewerEmail')?.value||document.getElementById('gmailSignupEmail')?.value),error=document.getElementById('viewerSignupError')||document.getElementById('gmailFlowError');
    if(email&&emailUsed(email)){
      event.preventDefault();event.stopImmediatePropagation();
      showEmailUsed(error,email);
    }
  },true);
})();
