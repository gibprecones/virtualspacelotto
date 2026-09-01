(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-chat-moderation.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const roles={owner:'Store Owner',manager:'Manager',supervisor:'Supervisor',cashier:'Cashier',staff:'Staff',live:'Live selling staff'};
  let activeForm=null,lastSignature='';
  function session(){const saved=read('vslSellerAccessUser',null);return saved&&saved.role?saved:{id:'owner',name:'Store Owner',role:'owner'}}
  function isOwner(){return session().role==='owner'}
  function log(action,detail){const user=session(),logs=read('vslActivityHistory',[]);logs.unshift({id:'log-'+Date.now()+'-'+Math.random().toString(16).slice(2),time:Date.now(),actor:user.name,role:roles[user.role]||user.role,action,detail});write('vslActivityHistory',logs.slice(0,300))}
  function messageKey(message){return message.email||message.viewerEmail||message.name}
  function allMessages(){const messages=read('vslLiveChat',[]),changed=messages.some((message,index)=>!message.id);if(changed)write('vslLiveChat',messages.map((message,index)=>({...message,id:message.id||'msg-'+(message.time||Date.now())+'-'+index,email:message.email||message.viewerEmail||''})));return read('vslLiveChat',[])}
  function restrictions(){return read('vslChatRestrictions',[]).filter(item=>!item.until||Date.now()<item.until)}
  function saveRestrictions(items){write('vslChatRestrictions',items)}
  function notifyViewer(message,type,reason,until){const key=messageKey(message);localStorage.setItem('vslViewerNotice:'+key,JSON.stringify({type,reason,until,time:Date.now()}))}
  function setReply(message,text){const messages=allMessages(),target=messages.find(item=>item.id===message.id);if(!target)return;target.reply={text,by:session().name,time:Date.now()};write('vslLiveChat',messages);log('Replied to live comment',message.name+': '+text);activeForm=null}
  function pin(message){write('vslPinnedLiveComment',{id:message.id,name:message.name,text:message.text,time:Date.now()});log('Pinned live comment',message.name+': '+message.text)}
  function restrict(message,type,reason,days){const key=messageKey(message),items=restrictions().filter(item=>item.key!==key),until=type==='suspend'?Date.now()+Number(days)*86400000:null;items.push({id:'restriction-'+Date.now(),key,email:message.email||'',name:message.name,type,reason,until,createdAt:Date.now(),by:session().name});saveRestrictions(items);notifyViewer(message,type,reason,until);log(type==='ban'?'Banned viewer':'Suspended viewer',(message.name||key)+'. Reason: '+reason);activeForm=null;renderModeration()}
  function actionForm(message,type){if(activeForm?.id!==message.id||activeForm?.type!==type)return'';if(type==='reply')return '<form class="inline-chat-form" data-type="reply" data-id="'+message.id+'"><input name="text" required placeholder="Type reply to '+message.name+'"><button>Send reply</button><button type="button" class="cancel-inline">Cancel</button></form>';return '<form class="inline-chat-form" data-type="'+type+'" data-id="'+message.id+'"><input name="reason" required placeholder="Required reason">'+(type==='suspend'?'<input name="days" required type="number" min="1" value="3" aria-label="Days">':'')+'<button>'+(type==='ban'?'Confirm ban':'Confirm suspend')+'</button><button type="button" class="cancel-inline">Cancel</button></form>'}
  function renderChat(force=false){
    const list=document.getElementById('sellerChatMessages');if(!list)return;
    const pinned=read('vslPinnedLiveComment',null),blocked=restrictions(),messages=allMessages().filter(message=>!blocked.some(item=>item.key===messageKey(message)&&item.type==='ban')),signature=JSON.stringify({pinned,blocked,messages,activeForm});
    if(!force&&signature===lastSignature)return;lastSignature=signature;
    list.innerHTML='';
    if(pinned){const pinBox=document.createElement('div');pinBox.className='pinned-chat';pinBox.innerHTML='<b>Pinned comment</b><p>'+pinned.name+': '+pinned.text+'</p>';list.append(pinBox)}
    if(!messages.length){list.innerHTML+='<p class="chat-empty">No customer messages yet.</p>';return}
    messages.slice(-30).forEach(message=>{
      const item=document.createElement('article');item.className='seller-chat-message';if(pinned?.id===message.id)item.classList.add('is-pinned');
      item.innerHTML='<header><b>'+message.name+'</b><time>'+new Date(message.time||Date.now()).toLocaleTimeString()+'</time></header><p>'+message.text+'</p>'+(message.reply?'<div class="seller-chat-reply">Seller reply: '+message.reply.text+'</div>':'')+'<div class="chat-actions"><button class="pin-comment">'+(pinned?.id===message.id?'Pinned':'Pin')+'</button><button class="reply-comment">Reply</button><button class="danger ban-comment">Ban</button><button class="danger suspend-comment">Suspend</button></div>'+actionForm(message,'reply')+actionForm(message,'ban')+actionForm(message,'suspend');
      item.querySelector('.pin-comment').onclick=()=>{pin(message);renderChat(true)};
      item.querySelector('.reply-comment').onclick=()=>{activeForm={id:message.id,type:'reply'};renderChat(true)};
      item.querySelector('.ban-comment').onclick=()=>{activeForm={id:message.id,type:'ban'};renderChat(true)};
      item.querySelector('.suspend-comment').onclick=()=>{activeForm={id:message.id,type:'suspend'};renderChat(true)};
      item.querySelector('.cancel-inline')?.addEventListener('click',()=>{activeForm=null;renderChat(true)});
      item.querySelector('.inline-chat-form')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(form.dataset.type==='reply')setReply(message,form.elements.text.value.trim());else restrict(message,form.dataset.type,form.elements.reason.value.trim(),form.elements.days?.value||0);renderChat(true)});
      list.append(item);
    });
    list.scrollTop=list.scrollHeight;
  }
  function renderModeration(){
    document.querySelector('aside nav a[href="#moderation"]')?.remove();
    let panel=document.querySelector('#moderation');
    if(!panel){panel=document.createElement('section');panel.id='moderation';panel.className='seller-ops-panel moderation-panel';panel.innerHTML='<div class="seller-ops-header"><div><p class="eyebrow">SECURITY</p><h2>Banned and suspended users</h2></div></div><table class="moderation-table"><thead><tr><th>User</th><th>Status</th><th>Reason</th><th>Action</th></tr></thead><tbody></tbody></table>';document.querySelector('.security-staff-panel')?.after(panel)||document.querySelector('main')?.append(panel)}
    if(panel.parentElement&&!panel.previousElementSibling?.classList?.contains('security-staff-panel'))document.querySelector('.security-staff-panel')?.after(panel);
    panel.hidden=!isOwner();
    const body=panel.querySelector('tbody'),items=restrictions();
    body.innerHTML=items.length?items.map(item=>'<tr><td><b>'+item.name+'</b><br><small>'+(item.email||item.key)+'</small></td><td><span class="mod-badge">'+(item.type==='ban'?'Banned':'Suspended')+'</span><br><small>'+(item.until?'Until '+new Date(item.until).toLocaleDateString():'Permanent')+'</small></td><td>'+item.reason+'</td><td><button data-id="'+item.id+'">Remove restriction</button></td></tr>').join(''):'<tr><td colspan="4">No banned or suspended users.</td></tr>';
    body.querySelectorAll('button[data-id]').forEach(button=>button.onclick=()=>{saveRestrictions(restrictions().filter(item=>item.id!==button.dataset.id));log('Removed chat restriction','Restriction removed');renderModeration()});
  }
  setInterval(()=>{renderChat();renderModeration()},300);
  renderChat(true);renderModeration();
})();
