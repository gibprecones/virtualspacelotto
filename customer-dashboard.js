const applications=JSON.parse(localStorage.getItem('vslApplications')||'[]');
const email=localStorage.getItem('vslCustomerSession');
const customer=applications.find(item=>item.email===email);
if(!customer||customer.status!=='APPROVED'){
  location.href='index.html';
}else{
  document.getElementById('sellerName').textContent=customer.name;
}

const projectThemeStyles=document.createElement('link');projectThemeStyles.rel='stylesheet';projectThemeStyles.href='project-theme.css';document.head.append(projectThemeStyles);
const uiPolishStyles=document.createElement('link');uiPolishStyles.rel='stylesheet';uiPolishStyles.href='ui-polish.css';document.head.append(uiPolishStyles);
const sellerSocialScript=document.createElement('script');sellerSocialScript.src='seller-social.js';document.head.append(sellerSocialScript);
const sellerEnhancementScript=document.createElement('script');sellerEnhancementScript.src='seller-live-enhancements.js';document.head.append(sellerEnhancementScript);
const sellerInventoryScript=document.createElement('script');sellerInventoryScript.src='seller-inventory.js';document.head.append(sellerInventoryScript);
const stockLayoutScript=document.createElement('script');stockLayoutScript.src='stock-layout-fix.js';document.head.append(stockLayoutScript);
const sellerCommerceScript=document.createElement('script');sellerCommerceScript.src='seller-commerce.js';document.head.append(sellerCommerceScript);
const sellerLiveBridgeScript=document.createElement('script');sellerLiveBridgeScript.src='seller-live-bridge.js';document.head.append(sellerLiveBridgeScript);
const sellerPaymentUpgradeScript=document.createElement('script');sellerPaymentUpgradeScript.src='seller-payment-upgrades.js';document.head.append(sellerPaymentUpgradeScript);
const paymentSplitFixScript=document.createElement('script');paymentSplitFixScript.src='payment-split-fix.js';document.head.append(paymentSplitFixScript);
const sellerContactScript=document.createElement('script');sellerContactScript.src='seller-contact-display.js';document.head.append(sellerContactScript);
const sellerAudioBridgeScript=document.createElement('script');sellerAudioBridgeScript.src='seller-audio-bridge.js';document.head.append(sellerAudioBridgeScript);
const sellerStabilityScript=document.createElement('script');sellerStabilityScript.src='seller-stability.js';document.head.append(sellerStabilityScript);
const sellerUiFixScript=document.createElement('script');sellerUiFixScript.src='seller-ui-fixes.js';document.head.append(sellerUiFixScript);
const compactOrdersScript=document.createElement('script');compactOrdersScript.src='compact-orders.js';document.head.append(compactOrdersScript);
const dashboardPerformanceScript=document.createElement('script');dashboardPerformanceScript.src='dashboard-performance.js';document.head.append(dashboardPerformanceScript);
const sellerOperationsScript=document.createElement('script');sellerOperationsScript.src='seller-operations.js';document.head.append(sellerOperationsScript);
const sellerChatModerationScript=document.createElement('script');sellerChatModerationScript.src='seller-chat-moderation.js';document.head.append(sellerChatModerationScript);
const sellerSearchToolsScript=document.createElement('script');sellerSearchToolsScript.src='seller-search-tools.js';document.head.append(sellerSearchToolsScript);
const sellerReportChartsScript=document.createElement('script');sellerReportChartsScript.src='seller-report-charts.js';document.head.append(sellerReportChartsScript);
const sellerLiveShopPreviewScript=document.createElement('script');sellerLiveShopPreviewScript.src='seller-live-shop-preview.js';document.head.append(sellerLiveShopPreviewScript);
const chatStyles=document.createElement('link');chatStyles.rel='stylesheet';chatStyles.href='live-chat.css';document.head.append(chatStyles);

const pickerSection=document.querySelector('.number-picker');
const pickerButton=document.querySelector('.open-picker');
const lottoLink=document.createElement('a');
lottoLink.href='https://lottomatik.com/qrmatik?target=/number-picker';
lottoLink.target='_blank';
lottoLink.rel='noopener';
lottoLink.className='open-picker';
lottoLink.textContent='Play Lotto Here';
if(pickerButton)pickerButton.replaceWith(lottoLink);

const getMessages=()=>JSON.parse(localStorage.getItem('vslLiveChat')||'[]');
const readJson=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
const writeJson=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
const money=value=>'₱'+Number(value||0).toLocaleString('en-PH',{minimumFractionDigits:0,maximumFractionDigits:2});
const shortMoney=value=>'₱'+Number(value||0).toLocaleString('en-PH',{minimumFractionDigits:0,maximumFractionDigits:0});
const dateText=time=>new Date(time).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});

function renderChat(){
  const list=document.getElementById('sellerChatMessages');
  if(!list)return;
  const messages=getMessages();
  list.replaceChildren();
  if(!messages.length){
    list.textContent='No customer messages yet.';
    return;
  }
  messages.slice(-20).forEach(message=>{
    const item=document.createElement('p');
    const name=document.createElement('b');
    name.textContent=message.name+': ';
    item.append(name,document.createTextNode(message.text));
    list.append(item);
  });
  list.scrollTop=list.scrollHeight;
}

function addSellerChat(){
  const liveGrid=document.querySelector('.live-grid');
  const chat=document.createElement('aside');
  chat.className='seller-chat';
  chat.innerHTML='<div class="chat-heading"><div><p class="eyebrow">LIVE CHAT</p><h3>Customer messages</h3></div><span>● LIVE</span></div><div id="sellerChatMessages" class="chat-messages"></div><a class="viewer-link" href="viewer-live.html" target="_blank">Open customer live page ↗</a>';
  liveGrid.append(chat);
  renderChat();
  setInterval(renderChat,1000);
}
addSellerChat();

const catalogToolbarStyles=document.createElement('link');catalogToolbarStyles.rel='stylesheet';catalogToolbarStyles.href='catalog-toolbar.css';document.head.append(catalogToolbarStyles);
function organizeCatalogToolbar(){const panel=document.querySelector('.product-panel');if(!panel)return;let toolbar=panel.querySelector('.catalog-toolbar');if(!toolbar){toolbar=document.createElement('div');toolbar.className='catalog-toolbar';panel.querySelector('h2').after(toolbar)}const filter=panel.querySelector('.catalog-filter'),feature=panel.querySelector('.feature-all'),count=panel.querySelector('.catalog-count'),add=panel.querySelector('.add-product');[filter,feature,count,add].forEach(control=>{if(control&&control.parentElement!==toolbar)toolbar.append(control)})}setInterval(organizeCatalogToolbar,300);
const categoryFilterFixStyles=document.createElement('link');categoryFilterFixStyles.rel='stylesheet';categoryFilterFixStyles.href='category-filter-fix.css';document.head.append(categoryFilterFixStyles);
document.addEventListener('click',event=>{const trigger=event.target.closest('.add-category');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();const field=trigger.closest('.category-field'),form=field.closest('.product-form');form.querySelectorAll('.category-field').forEach(other=>{if(other!==field)other.remove()});const row=field.querySelector('.category-row'),selected=row.querySelector('select')?.value||'General';row.innerHTML='<select name="productCategory" hidden><option value="'+selected.replaceAll('"','&quot;')+'" selected>'+selected+'</option></select><div class="new-category-row"><input type="text" maxlength="50" placeholder="Enter category name"><button type="button" class="confirm-category">Add</button><button type="button" class="cancel-category">Cancel</button></div>';const input=row.querySelector('input'),restore=value=>{row.innerHTML='<select name="productCategory">'+categoryOptions(value||selected)+'</select><button type="button" class="add-category">+ Add category</button>'};row.querySelector('.confirm-category').onclick=()=>{const name=input.value.trim();if(!name){input.focus();return}const categories=getCategories();if(!categories.includes(name))categories.push(name);saveCategories(categories);restore(name);refreshCategoryFilter()};row.querySelector('.cancel-category').onclick=()=>restore(selected);input.addEventListener('keydown',keyEvent=>{if(keyEvent.key==='Enter'){keyEvent.preventDefault();row.querySelector('.confirm-category').click()}});input.focus()},true);
const thumbnailFillStyles=document.createElement('link');thumbnailFillStyles.rel='stylesheet';thumbnailFillStyles.href='thumbnail-fill.css';document.head.append(thumbnailFillStyles);
const inlineCategoryStyles=document.createElement('link');inlineCategoryStyles.rel='stylesheet';inlineCategoryStyles.href='category-inline.css';document.head.append(inlineCategoryStyles);document.addEventListener('click',event=>{const trigger=event.target.closest('.add-category');if(!trigger)return;event.preventDefault();event.stopImmediatePropagation();const field=trigger.closest('.category-field'),row=field.querySelector('.category-row');row.innerHTML='<div class="new-category-row"><input type="text" maxlength="50" placeholder="Enter category name" autofocus><button type="button" class="confirm-category">Add</button><button type="button" class="cancel-category">Cancel</button></div>';const input=row.querySelector('input'),restore=()=>{row.innerHTML='<select name="productCategory">'+categoryOptions()+'</select><button type="button" class="add-category">+ Add category</button>'};row.querySelector('.confirm-category').onclick=()=>{const name=input.value.trim();if(!name){input.focus();return}const categories=getCategories();if(!categories.includes(name))categories.push(name);saveCategories(categories);restore();row.querySelector('select').value=name;refreshCategoryFilter()};row.querySelector('.cancel-category').onclick=restore;input.addEventListener('keydown',keyEvent=>{if(keyEvent.key==='Enter'){keyEvent.preventDefault();row.querySelector('.confirm-category').click()}});input.focus()},true);
const lottoVideoStyles=document.createElement('link');lottoVideoStyles.rel='stylesheet';lottoVideoStyles.href='lotto-video-link.css';document.head.append(lottoVideoStyles);const videoLottoLink=document.createElement('a');videoLottoLink.className='video-lotto-link';videoLottoLink.href='https://lottomatik.com/qrmatik?target=/number-picker';videoLottoLink.target='_blank';videoLottoLink.rel='noopener';videoLottoLink.textContent='🎰 Play Lotto Here';document.querySelector('.camera').append(videoLottoLink);
const categoryStyles=document.createElement('link');categoryStyles.rel='stylesheet';categoryStyles.href='product-categories.css';document.head.append(categoryStyles);const getCategories=()=>{try{const saved=JSON.parse(localStorage.getItem('vslProductCategories')||'[]');return saved.length?saved:['General','Supplies','Apparel','Promotional']}catch{return['General','Supplies','Apparel','Promotional']}};const saveCategories=list=>localStorage.setItem('vslProductCategories',JSON.stringify([...new Set(list)]));function categoryOptions(selected='General'){return getCategories().map(category=>'<option value="'+category.replaceAll('"','&quot;')+'" '+(category===selected?'selected':'')+'>'+category+'</option>').join('')}function addCategoryToForm(form){const name=prompt('Enter new category name:')?.trim();if(!name)return;const categories=getCategories();if(!categories.includes(name))categories.push(name);saveCategories(categories);document.querySelectorAll('[name="productCategory"]').forEach(select=>{select.innerHTML=categoryOptions(name)});refreshCategoryFilter()}function enhanceProductForms(){document.querySelectorAll('.product-form').forEach(form=>{if(form.querySelector('[name="productCategory"]'))return;const editing=form.closest('.product-editor'),nameInput=form.querySelector(editing?'[name="editName"]':'[name="name"]'),product=editing?products.find(item=>item.name===nameInput?.value):null;if(product)form.dataset.productId=product.id;const field=document.createElement('label');field.className='category-field';field.innerHTML='<span>Category</span><div class="category-row"><select name="productCategory">'+categoryOptions(product?.category||'General')+'</select><button type="button" class="add-category">+ Add category</button></div>';field.querySelector('.add-category').onclick=()=>addCategoryToForm(form);const photoLabel=form.querySelector('label:has(input[type="file"])')||form.querySelector('input[type="file"]');(photoLabel?.parentElement===form?photoLabel:form.querySelector('.image-preview')).before(field)})}function refreshCategoryFilter(){const panel=document.querySelector('.product-panel');if(!panel)return;let filter=panel.querySelector('.catalog-filter');if(!filter){filter=document.createElement('label');filter.className='catalog-filter';filter.innerHTML='<span>Category:</span><select><option value="ALL">All categories</option></select>';panel.querySelector('.product-grid').before(filter);filter.querySelector('select').onchange=filterProductRows}const select=filter.querySelector('select'),value=select.value;select.innerHTML='<option value="ALL">All categories</option>'+categoryOptions();select.value=[...select.options].some(option=>option.value===value)?value:'ALL';filterProductRows()}function filterProductRows(){const selected=document.querySelector('.catalog-filter select')?.value||'ALL';document.querySelectorAll('.product-card').forEach((card,index)=>{card.hidden=selected!=='ALL'&&(products[index]?.category||'General')!==selected})}document.addEventListener('submit',event=>{const form=event.target;if(!form.matches('.product-form'))return;event.preventDefault();event.stopImmediatePropagation();const editing=!!form.closest('.product-editor'),nameInput=form.querySelector(editing?'[name="editName"]':'[name="name"]'),priceInput=form.querySelector(editing?'[name="editPrice"]':'[name="price"]'),name=nameInput?.value.trim(),price=Number(priceInput?.value),category=form.querySelector('[name="productCategory"]')?.value||'General',photo=form.querySelector('.image-preview img')?.src||'';if(!name||!Number.isFinite(price)||price<=0){alert('Please enter a product name and valid price.');return}if(editing){const product=products.find(item=>item.id===form.dataset.productId);if(!product)return;Object.assign(product,{name,price,category,photo:photo||product.photo||''});const edits=JSON.parse(localStorage.getItem('vslSellerProductEdits')||'{}');edits[product.id]={name,price,category,photo:product.photo||''};localStorage.setItem('vslSellerProductEdits',JSON.stringify(edits));form.closest('.product-modal').remove();enhanceProductCards()}else{const list=JSON.parse(localStorage.getItem('vslSellerProducts')||'[]');list.push({id:'custom-'+Date.now(),name,price,category,icon:'📦',photo});localStorage.setItem('vslSellerProducts',JSON.stringify(list));form.closest('.product-modal').remove();location.reload()}},{capture:true});function enhanceCategories(){enhanceProductForms();products.forEach(product=>{if(!product.category)product.category='General'});document.querySelectorAll('.product-card').forEach((card,index)=>{const product=products[index];if(!product)return;let badge=card.querySelector('.product-category');if(!badge){badge=document.createElement('span');badge.className='product-category';card.querySelector('h3').append(badge)}badge.textContent=product.category||'General'});refreshCategoryFilter()}setInterval(enhanceCategories,450);
const compactProductStyles=document.createElement('link');compactProductStyles.rel='stylesheet';compactProductStyles.href='compact-products.css';document.head.append(compactProductStyles);
const productActionStyles=document.createElement('link');productActionStyles.rel='stylesheet';productActionStyles.href='product-action-spacing.css';document.head.append(productActionStyles);
const editProductStyles=document.createElement('link');editProductStyles.rel='stylesheet';editProductStyles.href='edit-product.css';document.head.append(editProductStyles);function editProduct(product){const modal=document.createElement('div');modal.className='product-modal product-editor';modal.innerHTML='<form class="product-form"><button type="button" class="modal-close">×</button><p class="eyebrow">LIVE STORE</p><h2>Edit product</h2><label>Product name<input name="editName" required value="'+product.name.replaceAll('"','&quot;')+'"></label><label>Selling price (₱)<input name="editPrice" required type="number" min="1" step="0.01" value="'+product.price+'"></label><label>Product photo<input name="editPhoto" type="file" accept="image/*"></label><div class="image-preview">'+(product.photo?'<img src="'+product.photo+'" alt="">':product.icon)+'</div><button class="save-product">Save changes</button></form>';document.body.append(modal);const form=modal.querySelector('form'),preview=form.querySelector('.image-preview');modal.querySelector('.modal-close').onclick=()=>modal.remove();form.querySelector('[name="editPhoto"]').onchange=()=>{const file=form.querySelector('[name="editPhoto"]').files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>preview.innerHTML='<img src="'+reader.result+'" alt="">';reader.readAsDataURL(file)};form.onsubmit=event=>{event.preventDefault();const name=form.querySelector('[name="editName"]').value.trim(),price=Number(form.querySelector('[name="editPrice"]').value),photo=preview.querySelector('img')?.src||product.photo||'';if(!name||price<=0)return;Object.assign(product,{name,price,photo});const edits=JSON.parse(localStorage.getItem('vslSellerProductEdits')||'{}');edits[product.id]={name,price,photo};localStorage.setItem('vslSellerProductEdits',JSON.stringify(edits));modal.remove();enhanceProductCards()}}function enhanceProductCards(){const edits=JSON.parse(localStorage.getItem('vslSellerProductEdits')||'{}');products.forEach(product=>{if(edits[product.id])Object.assign(product,edits[product.id])});document.querySelectorAll('.product-card').forEach((card,index)=>{const product=products[index];if(!product)return;const title=card.querySelector('h3'),badge=title?.querySelector('.product-category');if(title){title.textContent=product.name;if(badge)title.append(badge)}card.querySelector('p').textContent='₱'+product.price.toFixed(2);if(product.photo)card.querySelector('.thumb').innerHTML='<img src="'+product.photo+'" alt="">';if(card.querySelector('.edit-product'))return;const button=document.createElement('button');button.className='edit-product';button.textContent='Edit';button.onclick=()=>editProduct(product);card.append(button)})}setInterval(enhanceProductCards,700);
const featureLayoutStyles=document.createElement('link');featureLayoutStyles.rel='stylesheet';featureLayoutStyles.href='feature-layout-fix.css';document.head.append(featureLayoutStyles);document.addEventListener('click',event=>{const button=event.target.closest('.feature-all');if(!button)return;const current=JSON.parse(localStorage.getItem('vslFeaturedProducts')||'[]');if(!current.length)return;event.preventDefault();event.stopImmediatePropagation();localStorage.setItem('vslFeaturedProducts','[]');localStorage.removeItem('vslPinnedProduct');button.textContent='Feature all products';renderFeaturedTray();document.querySelector('.live-product-overlay')?.remove()},true);
const featureAllStyles=document.createElement('link');featureAllStyles.rel='stylesheet';featureAllStyles.href='all-featured.css';document.head.append(featureAllStyles);function renderFeaturedTray(){document.querySelector('.live-featured-tray')?.remove();const ids=JSON.parse(localStorage.getItem('vslFeaturedProducts')||'[]');if(!ids.length)return;const featured=products.filter(product=>ids.includes(product.id));if(!featured.length)return;const tray=document.createElement('div');tray.className='live-featured-tray';featured.forEach(product=>{const item=document.createElement('div');item.className='live-featured-item';item.innerHTML=(product.photo?'<img src="'+product.photo+'" alt="">':'<span class="live-featured-icon">'+product.icon+'</span>')+'<div><b>'+product.name+'</b><small>₱'+product.price.toFixed(2)+'</small></div>';tray.append(item)});document.querySelector('.camera').append(tray)}setInterval(()=>{const panel=document.querySelector('.product-panel');if(panel&&!panel.querySelector('.feature-all')){const button=document.createElement('button');button.className='feature-all';button.textContent='Feature all products';button.onclick=()=>{const ids=products.map(product=>product.id),current=JSON.parse(localStorage.getItem('vslFeaturedProducts')||'[]');localStorage.setItem('vslFeaturedProducts',current.length?JSON.stringify([]):JSON.stringify(ids));button.textContent=current.length?'Feature all products':'Clear featured products';renderFeaturedTray()};panel.querySelector('h2').after(button)}renderFeaturedTray()},700);
const catalogStyles=document.createElement('link');catalogStyles.rel='stylesheet';catalogStyles.href='catalog-limit.css';document.head.append(catalogStyles);document.addEventListener('click',event=>{if(!event.target.matches('.add-product'))return;if(products.length>=200){event.preventDefault();event.stopImmediatePropagation();alert('Maximum of 200 products reached. Remove or archive an item before adding another product.')}},true);setInterval(()=>{const panel=document.querySelector('.product-panel');if(!panel)return;let count=panel.querySelector('.catalog-count');if(!count){count=document.createElement('span');count.className='catalog-count';panel.querySelector('h2').after(count)}count.textContent=products.length+' / 200 products'},500);
const productFixStyles=document.createElement('link');productFixStyles.rel='stylesheet';productFixStyles.href='product-fix.css';document.head.append(productFixStyles);document.addEventListener('submit',event=>{const form=event.target;if(!form.matches('.product-form'))return;event.preventDefault();event.stopImmediatePropagation();const name=form.querySelector('[name="name"]').value.trim(),price=Number(form.querySelector('[name="price"]').value),photo=form.querySelector('.image-preview img')?.src||'';if(!name||!Number.isFinite(price)||price<=0){alert('Please enter a product name and valid price.');return}const list=JSON.parse(localStorage.getItem('vslSellerProducts')||'[]');list.push({id:'custom-'+Date.now(),name,price,icon:'📦',photo});localStorage.setItem('vslSellerProducts',JSON.stringify(list));form.closest('.product-modal').remove();location.reload()},{capture:true});
const liveUiStyles=document.createElement('link');liveUiStyles.rel='stylesheet';liveUiStyles.href='tiktok-live.css';document.head.append(liveUiStyles);document.querySelector('.camera').addEventListener('click',event=>{if(event.target.closest('.live-product-overlay'))alert('Added to cart (demo). Customers can add this item from the live page.')});
const productManagerStyles=document.createElement('link');productManagerStyles.rel='stylesheet';productManagerStyles.href='product-manager.css';document.head.append(productManagerStyles);

const products=[{id:'p1',name:'Lotto Thermal Paper',price:85,icon:'🧾'},{id:'p2',name:'Seller Cap',price:250,icon:'🧢'},{id:'p3',name:'Promo Poster Set',price:150,icon:'🖼️'}];
const storeStyles=document.createElement('link');storeStyles.rel='stylesheet';storeStyles.href='store.css';document.head.append(storeStyles);
function renderSellerProducts(){const section=document.createElement('section');section.className='product-panel';section.innerHTML='<p class="eyebrow">LIVE STORE</p><h2>Feature products during your live</h2><div class="product-grid"></div>';const grid=section.querySelector('.product-grid'),pinned=localStorage.getItem('vslPinnedProduct');products.forEach(product=>{const card=document.createElement('article');card.className='product-card'+(pinned===product.id?' pinned-product':'');card.innerHTML='<div class="thumb">'+product.icon+'</div><h3>'+product.name+'</h3><p>₱'+product.price.toFixed(2)+'</p>';const button=document.createElement('button');button.className='pin';button.type='button';button.textContent=pinned===product.id?'Pinned on live ✓':'Pin product';button.onclick=()=>{localStorage.setItem('vslPinnedProduct',product.id);document.querySelectorAll('.product-card').forEach((row,index)=>{const isPinned=products[index]?.id===product.id;row.classList.toggle('pinned-product',isPinned);const pin=row.querySelector('.pin');if(pin)pin.textContent=isPinned?'Pinned on live ✓':'Pin product'});showPinnedOnVideo()};card.append(button);grid.append(card)});document.querySelector('main').append(section)}renderSellerProducts();
const savedProducts=JSON.parse(localStorage.getItem('vslSellerProducts')||'[]');products.push(...savedProducts);document.querySelectorAll('.product-panel').forEach(panel=>panel.remove());renderSellerProducts();const addProductButton=document.createElement('button');addProductButton.className='add-product';addProductButton.textContent='+ Add product';document.querySelector('.product-panel h2').after(addProductButton);addProductButton.onclick=showAddProduct;function showAddProduct(){const modal=document.createElement('div');modal.className='product-modal';modal.innerHTML='<form class="product-form"><button type="button" class="modal-close">×</button><p class="eyebrow">LIVE STORE</p><h2>Add product</h2><input name="name" required placeholder="Product name"><input name="price" required type="number" min="1" step="0.01" placeholder="Selling price (₱)"><input name="photo" type="file" accept="image/*"><div class="image-preview">📦</div><button class="save-product">Save product</button></form>';document.body.append(modal);const form=modal.querySelector('form'),preview=modal.querySelector('.image-preview');modal.querySelector('.modal-close').onclick=()=>modal.remove();form.photo.onchange=()=>{const file=form.photo.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{preview.innerHTML='<img src="'+reader.result+'" alt="Product preview">'};reader.readAsDataURL(file)};form.onsubmit=event=>{event.preventDefault();const photo=preview.querySelector('img')?.src||'';const product={id:'custom-'+Date.now(),name:form.name.value.trim(),price:Number(form.price.value),icon:'📦',photo};const list=JSON.parse(localStorage.getItem('vslSellerProducts')||'[]');list.push(product);localStorage.setItem('vslSellerProducts',JSON.stringify(list));products.push(product);modal.remove();document.querySelectorAll('.product-panel').forEach(panel=>panel.remove());renderSellerProducts();document.querySelector('.product-panel h2').after(addProductButton);}};
function showPinnedOnVideo(){document.querySelector('.live-product-overlay')?.remove();document.querySelector('.live-featured-tray')?.remove()}showPinnedOnVideo();setInterval(showPinnedOnVideo,800);

function getOrderGate(){return readJson('vslOrderAcceptance',{enabled:true,updatedAt:Date.now(),updatedBy:'Store Owner'})}
function applyOrderStatusBadge(){
  const badge=document.getElementById('orderToggleStatus');
  if(!badge)return;
  const gate=getOrderGate();
  badge.textContent=gate.enabled?'Online orders open':'Online orders paused';
  badge.classList.toggle('closed',!gate.enabled);
}

function summarizeOrders(){
  const orders=readJson('vslOrders',[]);
  const inventory=readJson('vslInventory',{});
  const now=new Date();
  const sameDay=time=>{const date=new Date(time);return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth()&&date.getDate()===now.getDate()};
  const startOfWeek=new Date(now);startOfWeek.setDate(now.getDate()-now.getDay());startOfWeek.setHours(0,0,0,0);
  const sameWeek=time=>new Date(time)>=startOfWeek;
  const sameMonth=time=>{const date=new Date(time);return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth()};
  const paidOrders=orders.filter(order=>order.paymentStatus==='PAID'||order.status==='Completed');
  const refundedOrders=orders.filter(order=>order.paymentStatus==='REFUNDED'||order.status==='Refunded');
  const todaySales=paidOrders.filter(order=>sameDay(order.createdAt)).reduce((sum,order)=>sum+Number(order.total||0),0);
  const weekSales=paidOrders.filter(order=>sameWeek(order.createdAt)).reduce((sum,order)=>sum+Number(order.total||0),0);
  const monthSales=paidOrders.filter(order=>sameMonth(order.createdAt)).reduce((sum,order)=>sum+Number(order.total||0),0);
  const weekTransactions=orders.filter(order=>sameWeek(order.createdAt)).length;
  const previousOrders=orders.filter(order=>!sameWeek(order.createdAt));
  const previousAverage=previousOrders.length?previousOrders.reduce((sum,order)=>sum+Number(order.total||0),0)/previousOrders.length:0;
  const trend=(value,baseline)=>baseline>0?((value-baseline)/baseline)*100:(value>0?100:0);
  const soldMap={};
  orders.forEach(order=>(order.items||[]).forEach(item=>{soldMap[item.id]=soldMap[item.id]||{name:item.name,qty:0};soldMap[item.id].qty+=Number(item.quantity||1)}));
  const inventoryRows=products.map(product=>({id:product.id,name:product.name,qty:Number(inventory[product.id]??12)}));
  const lowCount=inventoryRows.filter(item=>item.qty>0&&item.qty<=5).length;
  const outCount=inventoryRows.filter(item=>item.qty<=0).length;
  const fastCount=Object.values(soldMap).filter(item=>item.qty>=3).length;
  const activeOrders=orders.filter(order=>!['Completed','Cancelled','Refunded'].includes(order.status)).slice().reverse();
  const alertRows=[];
  if(activeOrders[0])alertRows.push({tone:'info',title:activeOrders[0].transaction+' is ready for action',detail:activeOrders[0].status});
  const lowStockProduct=inventoryRows.find(item=>item.qty>0&&item.qty<=5);
  if(lowStockProduct)alertRows.push({tone:'warn',title:lowStockProduct.name+' is low on stock',detail:lowStockProduct.qty+' item(s) left'});
  if(outCount)alertRows.push({tone:'danger',title:'Out of stock items need restocking',detail:outCount+' product(s) are unavailable'});
  const notifications=activeOrders.slice(0,3).map(order=>({title:order.transaction+' is '+order.status.toLowerCase(),detail:(order.contact?.name||order.customerName||'Customer')+' · '+dateText(order.updatedAt||order.createdAt)}));
  if(!notifications.length)notifications.push({title:'No live order updates yet',detail:'New customer activity will appear here.'});
  const topProducts=Object.values(soldMap).sort((a,b)=>b.qty-a.qty).slice(0,3);
  return {
    todaySales,weekSales,monthSales,weekTransactions,paidTotal:paidOrders.reduce((sum,order)=>sum+Number(order.total||0),0),
    unpaidTotal:orders.filter(order=>order.paymentStatus!=='PAID'&&order.paymentStatus!=='REFUNDED').reduce((sum,order)=>sum+Number(order.total||0),0),
    refundedTotal:refundedOrders.reduce((sum,order)=>sum+Number(order.total||0),0),
    lowCount,outCount,fastCount,activeOrders,alertRows,notifications,topProducts,
    todayTrend:trend(todaySales,previousAverage),weekTrend:trend(weekTransactions,Math.max(1,previousOrders.length)),weekSalesTrend:trend(weekSales,previousAverage*7),monthTrend:trend(monthSales,previousAverage*30)
  };
}

function renderInsights(){
  const orders=readJson('vslOrders',[]),followers=readJson('vslFollowers',[]),viewers=readJson('vslLiveViewers',[]),messages=readJson('vslLiveChat',[]),reactions=readJson('vslLiveReactions',{heart:0,star:0,smile:0,clap:0});
  const now=new Date(),days=[...Array(28)].map((_,index)=>{const date=new Date(now);date.setDate(now.getDate()-(27-index));date.setHours(0,0,0,0);return date});
  const sameDay=(time,date)=>{const value=new Date(time);return value.getFullYear()===date.getFullYear()&&value.getMonth()===date.getMonth()&&value.getDate()===date.getDate()};
  const paidOrders=orders.filter(order=>order.paymentStatus==='PAID'||order.status==='Completed');
  const series=days.map(date=>paidOrders.filter(order=>sameDay(order.createdAt,date)).length+messages.filter(message=>sameDay(message.time||message.createdAt||0,date)).length);
  const activeViewers=viewers.filter(item=>Date.now()-Number(item.seen||0)<24*60*60*1000).length;
  const reactionTotal=Object.values(reactions).reduce((sum,value)=>sum+Number(value||0),0);
  const views=activeViewers+paidOrders.length+messages.length+reactionTotal;
  const engagement=messages.length+reactionTotal+orders.length;
  const follows=followers.length;
  const trend=(value,baseline)=>baseline>0?Math.round(((value-baseline)/baseline)*100):(value>0?100:0);
  const previousOrders=orders.filter(order=>new Date(order.createdAt)<days[0]).length;
  const viewTrend=trend(views,previousOrders||Math.max(1,Math.floor(views*.65)));
  const engagementTrend=trend(engagement,Math.max(1,Math.floor(engagement*.72)));
  const followTrend=trend(follows,Math.max(1,Math.floor(follows*.7)));
  const start=days[0],end=days[27],format=date=>date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const range=document.getElementById('insightsRange');
  if(range)range.textContent='Last 28 days: '+format(start)+' - '+format(end);
  const setMetric=(id,value,change)=>{const node=document.getElementById(id);if(!node)return;node.innerHTML=value.toLocaleString('en-PH')+' <span class="'+(change>=0?'up':'down')+'">'+(change>=0?'↑ ':'↓ ')+Math.abs(change)+'%</span>'};
  setMetric('insightViewsValue',views,viewTrend);
  setMetric('insightEngagementValue',engagement,engagementTrend);
  setMetric('insightFollowsValue',follows,followTrend);
  const chart=document.getElementById('insightsChart');
  if(!chart)return;
  const max=Math.max(1,...series),width=620,height=150,pad=18,plotH=height-pad*2,step=(width-pad*2)/(series.length-1);
  const points=series.map((value,index)=>[pad+index*step,pad+plotH-(value/max)*plotH]);
  const line=points.map(point=>point.join(',')).join(' ');
  const area=pad+','+(height-pad)+' '+line+' '+(width-pad)+','+(height-pad);
  chart.innerHTML='<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Views and engagement trend"><g class="chart-grid"><line x1="'+pad+'" y1="'+pad+'" x2="'+(width-pad)+'" y2="'+pad+'"></line><line x1="'+pad+'" y1="'+(pad+plotH/2)+'" x2="'+(width-pad)+'" y2="'+(pad+plotH/2)+'"></line><line x1="'+pad+'" y1="'+(height-pad)+'" x2="'+(width-pad)+'" y2="'+(height-pad)+'"></line></g><polygon class="chart-area" points="'+area+'"></polygon><polyline class="chart-line" points="'+line+'"></polyline><g class="chart-labels"><text x="'+pad+'" y="'+(height-2)+'">'+format(days[0])+'</text><text x="'+(width/2-22)+'" y="'+(height-2)+'">'+format(days[13])+'</text><text x="'+(width-pad-45)+'" y="'+(height-2)+'">'+format(days[27])+'</text></g></svg>';
}

function renderDashboardCharts(summary){
  document.querySelector('.insights-card')?.remove();
  const pie=document.getElementById('dashboardSalesPie');
  if(pie){
    const paid=Number(summary.paidTotal||0),unpaid=Number(summary.unpaidTotal||0),refunded=Number(summary.refundedTotal||0),total=Math.max(0,paid+unpaid+refunded);
    const rows=[['Paid',paid,'#168142'],['Unpaid',unpaid,'#f0b42c'],['Refunded',refunded,'#8f62e6']].filter(row=>row[1]>0);
    let start=0,segments=[];
    rows.forEach(row=>{const pct=total?row[1]/total*100:0,end=start+pct;segments.push(row[2]+' '+start.toFixed(2)+'% '+end.toFixed(2)+'%');start=end});
    pie.innerHTML=rows.length?'<div class="dashboard-pie" style="background:conic-gradient('+segments.join(',')+')"></div><div class="dashboard-pie-legend">'+rows.map(row=>'<span><i style="background:'+row[2]+'"></i>'+row[0]+' <b>'+money(row[1])+'</b></span>').join('')+'</div>':'<div class="dashboard-pie empty"></div><div class="dashboard-pie-legend"><span>No sales yet</span></div>';
  }
  const graph=document.getElementById('dashboardTopProductGraph');
  if(graph){
    const items=summary.topProducts.slice(0,5),max=Math.max(1,...items.map(item=>item.qty));
    graph.innerHTML=items.length?items.map(item=>'<div class="dashboard-product-bar"><span>'+item.name+'</span><div><i style="width:'+Math.max(8,Math.round(item.qty/max*100))+'%"></i></div><b>'+item.qty+'</b></div>').join(''):'<p>No top product data yet.</p>';
  }
}

function renderDashboardSummary(){
  const summary=summarizeOrders();
  document.getElementById('todaySalesValue').textContent=shortMoney(summary.todaySales);
  document.getElementById('weekTransactionsValue').textContent=summary.weekTransactions.toLocaleString('en-PH');
  document.getElementById('weekSalesValue').textContent=shortMoney(summary.weekSales);
  document.getElementById('monthSalesValue').textContent=shortMoney(summary.monthSales);
  document.getElementById('todaySalesTrend').textContent=(summary.todayTrend>=0?'▲ ':'▼ ')+Math.abs(summary.todayTrend).toFixed(1)+'%';
  document.getElementById('weekTransactionsTrend').textContent=(summary.weekTrend>=0?'▲ ':'▼ ')+Math.abs(summary.weekTrend).toFixed(1)+'%';
  document.getElementById('weekSalesTrend').textContent=(summary.weekSalesTrend>=0?'▲ ':'▼ ')+Math.abs(summary.weekSalesTrend).toFixed(1)+'%';
  document.getElementById('monthSalesTrend').textContent=(summary.monthTrend>=0?'▲ ':'▼ ')+Math.abs(summary.monthTrend).toFixed(1)+'%';
  document.getElementById('inventoryLowCount').textContent=summary.lowCount;
  document.getElementById('inventoryOutCount').textContent=summary.outCount;
  document.getElementById('inventoryFastCount').textContent=summary.fastCount;
  document.getElementById('dashboardLiveCount').textContent=summary.activeOrders.length+' active';
  document.getElementById('paymentPaidValue').textContent=money(summary.paidTotal);
  document.getElementById('paymentUnpaidValue').textContent=money(summary.unpaidTotal);
  document.getElementById('paymentRefundedValue').textContent=money(summary.refundedTotal);

  const liveOrders=document.getElementById('dashboardLiveOrders');
  liveOrders.innerHTML='';
  if(summary.activeOrders.length){
    summary.activeOrders.slice(0,4).forEach(order=>{
      const row=document.createElement('div');
      const statusClass=(order.status||'').toLowerCase().includes('ready')?'ready':(order.status||'').toLowerCase().includes('prepar')?'preparing':(order.status||'').toLowerCase().includes('complete')?'completed':(order.status||'').toLowerCase().includes('cancel')?'cancelled':'confirming';
      row.className='live-order-row';
      row.innerHTML='<span class="live-order-dot '+statusClass+'"></span><div><b>'+order.transaction+'</b><span>'+(order.contact?.name||order.customerName||'Customer')+'</span><small>'+order.status+' · '+dateText(order.updatedAt||order.createdAt)+'</small></div>';
      liveOrders.append(row);
    });
  }else{
    liveOrders.innerHTML='<div class="live-order-row"><span class="live-order-dot completed"></span><div><b>No active orders</b><small>Incoming orders will appear here.</small></div></div>';
  }

  const notes=document.getElementById('dashboardNotificationList');
  notes.innerHTML='';
  summary.notifications.forEach(item=>{
    const row=document.createElement('div');
    row.className='notification-row';
    row.innerHTML='<b>'+item.title+'</b><small>'+item.detail+'</small>';
    notes.append(row);
  });

  const alerts=document.getElementById('dashboardActionAlerts');
  alerts.innerHTML='';
  if(summary.alertRows.length){
    summary.alertRows.forEach(item=>{
      const row=document.createElement('div');
      row.className='action-alert-row';
      row.innerHTML='<span class="alert-dot '+item.tone+'"></span><div><b>'+item.title+'</b><small>'+item.detail+'</small></div>';
      alerts.append(row);
    });
  }else{
    alerts.innerHTML='<div class="action-alert-row"><span class="alert-dot info"></span><div><b>All clear</b><small>No urgent seller action right now.</small></div></div>';
  }

  const topProducts=document.getElementById('dashboardTopProducts');
  topProducts.innerHTML='';
  if(summary.topProducts.length){
    summary.topProducts.forEach(item=>{
      const row=document.createElement('div');
      row.className='top-product-row';
      row.innerHTML='<b>'+item.name+'</b><strong>'+item.qty+'</strong>';
      topProducts.append(row);
    });
  }else{
    topProducts.innerHTML='<div class="top-product-row"><b>No sales yet</b><span>Top products will appear after orders come in.</span></div>';
  }

  applyOrderStatusBadge();
  renderDashboardCharts(summary);
}

function wireDashboardActions(){
  document.getElementById('processPaymentsAction')?.addEventListener('click',()=>location.hash='#live');
  document.getElementById('addProductAction')?.addEventListener('click',()=>document.querySelector('.add-product')?.click());
  document.getElementById('cancelTransactionAction')?.addEventListener('click',()=>{
    const action=document.querySelector('.seller-order-list .cancel-order-owner');
    if(action)action.click();else alert('No cancellable order is available right now.');
  });
  document.getElementById('markCompletedShortcut')?.addEventListener('click',()=>{
    const select=[...document.querySelectorAll('.seller-order-list select')].find(item=>!item.disabled&&[...item.options].some(option=>option.value==='Completed'&&!option.disabled));
    if(select){select.value='Completed';select.dispatchEvent(new Event('change',{bubbles:true}));}else alert('No paid order is ready to mark as completed.');
  });
}
wireDashboardActions();

function renderSellerBuyerPreview(){
  const camera=document.querySelector('.camera');
  if(!camera)return;
  camera.querySelector('.live-featured-tray')?.remove();
  camera.querySelector('.live-product-overlay')?.remove();
  camera.querySelector('.seller-preview-cart')?.remove();
  return;
  camera.querySelector('.live-featured-tray')?.setAttribute('aria-hidden','true');
  const cart=readJson('vslStoreCart',[]);
  const total=cart.reduce((sum,item)=>sum+Number(item.price||0),0);
  let shop=camera.querySelector('.seller-preview-cart');
  if(!shop){
    shop=document.createElement('button');
    shop.type='button';
    shop.className='seller-preview-cart';
    shop.title='Buyer shop preview';
    camera.append(shop);
  }
  shop.innerHTML='<span>🛒</span><b>Shop</b><small>'+cart.length+'</small><em>'+money(total)+'</em>';

  if(!camera.querySelector('.seller-preview-reactions')){
    const reactions=document.createElement('div');
    reactions.className='seller-preview-reactions';
    ['❤️','⭐','😊','👏'].forEach(emoji=>{
      const button=document.createElement('button');
      button.type='button';
      button.textContent=emoji;
      button.title='Buyer reaction preview';
      reactions.append(button);
    });
    camera.append(reactions);
  }
}

function applyCameraMode(mode=localStorage.getItem('vslSellerCameraMode')||'portrait'){
  const camera=document.querySelector('.camera');
  if(!camera)return;
  const normalized=mode==='landscape'?'landscape':'portrait';
  localStorage.setItem('vslSellerCameraMode',normalized);
  camera.classList.toggle('camera-portrait',normalized==='portrait');
  camera.classList.toggle('camera-landscape',normalized==='landscape');
  document.querySelectorAll('[data-camera-mode]').forEach(button=>button.classList.toggle('active',button.dataset.cameraMode===normalized));
}
document.querySelectorAll('[data-camera-mode]').forEach(button=>button.addEventListener('click',()=>applyCameraMode(button.dataset.cameraMode)));
applyCameraMode();

let stream;
const cam=document.getElementById('cam'),empty=document.getElementById('videoEmpty'),badge=document.getElementById('liveBadge'),pickerWindow=document.getElementById('pickerWindow');
pickerWindow.style.display='none';
async function startCam(){try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera API unavailable');if(stream)stream.getTracks().forEach(track=>track.stop());const withTimeout=promise=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Camera request timed out')),15000))]);stream=await withTimeout(navigator.mediaDevices.getUserMedia({video:true,audio:false}));cam.muted=true;cam.autoplay=true;cam.playsInline=true;cam.srcObject=stream;await cam.play().catch(()=>{});empty.style.display='none';badge.textContent='🔴 LIVE';badge.classList.add('live')}catch(error){empty.style.display='grid';badge.textContent='OFFLINE';badge.classList.remove('live');alert('Camera not detected. Click Allow for camera permission, close other apps using the USB camera, then press Start Camera again.')}}
function stopCam(){if(stream)stream.getTracks().forEach(track=>track.stop());cam.srcObject=null;empty.style.display='grid';badge.textContent='OFFLINE';badge.classList.remove('live')}
function openPicker(){pickerWindow.hidden=false;pickerWindow.style.display='grid'}
function closePicker(){pickerWindow.hidden=true;pickerWindow.style.display='none'}
pickerWindow.addEventListener('click',event=>{if(event.target===pickerWindow)closePicker()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePicker()});
function logoutCustomer(){stopCam();localStorage.removeItem('vslCustomerSession');location.href='index.html'}

renderDashboardSummary();
renderSellerBuyerPreview();
setInterval(renderDashboardSummary,1000);
setInterval(renderSellerBuyerPreview,700);





const sellerOrderScheduleScript=document.createElement('script');sellerOrderScheduleScript.src='seller-order-schedule.js';document.head.append(sellerOrderScheduleScript);const sellerOnlineOrderFlowScript=document.createElement('script');sellerOnlineOrderFlowScript.src='seller-online-order-flow.js';document.head.append(sellerOnlineOrderFlowScript);

const sellerPaymentGuardrailScript=document.createElement('script');sellerPaymentGuardrailScript.src='seller-payment-guardrails.js';document.head.append(sellerPaymentGuardrailScript);
