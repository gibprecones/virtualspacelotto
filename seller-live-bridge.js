(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='live-bridge.css';document.head.append(css);
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d',{alpha:false});
  const channel='BroadcastChannel'in window?new BroadcastChannel('vsl-live-video'):null;
  const peers=new Map;
  let lastOffline=0,lastFrame=0,lastStorage=0;

  function sellerStream(){
    return document.getElementById('cam')?.srcObject||null;
  }

  function publish(payload){
    payload.mode=localStorage.getItem('vslSellerCameraMode')||'portrait';
    channel?.postMessage(payload);
    if(Date.now()-lastStorage>1200){try{localStorage.setItem('vslLiveBroadcast',JSON.stringify(payload))}catch{}lastStorage=Date.now()}
  }

  async function answerViewer(message){
    const stream=sellerStream();
    if(!channel||!stream||!message.viewerId)return;
    peers.get(message.viewerId)?.close();
    const peer=new RTCPeerConnection({iceServers:[]});
    peers.set(message.viewerId,peer);
    stream.getTracks().forEach(track=>peer.addTrack(track,stream));
    peer.onicecandidate=event=>{
      if(event.candidate)channel.postMessage({type:'seller-ice',viewerId:message.viewerId,candidate:event.candidate});
    };
    peer.onconnectionstatechange=()=>{
      if(['closed','failed','disconnected'].includes(peer.connectionState)){peer.close();peers.delete(message.viewerId)}
    };
    await peer.setRemoteDescription(message.offer);
    const answer=await peer.createAnswer();
    await peer.setLocalDescription(answer);
    channel.postMessage({type:'seller-answer',viewerId:message.viewerId,answer:peer.localDescription,mode:localStorage.getItem('vslSellerCameraMode')||'portrait'});
  }

  channel&&(channel.onmessage=event=>{
    const message=event.data||{};
    if(message.type==='viewer-offer')answerViewer(message).catch(()=>{});
    if(message.type==='viewer-ice'&&peers.has(message.viewerId))peers.get(message.viewerId).addIceCandidate(message.candidate).catch(()=>{});
    if(message.type==='viewer-left'&&peers.has(message.viewerId)){peers.get(message.viewerId).close();peers.delete(message.viewerId)}
  });

  function tick(){
    const video=document.getElementById('cam'),now=Date.now();
    if(video?.srcObject&&video.readyState>=2&&video.videoWidth){
      if(now-lastFrame<180)return;
      lastFrame=now;
      const mode=localStorage.getItem('vslSellerCameraMode')||'portrait';
      const width=mode==='landscape'?640:480,height=Math.round(width*video.videoHeight/video.videoWidth);
      canvas.width=width;canvas.height=height;context.drawImage(video,0,0,width,height);
      publish({frame:canvas.toDataURL('image/jpeg',.6),time:now,live:true});
    }else if(now-lastOffline>700){
      peers.forEach(peer=>peer.close());peers.clear();
      publish({time:now,live:false});
      lastOffline=now;
    }
  }
  setInterval(tick,80);
})();
