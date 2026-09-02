(()=>{
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const appId=localStorage.getItem('vslSupportApplication')||localStorage.getItem('vslApplication');
  const apps=read('vslApplications',[]),app=apps.find(item=>item.id===appId);
  const status=document.getElementById('supportStatus'),messages=document.getElementById('supportMessages'),form=document.getElementById('supportForm'),input=document.getElementById('supportInput');
  status.innerHTML=app?'<b>Tracking ID:</b> '+app.id+'<br><b>Status:</b> '+app.status+'<br><b>Applicant:</b> '+app.name+'<br><b>Contact:</b> '+app.mobile+' · '+app.email:'No application selected. Please login or submit an application first.';
  function render(){const list=read('vslAdminSupportChat:'+appId,[{from:'Virtual Space Lotto Admin Support',text:'Hi! Your application is under review. Please allow 24–48 hours. A representative will call your registered number once checked.',time:Date.now()}]);messages.innerHTML=list.map(item=>'<p class="'+(item.from==='Applicant'?'from-user':'from-admin')+'"><b>'+item.from+'</b><span>'+item.text+'</span><small>'+new Date(item.time).toLocaleString()+'</small></p>').join('');messages.scrollTop=messages.scrollHeight}
  form.onsubmit=event=>{event.preventDefault();const text=input.value.trim();if(!text)return;const list=read('vslAdminSupportChat:'+appId,[]);list.push({from:'Applicant',text,time:Date.now()});write('vslAdminSupportChat:'+appId,list);input.value='';render()};
  render();setInterval(render,1200);
})();
