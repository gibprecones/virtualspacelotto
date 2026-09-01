(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='live-bridge.css';document.head.append(css);
  const channel='BroadcastChannel'in window?new BroadcastChannel('vsl-live-video'):null;
  const viewerId='viewer-'+Date.now()+'-'+Math.random().toString(16).slice(2);
  let latest=null,lastFrame='',lastPaint=0,lastLiveAt=0,peer=null,connected=false,offerTimer=null;

  function ensure(){
    const box=document.querySelector('.video');if(!box)return{};
    let video=box.querySelector('.customer-live-video'),image=box.querySelector('.customer-live-frame'),note=box.querySelector('.live-connection-note');
    if(!video){video=document.createElement('video');video.className='customer-live-video';video.autoplay=true;video.muted=true;video.playsInline=true;box.prepend(video)}
    if(!image){image=document.createElement('img');image.className='customer-live-frame';image.alt='Seller live video';image.decoding='async';video.after(image)}
    if(!note){note=document.createElement('span');note.className='live-connection-note';box.append(note)}
    return{box,video,image,note};
  }

  async function requestDirectStream(){
    if(!channel||peer)return;
    peer=new RTCPeerConnection({iceServers:[]});
    peer.ontrack=event=>{
      const {box,video,image,note}=ensure();
      if(!video||!box)return;
      video.srcObject=event.streams[0];
      video.hidden=false;
      image.hidden=true;
      connected=true;
      box.classList.add('has-live-frame','has-direct-live');
      note.textContent='● HD connected to seller live';
      note.style.background='#168142dd';
      document.querySelector('.live-badge').textContent='● LIVE';
    };
    peer.onicecandidate=event=>{
      if(event.candidate)channel.postMessage({type:'viewer-ice',viewerId,candidate:event.candidate});
    };
    peer.onconnectionstatechange=()=>{
      connected=['connected','completed'].includes(peer.connectionState);
      if(['failed','disconnected','closed'].includes(peer.connectionState)){peer?.close();peer=null;connected=false}
    };
    const offer=await peer.createOffer({offerToReceiveAudio:true,offerToReceiveVideo:true});
    await peer.setLocalDescription(offer);
    channel.postMessage({type:'viewer-offer',viewerId,offer:peer.localDescription});
  }

  function scheduleDirectRequest(){
    if(offerTimer)return;
    offerTimer=setInterval(()=>{if(!connected)requestDirectStream().catch(()=>{})},1500);
    requestDirectStream().catch(()=>{});
  }

  function drawFallback(payload){
    if(connected)return;
    if(payload)latest=payload;
    const {box,video,image,note}=ensure();if(!box)return;
    if(!latest){try{latest=JSON.parse(localStorage.getItem('vslLiveBroadcast')||'{}')}catch{}}
    const active=latest?.live&&latest.frame&&Date.now()-latest.time<3500;
    box.classList.toggle('has-live-frame',!!active);
    box.classList.toggle('seller-portrait',latest?.mode!=='landscape');
    box.classList.toggle('seller-landscape',latest?.mode==='landscape');
    video.hidden=true;
    image.hidden=!active&&!lastFrame;
    if(active){
      lastLiveAt=Date.now();
      if(latest.frame!==lastFrame&&Date.now()-lastPaint>160){
        const frame=latest.frame;
        lastFrame=frame;
        lastPaint=Date.now();
        const next=new Image();
        next.onload=()=>{if(!connected){image.src=frame;image.hidden=false}};
        next.src=frame;
      }
      note.textContent='● Connected to seller live';
      note.style.background='#168142dd';
      document.querySelector('.live-badge').textContent='● LIVE';
    }else{
      image.hidden=Date.now()-lastLiveAt>5000;
      note.textContent='Seller camera is offline';
      note.style.background='#061d46cc';
      document.querySelector('.live-badge').textContent='○ OFFLINE';
    }
  }

  channel&&(channel.onmessage=event=>{
    const message=event.data||{};
    if(message.type==='seller-answer'&&message.viewerId===viewerId&&peer)peer.setRemoteDescription(message.answer).catch(()=>{});
    if(message.type==='seller-ice'&&message.viewerId===viewerId&&peer)peer.addIceCandidate(message.candidate).catch(()=>{});
    if(!message.type)drawFallback(message);
  });

  scheduleDirectRequest();
  setInterval(()=>drawFallback(),250);
  window.addEventListener('storage',event=>{if(event.key==='vslLiveBroadcast'){try{drawFallback(JSON.parse(event.newValue||'{}'))}catch{}}});
  window.addEventListener('beforeunload',()=>channel?.postMessage({type:'viewer-left',viewerId}));
  drawFallback();
})();
