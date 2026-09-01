(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-operations.css';document.head.append(css);
  const money=value=>'₱'+Number(value||0).toFixed(2);
  const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));return value??fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const ownerCode='123456';
  const roles={owner:'Store Owner',manager:'Manager',supervisor:'Supervisor',cashier:'Cashier',staff:'Staff',live:'Live selling staff'};
  const limitedRoles=['cashier','staff','live'];
  let lastSignature='';

  function productsList(){try{return typeof products!=='undefined'&&Array.isArray(products)?products:[]}catch{return[]}}
  function accessUsers(){const staff=read('vslSellerStaff',[]);return [{id:'owner',name:'Store Owner',role:'owner',code:ownerCode,createdAt:0},...staff]}
  function currentSession(){const saved=read('vslSellerAccessUser',null);if(saved&&saved.role)return saved;return {id:'owner',name:'Store Owner',role:'owner'}}
  function currentRole(){return currentSession().role||'owner'}
  function currentActor(){const session=currentSession(),role=session.role||'owner';return {name:session.name||roles[role],role,label:roles[role]||role}}
  function canManageStore(){return currentRole()==='owner'}
  function canApprove(){return ['owner','manager','supervisor'].includes(currentRole())}
  function canSeeReports(){return ['owner','manager','supervisor'].includes(currentRole())}
  function logActivity(action,detail){const actor=currentActor(),list=read('vslActivityHistory',[]);list.unshift({id:'log-'+Date.now()+'-'+Math.random().toString(16).slice(2),time:Date.now(),actor:actor.name,role:actor.label,action,detail});write('vslActivityHistory',list.slice(0,300))}
  function updateInventory(productId,delta){const inventory=read('vslInventory',{});inventory[productId]=Math.max(0,Number(inventory[productId]||0)+delta);write('vslInventory',inventory)}
  function restoreItems(items){(items||[]).forEach(item=>updateInventory(item.id,item.quantity||1))}
  function recalc(order){const settings=read('vslCheckoutSettings',{discount:0}),subtotal=(order.items||[]).reduce((sum,item)=>sum+Number(item.price||0)*Number(item.quantity||1),0),discount=subtotal*(Number(settings.discount)||0)/100;order.subtotal=subtotal;order.discount=discount;order.total=subtotal-discount}
  function openPaymentAgain(order){setTimeout(()=>{if(typeof window.vslOpenPaymentModal==='function')window.vslOpenPaymentModal(order);else alert('Replacement saved. Please process payment again for the updated order total.')},120)}
  function validApprovalCode(code){return code===ownerCode||read('vslSellerStaff',[]).some(staff=>['manager','supervisor'].includes(staff.role)&&staff.code===code)}
  function needApproval(form){const role=currentRole(),code=form.elements.managerCode?.value.trim();return limitedRoles.includes(role)&&!validApprovalCode(code)}
  function modal(title,body,onSubmit){const shell=document.createElement('div');shell.className='ops-modal';shell.innerHTML='<div class="ops-card"><button type="button" class="close-ops">×</button><p class="eyebrow">SELLER OPERATIONS</p><h2>'+title+'</h2><form>'+body+'<p class="ops-error"></p><button>Confirm</button></form></div>';document.body.append(shell);const close=()=>{document.removeEventListener('keydown',escape);shell.remove()},escape=event=>{if(event.key==='Escape')close()};document.addEventListener('keydown',escape);shell.onclick=event=>{if(event.target===shell)close()};shell.querySelector('.close-ops').onclick=close;shell.querySelector('form').onsubmit=event=>{event.preventDefault();const error=shell.querySelector('.ops-error');error.textContent='';const ok=onSubmit(event.target,error);if(ok!==false)close()};return shell}
  function managerField(){return limitedRoles.includes(currentRole())?'<label>Manager / supervisor approval code<input name="managerCode" required placeholder="Required for this role"></label>':''}
  function overrideApprover(code){
    if(code===ownerCode)return {name:'Store Owner',role:'Owner'};
    const user=read('vslSellerStaff',[]).find(staff=>['manager','supervisor'].includes(staff.role)&&staff.code===code);
    return user?{name:user.name,role:roles[user.role]}:null;
  }
  function completedOverride(order,action,next){
    if(order.status!=='Completed'){next(null);return}
    const trusted=canApprove(),approvalField=trusted?'':'<label>Owner / manager / supervisor password<input name="approvalCode" required type="password" placeholder="Required for completed transaction override"></label>';
    modal('Override completed transaction','<p class="override-warning">Completed transactions are locked. Use override only for documented corrections.</p><label>Documentation note<textarea name="overrideNote" required placeholder="Required: why does this completed transaction need '+action+'?"></textarea></label>'+approvalField,(form,error)=>{
      const note=form.elements.overrideNote.value.trim();
      if(!note){error.textContent='Documentation note is required.';return false}
      const approver=trusted?currentActor():overrideApprover(form.elements.approvalCode.value.trim());
      if(!approver){error.textContent='Enter a valid owner, manager, or supervisor password.';return false}
      logActivity('Approved completed order override',order.transaction+' for '+action+'. Approved by '+approver.name+'. Note: '+note);
      next({time:Date.now(),action,note,approver,requestedBy:currentActor()});
    })
  }

  function replaceProduct(order,override=null){
    if(order.status==='Completed'&&!override){completedOverride(order,'product replacement',approval=>replaceProduct(order,approval));return}
    const escape=value=>String(value??'').replace(/[&<>"']/g,match=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[match]));
    const items=(order.items||[]).map((item,index)=>'<label class="replace-choice"><input type="radio" name="oldItem" value="'+index+'" required><span><b>'+escape(item.name)+'</b><small>Current order item × '+(item.quantity||1)+'</small></span></label>').join('');
    const inventory=read('vslInventory',{});
    const replacements=productsList().map(product=>'<label class="replace-choice product-choice"><input type="radio" name="newProduct" value="'+escape(product.id)+'" required data-price="'+Number(product.price||0)+'"><span>'+(product.photo?'<img src="'+product.photo+'" alt="">':'<em>'+escape(product.icon||'📦')+'</em>')+'<b>'+escape(product.name)+'</b><small>'+money(product.price)+' · '+Number(inventory[product.id]||0)+' in stock</small></span></label>').join('');
    const shell=modal('Replace product','<p class="override-warning">Select the exact order item and replacement product. Nothing changes until replacement payment is confirmed.</p><div class="replace-section"><h3>Product to replace</h3><div class="replace-choice-grid">'+items+'</div></div><div class="replace-section"><h3>Replacement product</h3><div class="replace-choice-grid product-choice-grid">'+replacements+'</div></div><label>Replacement quantity<input name="quantity" type="number" min="1" step="1" value="1" required></label><label>Note / reason<textarea name="note" required placeholder="Required: why was this replaced?"></textarea></label><div class="replacement-payment-box"><h3>Replacement payment</h3><p class="replacement-breakdown">Original item credit: <b class="replacement-credit">₱0.00</b></p><p class="replacement-breakdown">Replacement value: <b class="replacement-value">₱0.00</b></p><p>Amount to pay: <b class="replacement-due">₱0.00</b></p><small class="replacement-even-note">If amount to pay is ₱0.00, seller can confirm without collecting payment.</small><label>Payment type<select name="payType"><option>Cash</option><option>GCash</option><option>Split: Cash + GCash</option></select></label><label class="replace-cash">Cash amount<input name="cash" type="number" min="0" step="0.01"></label><label class="replace-gcash">GCash amount<input name="gcash" type="number" min="0" step="0.01"></label><label class="replace-reference">GCash reference number<input name="reference" maxlength="40"></label></div>',(form,error)=>{
      const note=form.elements.note.value.trim(),oldIndex=Number(form.elements.oldItem?.value),newProduct=productsList().find(product=>product.id===form.elements.newProduct?.value),quantity=Math.max(1,Math.floor(Number(form.elements.quantity.value)||1));
      if(!Number.isInteger(oldIndex)){error.textContent='Choose the product from the order that will be replaced.';return false}
      if(!newProduct){error.textContent='Choose a replacement product.';return false}
      if(!note){error.textContent='Note is required.';return false}
      const orders=read('vslOrders',[]),target=orders.find(item=>item.id===order.id),oldItem=target?.items?.[oldIndex];
      if(!target||!oldItem){error.textContent='Order item was not found.';return false}
      const oldTotal=Number(oldItem.price||0)*Number(oldItem.quantity||1),replacementTotal=Number(newProduct.price||0)*quantity,due=Math.max(0,replacementTotal-oldTotal);
      if(replacementTotal<oldTotal){error.textContent='Replacement must be the same price or higher than the selected item. No lower-price replacement is allowed.';return false}
      const available=Number(read('vslInventory',{})[newProduct.id]||0);
      if(available<quantity){error.textContent='Not enough stock for replacement.';return false}
      const cash=Number(form.elements.cash.value)||0,gcash=Number(form.elements.gcash.value)||0,reference=form.elements.reference.value.trim(),payType=form.elements.payType.value;
      if(due>0&&payType!=='Cash'&&!reference){error.textContent='GCash reference number is required.';return false}
      if(Math.abs(cash+gcash-due)>.01){error.textContent='Payment amount must equal the replacement difference only: '+money(due);return false}
      updateInventory(oldItem.id,oldItem.quantity||1);
      updateInventory(newProduct.id,-quantity);
      target.items.splice(oldIndex,1,{id:newProduct.id,name:newProduct.name,price:newProduct.price,quantity});
      target.updatedAt=Date.now();
      target.replacements=[...(target.replacements||[]),{time:Date.now(),oldItem,newItem:{id:newProduct.id,name:newProduct.name,price:newProduct.price,quantity},note,actor:currentActor(),override,payment:{type:due>0?payType:'No payment required',cash,gcash,reference,total:due,originalCredit:oldTotal,replacementValue:replacementTotal,processedAt:Date.now()}}];
      if(override)target.completedOverrides=[...(target.completedOverrides||[]),override];
      recalc(target);
      Object.assign(target,{status:'Preparing order',paymentStatus:'PAID',processedPayment:{type:due>0?payType:'No payment required',cash,gcash,reference,total:due,originalCredit:oldTotal,replacementValue:replacementTotal,scope:'Replacement difference only',processedAt:Date.now()}});
      write('vslOrders',orders);
      logActivity('Replaced order product',target.transaction+': '+oldItem.name+' to '+newProduct.name+'. Amount paid '+money(due)+' after original credit '+money(oldTotal)+'. Note: '+note+(override?' Override: '+override.note:''));
    });
    const form=shell.querySelector('form'),due=shell.querySelector('.replacement-due'),credit=shell.querySelector('.replacement-credit'),value=shell.querySelector('.replacement-value'),payType=form.elements.payType;
    const refresh=()=>{const picked=form.querySelector('[name="newProduct"]:checked'),oldPicked=form.querySelector('[name="oldItem"]:checked'),quantity=Math.max(1,Math.floor(Number(form.elements.quantity.value)||1)),replacementTotal=(Number(picked?.dataset.price)||0)*quantity,oldItem=order.items?.[Number(oldPicked?.value)],oldTotal=oldItem?Number(oldItem.price||0)*Number(oldItem.quantity||1):0,amount=Math.max(0,replacementTotal-oldTotal);credit.textContent=money(oldTotal);value.textContent=money(replacementTotal);due.textContent=money(amount);due.classList.toggle('invalid-replacement',!!picked&&!!oldPicked&&replacementTotal<oldTotal);if(payType.value==='Cash'){form.elements.cash.value=amount.toFixed(2);form.elements.gcash.value='0.00';form.elements.reference.value=''}else if(payType.value==='GCash'){form.elements.cash.value='0.00';form.elements.gcash.value=amount.toFixed(2)}else if(amount===0){form.elements.cash.value='0.00';form.elements.gcash.value='0.00';form.elements.reference.value=''}form.querySelector('.replace-cash').hidden=amount===0||payType.value==='GCash';form.querySelector('.replace-gcash').hidden=amount===0||payType.value==='Cash';form.querySelector('.replace-reference').hidden=amount===0||payType.value==='Cash';payType.closest('label').hidden=amount===0};
    form.addEventListener('change',refresh);
    form.elements.quantity.addEventListener('input',refresh);
    refresh();
  }

  function refundOrder(order,override=null){
    if(order.status==='Completed'&&!override){completedOverride(order,'refund',approval=>refundOrder(order,approval));return}
    const escape=value=>String(value??'').replace(/[&<>"']/g,match=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[match]));
    const items=(order.items||[]).map((item,index)=>'<label class="replace-choice"><input type="radio" name="refundItem" value="'+index+'" required><span><b>'+escape(item.name)+'</b><small>'+money(Number(item.price||0)*Number(item.quantity||1))+' · Qty '+(item.quantity||1)+'</small></span></label>').join('');
    modal('Refund item','<p class="override-warning">Select the exact product to refund. Stock and sales update only after confirmation.</p><div class="replace-section"><h3>Product to refund</h3><div class="replace-choice-grid">'+items+'</div></div><label>Refund note<textarea name="note" required placeholder="Required: refund reason"></textarea></label>'+managerField(),(form,error)=>{
      const note=form.elements.note.value.trim(),refundIndex=Number(form.elements.refundItem?.value);if(!Number.isInteger(refundIndex)){error.textContent='Choose the product to refund.';return false}
      if(!note){error.textContent='Note is required.';return false}
      if(!override&&needApproval(form)){error.textContent='Manager or supervisor code is required.';return false}
      const orders=read('vslOrders',[]),target=orders.find(item=>item.id===order.id),refundedItem=target?.items?.[refundIndex];if(!target||!refundedItem){error.textContent='Order item was not found.';return false}
      updateInventory(refundedItem.id,refundedItem.quantity||1);
      target.items.splice(refundIndex,1);
      target.refundedItems=[...(target.refundedItems||[]),{time:Date.now(),item:refundedItem,amount:Number(refundedItem.price||0)*Number(refundedItem.quantity||1),note,actor:currentActor(),override}];
      recalc(target);
      Object.assign(target,{status:target.items.length?target.status:'Refunded',paymentStatus:target.items.length?'PAID':'REFUNDED',refund:{time:Date.now(),note,actor:currentActor(),override,item:refundedItem},updatedAt:Date.now()});
      if(override)target.completedOverrides=[...(target.completedOverrides||[]),override];
      write('vslOrders',orders);logActivity('Refunded item',target.transaction+': '+refundedItem.name+' '+money(Number(refundedItem.price||0)*Number(refundedItem.quantity||1))+'. Note: '+note+(override?' Override: '+override.note:''));
    })
  }

  function cancelOrder(order,override=null){
    if(order.status==='Completed'&&!override){completedOverride(order,'cancellation',approval=>cancelOrder(order,approval));return}
    modal('Cancel transaction','<label>Cancel note<textarea name="note" required placeholder="Required: cancellation reason"></textarea></label>'+managerField(),(form,error)=>{
      const note=form.elements.note.value.trim();if(!note){error.textContent='Note is required.';return false}
      if(!override&&needApproval(form)){error.textContent='Manager or supervisor code is required.';return false}
      const orders=read('vslOrders',[]),target=orders.find(item=>item.id===order.id);if(!target)return false;
      if(!target.stockRestored){restoreItems(target.items);target.stockRestored=true}
      Object.assign(target,{status:'Cancelled',paymentStatus:target.paymentStatus==='PAID'?'REFUNDED':target.paymentStatus,cancelled:{time:Date.now(),note,actor:currentActor(),override},updatedAt:Date.now()});
      if(override)target.completedOverrides=[...(target.completedOverrides||[]),override];
      write('vslOrders',orders);logActivity('Cancelled transaction',target.transaction+'. Note: '+note+(override?' Override: '+override.note:''));
    })
  }

  function enhanceOrders(){
    const list=document.querySelector('.seller-order-list');
    if(list&&!list.querySelector('.seller-order-table-head')){
      const head=document.createElement('div');head.className='seller-order-table-head';
      head.innerHTML='<span>Order</span><span>Customer / Pickup</span><span>Items</span><span>Contact / Address</span><span>Status</span><span>Actions</span>';
      list.prepend(head);
    }
    document.querySelectorAll('.seller-order-list .order-card').forEach(card=>{
      const transaction=card.querySelector('.order-head b')?.textContent,order=read('vslOrders',[]).find(item=>item.transaction===transaction);if(!order)return;
      const select=card.querySelector('.order-actions select');
      if(select&&order.status==='Completed'){select.disabled=false;card.querySelector('.order-actions')?.classList.add('locked')}
      if(select&&!select.dataset.opsGuard){select.dataset.opsGuard='1';select.addEventListener('change',event=>{
        const selected=select.value,current=read('vslOrders',[]).find(item=>item.id===order.id);
        if(current?.status==='Completed'&&selected!=='Completed'){
          event.preventDefault();event.stopImmediatePropagation();
          select.value='Completed';
          completedOverride(current,'status change',override=>{
            const orders=read('vslOrders',[]),target=orders.find(item=>item.id===current.id);if(!target)return;
            target.status=selected;target.updatedAt=Date.now();target.completedOverrides=[...(target.completedOverrides||[]),override];
            if(selected==='Cancelled'&&!target.stockRestored){restoreItems(target.items);target.stockRestored=true}
            write('vslOrders',orders);logActivity('Changed completed order status',target.transaction+': Completed to '+selected+'. Override: '+override.note);
          });
        }
      },true)}
      if(card.querySelector('.order-extra-actions'))return;
      const wrap=document.createElement('div');wrap.className='order-extra-actions';
      wrap.innerHTML='<button type="button" class="order-op-button secondary replace-order">Replace product</button><button type="button" class="order-op-button danger refund-order">Refund</button><button type="button" class="order-op-button danger cancel-order-owner">Cancel transaction</button>';
      card.querySelector('.order-actions')?.append(wrap);
      wrap.querySelector('.replace-order').onclick=()=>replaceProduct(order);
      wrap.querySelector('.refund-order').onclick=()=>refundOrder(order);
      wrap.querySelector('.cancel-order-owner').onclick=()=>cancelOrder(order);
    })
  }

  function addPanels(){
    const nav=document.querySelector('aside nav');
    if(nav&&!nav.querySelector('[href="#reports"]')){
      nav.insertAdjacentHTML('beforeend','<a href="#reports">Reports</a><a href="#activity-history">Activity History</a><a href="#settings-security">Settings / Security</a>');
      nav.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;nav.querySelectorAll('a').forEach(item=>item.classList.toggle('active',item===link))});
    }
    if(!document.querySelector('.seller-access-login')){const panel=document.createElement('section');panel.className='seller-ops-panel seller-access-login';panel.innerHTML='<div class="seller-ops-header"><div><p class="eyebrow">ACCESS SESSION</p><h2>Seller user login</h2><p class="access-session-copy">Login determines what this user can view and process.</p></div><div class="active-session"></div></div><form class="seller-login-form"><label>User<select name="user"></select></label><label>Password / access code<input name="code" required type="password" placeholder="Enter password"></label><button>Login</button><button type="button" class="logout-access">Logout</button><p class="ops-error"></p></form>';document.querySelector('main').append(panel);panel.querySelector('form').onsubmit=event=>{event.preventDefault();const form=event.target,user=accessUsers().find(item=>item.id===form.elements.user.value),error=form.querySelector('.ops-error');error.textContent='';if(!user||user.code!==form.elements.code.value.trim()){error.textContent='Incorrect password / access code.';return}write('vslSellerAccessUser',{id:user.id,name:user.name,role:user.role});localStorage.removeItem('vslSellerCurrentRole');localStorage.removeItem('vslSellerActorName');logActivity('Logged in',user.name+' as '+roles[user.role]);form.elements.code.value='';renderPanels(true)};panel.querySelector('.logout-access').onclick=()=>{write('vslSellerAccessUser',{id:'owner',name:'Store Owner',role:'owner'});logActivity('Logged out access session','Returned to Store Owner');renderPanels(true)}}
    document.querySelector('.seller-access-login')?.setAttribute('id','settings-security');
    if(!document.querySelector('.seller-reports')){const panel=document.createElement('section');panel.id='reports';panel.className='seller-ops-panel seller-reports';panel.innerHTML='<div class="seller-ops-header"><div><p class="eyebrow">REPORTS</p><h2>Sales and inventory reports</h2></div></div><div class="report-grid"></div><table class="report-table"><thead><tr><th>Report</th><th>Top items</th><th>Notes</th></tr></thead><tbody></tbody></table>';document.querySelector('main').append(panel)}
    if(!document.querySelector('.seller-access')){const panel=document.createElement('section');panel.className='seller-ops-panel seller-access security-staff-panel';panel.innerHTML='<div class="seller-ops-header"><div><p class="eyebrow">SECURITY</p><h2>Staff access</h2></div></div><div class="seller-access-grid"><form class="seller-access-form"><label>Staff name<input name="name" required placeholder="Full name"></label><label>Position<select name="role"><option value="cashier">Cashier</option><option value="staff">Staff</option><option value="live">Live selling staff</option><option value="supervisor">Supervisor</option><option value="manager">Manager</option></select></label><label>Password / access code<input name="code" required type="password" placeholder="Create staff password"></label><button>Add staff access</button></form><div><h3>Staff list</h3><div class="staff-list"></div></div></div>';document.querySelector('.seller-access-login')?.after(panel);panel.querySelector('form').onsubmit=event=>{event.preventDefault();const form=event.target,staff=read('vslSellerStaff',[]);staff.push({id:'staff-'+Date.now(),name:form.elements.name.value.trim(),role:form.elements.role.value,code:form.elements.code.value.trim(),createdAt:Date.now()});write('vslSellerStaff',staff);logActivity('Added staff access',form.elements.name.value.trim()+' as '+roles[form.elements.role.value]);form.reset();renderPanels(true)}}
    if(!document.querySelector('.seller-activity')){const panel=document.createElement('section');panel.id='activity-history';panel.className='seller-ops-panel seller-activity';panel.innerHTML='<div class="seller-ops-header"><div><p class="eyebrow">ACTIVITY HISTORY</p><h2>Owner activity log</h2></div></div><div class="activity-list"></div>';document.querySelector('main').append(panel)}
  }

  function showSection(hash){
    const target=hash||location.hash||'#overview';
    const map={
      '#overview':['header','#overview'],
      '#live':['header','#live','.product-panel','.seller-orders'],
      '#reports':['#reports'],
      '#activity-history':['#activity-history'],
      '#settings-security':['#settings-security','.commerce-settings','.security-staff-panel','#moderation'],
      '#moderation':['#settings-security','.commerce-settings','.security-staff-panel','#moderation']
    };
    const managed=['header','#overview','#live','.commerce-settings','.product-panel','.seller-orders','#reports','#activity-history','#settings-security','.security-staff-panel','#moderation'];
    managed.forEach(selector=>document.querySelectorAll(selector).forEach(node=>node.classList.add('section-hidden')));
    (map[target]||map['#overview']).forEach(selector=>document.querySelectorAll(selector).forEach(node=>node.classList.remove('section-hidden')));
    document.querySelectorAll('aside nav a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')===target));
  }

  function renderReports(){
    const panel=document.querySelector('.seller-reports');if(!panel)return;
    panel.hidden=!canSeeReports();
    const orders=read('vslOrders',[]),inventory=read('vslInventory',{}),now=new Date(),paid=orders.filter(order=>['PAID','REFUNDED'].includes(order.paymentStatus)||order.status==='Completed'),sales=paid.filter(order=>order.paymentStatus!=='REFUNDED');
    const sameDay=time=>{const d=new Date(time);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate()};
    const sameMonth=time=>{const d=new Date(time);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()};
    const sameYear=time=>new Date(time).getFullYear()===now.getFullYear();
    const total=list=>list.reduce((sum,order)=>sum+Number(order.total||0),0);
    panel.querySelector('.report-grid').innerHTML='<article class="report-card"><strong>'+money(total(sales.filter(order=>sameDay(order.createdAt))))+'</strong><span>Daily sales</span></article><article class="report-card"><strong>'+money(total(sales.filter(order=>sameMonth(order.createdAt))))+'</strong><span>Monthly sales</span></article><article class="report-card"><strong>'+money(total(sales.filter(order=>sameYear(order.createdAt))))+'</strong><span>Yearly sales</span></article><article class="report-card"><strong>'+Object.values(inventory).filter(qty=>Number(qty)<=0).length+'</strong><span>Out of stock</span></article>';
    const sold={};sales.forEach(order=>(order.items||[]).forEach(item=>{sold[item.id]=sold[item.id]||{name:item.name,qty:0,total:0};sold[item.id].qty+=item.quantity||1;sold[item.id].total+=Number(item.price||0)*(item.quantity||1)}));
    const ranked=Object.values(sold).sort((a,b)=>b.qty-a.qty),least=Object.values(sold).sort((a,b)=>a.qty-b.qty),out=productsList().filter(product=>Number(inventory[product.id]||0)<=0).map(product=>product.name),inv=productsList().map(product=>product.name+': '+Number(inventory[product.id]||0));
    panel.querySelector('tbody').innerHTML='<tr><td>Inventory</td><td>'+inv.slice(0,8).join('<br>')+'</td><td>Total product lines: '+productsList().length+'</td></tr><tr><td>Out of stock</td><td>'+(out.join('<br>')||'None')+'</td><td>Updates realtime from order changes.</td></tr><tr><td>Fast selling</td><td>'+(ranked.slice(0,5).map(item=>item.name+' - '+item.qty+' sold').join('<br>')||'No sales yet')+'</td><td>Based on paid sales.</td></tr><tr><td>Least selling</td><td>'+(least.slice(0,5).map(item=>item.name+' - '+item.qty+' sold').join('<br>')||'No sales yet')+'</td><td>Based on paid sales.</td></tr>';
  }

  function renderAccess(){
    const login=document.querySelector('.seller-access-login'),userSelect=login?.querySelector('[name="user"]'),session=currentActor();
    if(userSelect){const previous=userSelect.value;userSelect.innerHTML=accessUsers().map(user=>'<option value="'+user.id+'">'+user.name+' - '+roles[user.role]+'</option>').join('');userSelect.value=[...userSelect.options].some(option=>option.value===previous)?previous:currentSession().id}
    const active=login?.querySelector('.active-session');if(active)active.innerHTML='<b>'+session.name+'</b><small>'+session.label+'</small>';
    const access=document.querySelector('.seller-access');if(access)access.hidden=!canManageStore();
    const activityPanel=document.querySelector('.seller-activity');if(activityPanel)activityPanel.hidden=!canManageStore();
    const staff=read('vslSellerStaff',[]),staffList=document.querySelector('.staff-list');if(staffList)staffList.innerHTML=staff.length?staff.map(item=>'<article class="staff-card"><b>'+item.name+'</b><small>'+roles[item.role]+' · Added '+new Date(item.createdAt).toLocaleString()+'</small></article>').join(''):'<p>No staff access yet.</p>';
    const logs=read('vslActivityHistory',[]),activity=document.querySelector('.activity-list:not(.activity-table-wrap)');if(activity)activity.innerHTML=logs.length?logs.map(item=>'<article class="activity-item"><b>'+item.action+'</b><small>'+new Date(item.time).toLocaleDateString()+' '+new Date(item.time).toLocaleTimeString()+' · '+item.actor+' · '+item.role+'</small><small>'+item.detail+'</small></article>').join(''):'<p>No activity yet.</p>';
  }

  function applyAccessRules(){
    document.body.classList.toggle('owner-locked',!canManageStore());
    document.querySelectorAll('.commerce-settings').forEach(panel=>{let note=panel.querySelector('.access-denied-note');if(!canManageStore()){if(!note){note=document.createElement('div');note.className='access-denied-note';note.textContent='Only the store owner can change payment method and checkout settings.';panel.append(note)}}else note?.remove()});
    document.querySelector('#overview')?.toggleAttribute('hidden',!canSeeReports());
    document.querySelector('aside nav a[href="#reports"]')?.toggleAttribute('hidden',!canSeeReports());
    document.querySelector('aside nav a[href="#activity-history"]')?.toggleAttribute('hidden',!canManageStore());
    if((location.hash==='#reports'&&!canSeeReports())||(location.hash==='#activity-history'&&!canManageStore()))location.hash='#live';
    showSection(location.hash);
  }

  function renderPanels(force=false){
    addPanels();enhanceOrders();renderReports();renderAccess();applyAccessRules();
    if(force)lastSignature='';
  }

  setInterval(()=>{const signature=JSON.stringify({orders:read('vslOrders',[]),inventory:read('vslInventory',{}),role:currentRole(),staff:read('vslSellerStaff',[]),logs:read('vslActivityHistory',[]).slice(0,10)});if(signature!==lastSignature){lastSignature=signature;renderPanels()}else{enhanceOrders();applyAccessRules()}},700);
  window.addEventListener('hashchange',()=>showSection(location.hash));
  renderPanels(true);
})();
