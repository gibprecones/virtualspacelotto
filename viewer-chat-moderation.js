(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='viewer-chat-moderation.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  function viewer(){try{return JSON.parse(localStorage.getItem('vslViewer')||'null')}catch{return null}}
  function key(){const item=viewer();return item?.email||item?.name||''}
  function activeRestriction(){const viewerKey=key();if(!viewerKey)return null;return read('vslChatRestrictions',[]).find(item=>(item.key===viewerKey||item.email===viewerKey)&&(!item.until||Date.now()<item.until))}
  function noticeText(item){if(!item)return'';return item.type==='ban'?'Your account was banned from live chat. Reason: '+item.reason:'Your account was suspended from live chat until '+new Date(item.until).toLocaleDateString()+'. Reason: '+item.reason}
  function enhanceMessages(){
    const list=document.getElementById('viewerMessages');if(!list)return;
    list.querySelector('.pinned-viewer-chat')?.remove();
    const pinned=read('vslPinnedLiveComment',null);
    if(pinned){const box=document.createElement('p');box.className='pinned-viewer-chat';box.innerHTML='<b>Pinned:</b> '+pinned.name+': '+pinned.text;list.prepend(box)}
    const messages=read('vslLiveChat',[]).slice(-30),rows=[...list.querySelectorAll('p:not(.pinned-viewer-chat)')];
    rows.forEach((row,index)=>{const message=messages[index];row.querySelector('.seller-reply')?.remove();if(message?.reply){const reply=document.createElement('span');reply.className='seller-reply';reply.textContent='Seller reply: '+message.reply.text;row.append(reply)}});
  }
  function sync(){
    const form=document.getElementById('chatForm'),gate=document.getElementById('chatGate'),item=activeRestriction();
    let notice=document.querySelector('.viewer-chat-notice');
    if(item){if(!notice){notice=document.createElement('div');notice.className='viewer-chat-notice';(form||gate)?.before(notice)}notice.textContent=noticeText(item);if(form)form.hidden=true}
    else notice?.remove();
    enhanceMessages();
  }
  document.addEventListener('submit',event=>{if(event.target?.id==='chatForm'&&activeRestriction()){event.preventDefault();event.stopImmediatePropagation();alert(noticeText(activeRestriction()))}},true);
  setInterval(sync,300);sync();
})();
