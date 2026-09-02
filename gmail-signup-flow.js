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
