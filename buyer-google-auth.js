(()=>{
  const CLIENT_ID='773116616824-g07el5mjlgq8ip475hejjj03bfu7bcdo.apps.googleusercontent.com';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const normalize=value=>String(value||'').trim().toLowerCase();
  let googleReady=false,lastProfile=null;
  function decodeJwt(token){
    try{
      const payload=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      return JSON.parse(decodeURIComponent(escape(atob(payload))));
    }catch{return null}
  }
  function loadGoogle(){
    if(document.querySelector('script[src*="accounts.google.com/gsi/client"]'))return;
    const script=document.createElement('script');
    script.src='https://accounts.google.com/gsi/client';
    script.async=true;
    script.defer=true;
    script.onload=initGoogle;
    document.head.append(script);
  }
  function initGoogle(){
    if(!window.google?.accounts?.id||googleReady)return;
    google.accounts.id.initialize({
      client_id:CLIENT_ID,
      callback:response=>{
        const profile=decodeJwt(response.credential);
        if(!profile?.email){showError('Unable to read Gmail profile. Please try again.');return}
        if(!/@gmail\.com$/i.test(profile.email)){showError('Please use a Gmail account.');return}
        const email=normalize(profile.email);
        if(read('vslViewerAccounts',[]).some(account=>normalize(account.email)===email)){showError('This Gmail already has an account. Please login instead.');return}
        lastProfile={email,name:profile.name||profile.given_name||email.split('@')[0],picture:profile.picture||''};
        applyProfile(lastProfile);
      }
    });
    googleReady=true;
  }
  function showError(message){const error=document.getElementById('gmailFlowError')||document.getElementById('viewerSignupError');if(error)error.textContent=message}
  function applyProfile(profile){
    const form=document.querySelector('#signup .signup'),step=document.getElementById('profileStep');if(!form||!step)return;
    form.dataset.email=profile.email;
    const name=document.getElementById('viewerName'),previewName=document.getElementById('gmailPreviewName'),previewEmail=document.getElementById('gmailPreviewEmail'),avatar=document.querySelector('.gmail-avatar');
    if(name)name.value=profile.name;
    if(previewName)previewName.textContent=profile.name;
    if(previewEmail)previewEmail.textContent=profile.email;
    if(avatar)avatar.innerHTML=profile.picture?'<img src="'+profile.picture+'" alt="">':'G';
    const gmail=document.getElementById('gmailStep');if(gmail)gmail.hidden=true;
    step.hidden=false;
  }
  function attachButton(){
    initGoogle();
    const button=document.getElementById('continueGmail');
    if(!button||button.dataset.realGoogleAuth)return;
    button.dataset.realGoogleAuth='1';
    button.innerHTML='<span class="gmail-logo">G</span> Continue with Gmail';
    button.onclick=()=>{
      showError('');
      initGoogle();
      if(!window.google?.accounts?.id){showError('Google login is still loading. Please wait a second and try again.');loadGoogle();return}
      google.accounts.id.prompt(notification=>{
        if(notification.isNotDisplayed?.()||notification.isSkippedMoment?.())showError('Google sign-in popup was blocked or cancelled. Allow popups/sign-in and try again.');
      });
    };
  }
  window.vslApplyGoogleBuyerProfile=applyProfile;
  loadGoogle();
  setInterval(attachButton,300);
  attachButton();
})();
