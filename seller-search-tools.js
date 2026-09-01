(()=>{
  const css=document.createElement('link');css.rel='stylesheet';css.href='seller-search-tools.css';document.head.append(css);
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const text=node=>(node?.textContent||'').toLowerCase();

  function productSearch(){
    const toolbar=document.querySelector('.catalog-toolbar'),panel=document.querySelector('.product-panel');if(!toolbar||!panel)return;
    let input=toolbar.querySelector('.product-search');
    if(!input){input=document.createElement('input');input.className='product-search';input.placeholder='Search products...';input.type='search';toolbar.prepend(input)}
    let count=toolbar.querySelector('.product-search-count');if(!count){count=document.createElement('span');count.className='product-search-count';toolbar.append(count)}
    const query=input.value.trim().toLowerCase(),category=panel.querySelector('.catalog-filter select')?.value||'ALL';
    let visible=0,total=0;
    document.querySelectorAll('.product-card').forEach((card,index)=>{
      const product=typeof products!=='undefined'?products[index]:null;if(!product)return;
      total++;
      const categoryMatch=category==='ALL'||(product.category||'General')===category;
      const searchMatch=!query||[product.name,product.category,product.price].join(' ').toLowerCase().includes(query)||text(card).includes(query);
      const show=categoryMatch&&searchMatch;
      card.hidden=!show;if(show)visible++;
    });
    count.textContent=visible+' / '+total+' shown';
  }

  function orderSearch(){
    const panel=document.querySelector('.seller-orders'),list=document.querySelector('.seller-order-list');if(!panel||!list)return;
    let row=panel.querySelector('.order-search-controls');
    if(!row){row=document.createElement('div');row.className='seller-search-row order-search-controls';row.innerHTML='<label>Search orders <input type="search" placeholder="Order, customer, item, phone, address, status..."></label><span class="seller-order-count"></span>';panel.querySelector('h2')?.after(row);row.querySelector('input').addEventListener('input',orderSearch)}
    const query=row.querySelector('input').value.trim().toLowerCase();let visible=0,total=0;
    list.querySelectorAll('.order-card').forEach(card=>{total++;const searchable=[card.querySelector('.order-head b')?.textContent,card.querySelector('.buyer-detail')?.textContent,card.querySelector('.items-detail')?.textContent,card.querySelector('.buyer-contact')?.textContent,card.querySelector('.order-state')?.textContent,card.textContent].join(' ').toLowerCase();const show=!query||searchable.includes(query);card.hidden=!show;if(show)visible++});
    row.querySelector('.seller-order-count').textContent=visible+' / '+total+' orders';
  }

  function activityFilters(){
    const panel=document.querySelector('#activity-history');if(!panel)return;
    let row=panel.querySelector('.activity-filters');
    if(!row){row=document.createElement('div');row.className='seller-search-row activity-filters';row.innerHTML='<label>Search activity <input type="search" placeholder="Action, person, role, detail..."></label><label>Action <select><option value="ALL">All actions</option></select></label><span class="activity-count"></span>';panel.querySelector('.seller-ops-header')?.after(row)}
  }

  function money(value){return '₱'+Number(value||0).toFixed(2)}
  function productsList(){try{return typeof products!=='undefined'&&Array.isArray(products)?products:[]}catch{return[]}}
  function periodMatch(time,period){
    const now=new Date(),date=new Date(time);
    if(period==='day')return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth()&&date.getDate()===now.getDate();
    if(period==='month')return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth();
    if(period==='year')return date.getFullYear()===now.getFullYear();
    return true;
  }
  function reportFilters(){
    const panel=document.querySelector('#reports');if(!panel)return;
    let row=panel.querySelector('.report-filters');
    if(!row){row=document.createElement('div');row.className='seller-search-row report-filters';row.innerHTML='<label>Period <select name="period"><option value="all">All time</option><option value="day">Today</option><option value="month">This month</option><option value="year">This year</option></select></label><label>Report <select name="type"><option value="all">All reports</option><option value="sales">Sales</option><option value="inventory">Inventory</option><option value="out">Out of stock</option><option value="fast">Fast selling</option><option value="least">Least selling</option></select></label><label>Search <input type="search" placeholder="Product, order, category..."></label><span class="report-count"></span>';panel.querySelector('.seller-ops-header')?.after(row)}
  }
  function renderReportTable(){
    const panel=document.querySelector('#reports');if(!panel)return;
    reportFilters();
    const row=panel.querySelector('.report-filters'),period=row.querySelector('[name="period"]').value,type=row.querySelector('[name="type"]').value,query=row.querySelector('input').value.trim().toLowerCase();
    const orders=read('vslOrders',[]),inventory=read('vslInventory',{}),sales=orders.filter(order=>(order.paymentStatus==='PAID'||order.status==='Completed')&&periodMatch(order.createdAt,period));
    const sold={};sales.forEach(order=>(order.items||[]).forEach(item=>{sold[item.id]=sold[item.id]||{product:item.name,category:'',sold:0,sales:0,orders:0,stock:Number(inventory[item.id]||0)};sold[item.id].sold+=item.quantity||1;sold[item.id].sales+=Number(item.price||0)*(item.quantity||1);sold[item.id].orders++}));
    productsList().forEach(product=>{sold[product.id]=sold[product.id]||{product:product.name,category:product.category||'General',sold:0,sales:0,orders:0,stock:Number(inventory[product.id]||0)};sold[product.id].category=product.category||sold[product.id].category||'General';sold[product.id].stock=Number(inventory[product.id]||0)});
    let rows=Object.values(sold).map(item=>({...item,status:item.stock<=0?'Out of stock':'In stock'}));
    if(type==='sales')rows=rows.filter(item=>item.sold>0);
    if(type==='inventory')rows=rows.filter(item=>item.stock>0);
    if(type==='out')rows=rows.filter(item=>item.stock<=0);
    if(type==='fast')rows=rows.filter(item=>item.sold>0).sort((a,b)=>b.sold-a.sold);
    if(type==='least')rows=rows.filter(item=>item.sold>0).sort((a,b)=>a.sold-b.sold);
    if(type==='all')rows=rows.sort((a,b)=>b.sold-a.sold||a.product.localeCompare(b.product));
    rows=rows.filter(item=>!query||[item.product,item.category,item.status,item.sold,item.stock,item.sales].join(' ').toLowerCase().includes(query));
    const totalSales=sales.reduce((sum,order)=>sum+Number(order.total||0),0),outCount=productsList().filter(product=>Number(inventory[product.id]||0)<=0).length;
    const grid=panel.querySelector('.report-grid');if(grid)grid.innerHTML='<article class="report-card"><strong>'+money(totalSales)+'</strong><span>Filtered sales</span></article><article class="report-card"><strong>'+sales.length+'</strong><span>Paid orders</span></article><article class="report-card"><strong>'+productsList().length+'</strong><span>Inventory items</span></article><article class="report-card"><strong>'+outCount+'</strong><span>Out of stock</span></article>';
    let table=panel.querySelector('.report-table-wrap');if(!table){const existing=panel.querySelector('.report-table');table=document.createElement('div');table.className='report-table-wrap';existing?.replaceWith(table)}
    table.innerHTML=rows.length?'<table class="report-table"><thead><tr><th>Product</th><th>Category</th><th>Sold</th><th>Sales</th><th>Stock</th><th>Status</th></tr></thead><tbody>'+rows.map(item=>'<tr><td><b>'+item.product+'</b></td><td>'+item.category+'</td><td>'+item.sold+'</td><td>'+money(item.sales)+'</td><td>'+item.stock+'</td><td>'+item.status+'</td></tr>').join('')+'</tbody></table>':'<p style="padding:14px;margin:0">No report records matched your filters.</p>';
    row.querySelector('.report-count').textContent=rows.length+' records';
  }

  function renderActivityTable(){
    const panel=document.querySelector('#activity-history');if(!panel)return;
    activityFilters();
    const row=panel.querySelector('.activity-filters'),query=row.querySelector('input').value.trim().toLowerCase(),actionFilter=row.querySelector('select').value;
    const logs=read('vslActivityHistory',[]);
    const actions=[...new Set(logs.map(item=>item.action).filter(Boolean))];
    const select=row.querySelector('select'),selected=select.value;
    select.innerHTML='<option value="ALL">All actions</option>'+actions.map(action=>'<option value="'+action.replaceAll('"','&quot;')+'">'+action+'</option>').join('');
    select.value=actions.includes(selected)?selected:'ALL';
    const filtered=logs.filter(item=>(select.value==='ALL'||item.action===select.value)&&(!query||[item.action,item.detail,item.actor,item.role,new Date(item.time).toLocaleString()].join(' ').toLowerCase().includes(query)));
    let list=panel.querySelector('.activity-list');if(!list){list=document.createElement('div');list.className='activity-list';panel.append(list)}
    list.classList.add('activity-table-wrap');
    list.innerHTML=filtered.length?'<table class="activity-table"><thead><tr><th>Date / Time</th><th>User</th><th>Role</th><th>Action</th><th>Details</th></tr></thead><tbody>'+filtered.map(item=>'<tr><td data-label="Date / Time"><b>'+new Date(item.time).toLocaleDateString()+'</b><small>'+new Date(item.time).toLocaleTimeString()+'</small></td><td data-label="User">'+item.actor+'</td><td data-label="Role">'+item.role+'</td><td data-label="Action"><b>'+item.action+'</b></td><td data-label="Details">'+item.detail+'</td></tr>').join('')+'</tbody></table>':'<p>No activity matched your filters.</p>';
    row.querySelector('.activity-count').textContent=filtered.length+' / '+logs.length+' records';
  }

  setInterval(()=>{productSearch();orderSearch();renderActivityTable();renderReportTable()},350);
  productSearch();orderSearch();renderActivityTable();renderReportTable();
})();
