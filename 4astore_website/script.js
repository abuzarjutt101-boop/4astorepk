
// script.js - 4ASTORE main logic (uses localStorage)
// Globals
const SITE_KEY = '4astore_site_v2';
const PRODUCTS_KEY = '4astore_products_v2';
const CART_KEY = '4astore_cart_v2';
const ORDERS_KEY = '4astore_orders_v2';
const USERS_KEY = '4astore_users_v2';

// Utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => JSON.parse(localStorage.getItem(k) || 'null');

// Init default site if missing
if(!load(SITE_KEY)){
  save(SITE_KEY,{
    name: "4ASTORE",
    slogan: "Luxury Branded Watches",
    email: "abuzarjutt101@gmail.com",
    phone: "03431465498",
    owner: "Rai Abuzar Ameer",
    hero: "assets/hero.jpg",
    description: "4ASTORE curates premium handcrafted timepieces for the modern connoisseur.",
  });
}

// Sample products (if none)
if(!load(PRODUCTS_KEY)){
  const sample = [
    {id: genId(), title:"Auric Eclipse - Automatic", price:129900, desc:"Gold-plated bezel, sapphire crystal, leather strap", image:"assets/watches/watch1.jpg"},
    {id: genId(), title:"Nocturne Chrono", price:159500, desc:"Chronograph movement, ceramic bezel", image:"assets/watches/watch2.jpg"},
    {id: genId(), title:"Regal Minimal", price:89900, desc:"Slim profile, Swiss movement", image:"assets/watches/watch3.jpg"},
    {id: genId(), title:"Orbit Diver", price:139800, desc:"300m water resistance, luminous markers", image:"assets/watches/watch4.jpg"},
    {id: genId(), title:"Regal Gold", price:179900, desc:"Gold accents with leather strap", image:"assets/watches/watch5.jpg"},
    {id: genId(), title:"Chrono Classic", price:112000, desc:"Vintage inspired chronograph", image:"assets/watches/watch6.jpg"},
  ];
  save(PRODUCTS_KEY, sample);
}

// DOM Utilities for header branding
function renderHeader(){
  const site = load(SITE_KEY);
  if(!site) return;
  $$('.site-name').forEach(el => el.textContent = site.name);
  $$('.site-slogan').forEach(el => el.textContent = site.slogan);
  // hero image if present
  const hero = document.querySelector('.hero');
  if(hero && site.hero) hero.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url('${site.hero}')`;
  // update contact links
  $$('.contact-email').forEach(el => el.textContent = site.email);
  $$('.contact-phone').forEach(el => el.textContent = site.phone);
}
renderHeader();

// CART badge
function updateCartBadge(){
  const cart = load(CART_KEY) || [];
  $$('.cart-count').forEach(el => el.textContent = cart.length);
}
updateCartBadge();

// Home featured products
function renderFeatured(){
  const el = $('#featuredProducts');
  if(!el) return;
  const products = load(PRODUCTS_KEY) || [];
  if(products.length===0){ el.innerHTML = '<p class="muted">No products yet</p>'; return; }
  el.innerHTML = products.slice(0,6).map(p => `
    <div class="product-card">
      <img src="${p.image}" alt="${escapeHtml(p.title)}">
      <h4>${escapeHtml(p.title)}</h4>
      <p class="muted">${escapeHtml(p.desc)}</p>
      <div class="price">PKR ${numberFormat(p.price)}</div>
      <div class="card-actions">
        <button class="small" onclick="viewProduct('${p.id}')">View</button>
        <button class="small" onclick="addToCartById('${p.id}')">Add</button>
      </div>
    </div>
  `).join('');
}
renderFeatured();

// Products page render + datalist for search suggestions
function renderProductsPage(){
  const grid = $('#productGrid');
  const datalist = $('#searchSuggestions');
  if(!grid) return;
  const products = load(PRODUCTS_KEY) || [];
  grid.innerHTML = products.map(p=>`
    <div class="product-card" data-title="${p.title.toLowerCase()}">
      <img src="${p.image}" alt="${escapeHtml(p.title)}">
      <h4>${escapeHtml(p.title)}</h4>
      <p class="muted">${escapeHtml(p.desc)}</p>
      <div class="price">PKR ${numberFormat(p.price)}</div>
      <div class="card-actions">
        <button class="small" onclick="viewProduct('${p.id}')">Details</button>
        <button class="small" onclick="addToCartById('${p.id}')">Add to Cart</button>
      </div>
    </div>
  `).join('');
  // suggestions
  if(datalist){
    datalist.innerHTML = products.map(p=>`<option value="${escapeHtml(p.title)}">`).join('');
  }
}
renderProductsPage();

// Product view
function viewProduct(id){
  const products = load(PRODUCTS_KEY) || [];
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Product not found');
  // store selected and go to product page
  localStorage.setItem('4astore_selected', JSON.stringify(p));
  window.location.href = 'product.html';
}

// On product.html load render selected
if($('#productDetail')){
  const p = JSON.parse(localStorage.getItem('4astore_selected') || 'null');
  if(p){
    $('#productDetail').innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.title)}">
      <div class="product-info">
        <h2>${escapeHtml(p.title)}</h2>
        <p>${escapeHtml(p.desc)}</p>
        <p class="price">PKR ${numberFormat(p.price)}</p>
        <div style="margin-top:12px">
          <button class="btn" onclick='addToCartById("${p.id}")'>Add to Cart</button>
        </div>
      </div>
    `;
  }
}

// Add to cart
function addToCartById(id){
  const products = load(PRODUCTS_KEY) || [];
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Product not found');
  const cart = load(CART_KEY) || [];
  cart.push({...p, qty:1});
  save(CART_KEY, cart);
  updateCartBadge();
  alert('Added to cart: ' + p.title);
}

// Cart page render
if($('#cartItems')){
  const cart = load(CART_KEY) || [];
  const el = $('#cartItems');
  const summary = $('#cartSummary');
  if(cart.length===0){ el.innerHTML = '<p class="muted">Your cart is empty. <a href="products.html">Shop now</a></p>'; summary.innerHTML=''; }
  else {
    el.innerHTML = cart.map((it, idx)=>`
      <div class="cart-item">
        <img src="${it.image}" alt="${escapeHtml(it.title)}">
        <div class="meta">
          <div style="font-weight:700">${escapeHtml(it.title)}</div>
          <div class="muted">PKR ${numberFormat(it.price)}</div>
        </div>
        <div><button class="small" onclick="removeFromCart(${idx})">Remove</button></div>
      </div>
    `).join('');
    const total = cart.reduce((s,i)=>s+Number(i.price||0),0);
    summary.innerHTML = `<div class="cart-summary"><strong>Total:</strong> PKR ${numberFormat(total)}</div>`;
  }
}

// remove from cart
function removeFromCart(index){
  const cart = load(CART_KEY) || [];
  if(index<0||index>=cart.length) return;
  cart.splice(index,1);
  save(CART_KEY,cart);
  updateCartBadge();
  location.reload();
}

// Checkout summary and place order
if($('#checkoutSummary')){
  const cart = load(CART_KEY) || [];
  const out = $('#checkoutSummary');
  if(cart.length===0) out.innerHTML = '<p class="muted">Cart empty. <a href="products.html">Shop</a></p>';
  else{
    out.innerHTML = `<h3>Order Summary</h3><ul>${cart.map(it=>`<li>${escapeHtml(it.title)} — PKR ${numberFormat(it.price)}</li>`).join('')}</ul><p><strong>Total:</strong> PKR ${numberFormat(cart.reduce((s,i)=>s+Number(i.price||0),0))}</p>`;
  }
}

function placeOrder(e){
  if(e) e.preventDefault();
  const cart = load(CART_KEY) || [];
  if(cart.length===0) return alert('Cart is empty');
  // collect form
  const name = $('#checkoutName')?.value?.trim();
  const phone = $('#checkoutPhone')?.value?.trim();
  const email = $('#checkoutEmail')?.value?.trim();
  const province = $('#checkoutProvince')?.value?.trim();
  const city = $('#checkoutCity')?.value?.trim();
  const area = $('#checkoutArea')?.value?.trim();
  const street = $('#checkoutStreet')?.value?.trim();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || 'Cash on Delivery';
  if(!name||!phone||!email||!province||!city||!area||!street) return alert('Please complete all fields');
  const orderId = 'ORD-' + Date.now();
  const order = { orderId, created: new Date().toISOString(), name, phone, email, province, city, area, address:street, payment, items:cart, total: cart.reduce((s,i)=>s+Number(i.price||0),0), status:'Pending' };
  const orders = load(ORDERS_KEY) || [];
  orders.push(order);
  save(ORDERS_KEY, orders);
  // clear cart
  save(CART_KEY, []);
  updateCartBadge();
  if($('#orderSuccess')){ $('#orderSuccess').style.display='block'; $('#orderSuccess').innerHTML = `<h3>Order placed!</h3><p>Your Order ID: <strong>${orderId}</strong></p><p>Track it on Track Order page.</p>`;}
  else alert('Order placed! ID: ' + orderId);
  // redirect to track page optionally
  return false;
}

// Track order function (track-order page)
function trackOrder(){
  const q = $('#orderIdInput')?.value?.trim();
  if(!q) return alert('Enter Order ID');
  const orders = load(ORDERS_KEY) || [];
  const found = orders.find(o=>o.orderId===q);
  const out = $('#orderResult')||$('#trackResult');
  if(!out){ alert(found ? 'Found: ' + found.status : 'Not found'); return; }
  if(!found){ out.style.display='block'; out.innerHTML = `<p class="muted">No order with ID ${q}</p>`; return; }
  out.style.display='block';
  out.innerHTML = `<h3>Order ${escapeHtml(found.orderId)}</h3>
    <p><strong>Status:</strong> ${escapeHtml(found.status)}</p>
    <p><strong>Name:</strong> ${escapeHtml(found.name)}</p>
    <p><strong>Address:</strong> ${escapeHtml(found.address)}, ${escapeHtml(found.area)}, ${escapeHtml(found.city)}</p>
    <p><strong>Payment:</strong> ${escapeHtml(found.payment)}</p>
    <h4>Items</h4><ul>${found.items.map(i=>`<li>${escapeHtml(i.title)} — PKR ${numberFormat(i.price)}</li>`).join('')}</ul>
  `;
}

// Admin panel logic: login + manage products + edit site settings (no-code)
if($('#adminLoginBtn')){ // fallback for different admin variants
  // not used here
}

// Simple admin for admin.html file
if($('#adminPanelMain')){
  // render existing products and orders into admin panel
  function adminRender(){
    const products = load(PRODUCTS_KEY) || [];
    const orders = load(ORDERS_KEY) || [];
    $('#adminProductsList').innerHTML = products.map(p=>`<div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
      <img src="${p.image}" style="width:64px;height:64px;object-fit:cover;border-radius:6px">
      <div style="flex:1"><strong>${escapeHtml(p.title)}</strong><div class="muted">${escapeHtml(p.desc)}</div></div>
      <div><button class="small" onclick='adminEditProduct("${p.id}")'>Edit</button> <button class="small" onclick='adminDeleteProduct("${p.id}")'>Delete</button></div>
    </div>`).join('');
    $('#adminOrdersList').innerHTML = orders.map(o=>`<div style="border:1px solid #222;padding:8px;border-radius:8px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between"><div><strong>${o.orderId}</strong><div class="muted">${o.name} • ${o.city}</div></div>
      <div><span style="background:${o.status==='Delivered'?'#2e7d32':'#b8860b'};padding:6px;border-radius:6px">${o.status}</span></div></div>
      <div style="margin-top:8px"><button class="small" onclick='adminSetStatus("${o.orderId","Delivered"}')'>Mark Delivered</button> <button class="small" onclick='adminSetStatus(\"${o.orderId}\",\"Pending\")'>Mark Pending</button></div>
    </div>`).join('');
  }
  // expose admin functions
  window.adminAddProduct = (title,price,desc,image) => {
    const products = load(PRODUCTS_KEY) || [];
    products.unshift({id:genId(), title, price: Number(price), desc, image});
    save(PRODUCTS_KEY, products);
    renderProductsPage();
    renderFeatured();
    adminRender();
  };
  window.adminDeleteProduct = id => {
    let products = load(PRODUCTS_KEY) || [];
    products = products.filter(p=>p.id!==id);
    save(PRODUCTS_KEY, products);
    renderProductsPage();
    renderFeatured();
    adminRender();
  };
  window.adminEditProduct = id => {
    const products = load(PRODUCTS_KEY) || [];
    const p = products.find(x=>x.id===id);
    if(!p) return alert('not found');
    const newTitle = prompt('Title', p.title);
    if(newTitle==null) return;
    p.title = newTitle;
    save(PRODUCTS_KEY, products);
    renderProductsPage(); renderFeatured(); adminRender();
  };
  window.adminSetStatus = (orderId, status) => {
    const orders = load(ORDERS_KEY) || [];
    const o = orders.find(x=>x.orderId===orderId);
    if(!o) return alert('Order not found');
    o.status = status;
    save(ORDERS_KEY, orders);
    adminRender();
  };
  // site settings editable
  window.adminSaveSiteSettings = () => {
    const site = load(SITE_KEY) || {};
    const name = $('#siteNameInput').value.trim();
    const slogan = $('#siteSloganInput').value.trim();
    const desc = $('#siteDescInput').value.trim();
    const hero = $('#siteHeroInput').value.trim();
    site.name = name || site.name;
    site.slogan = slogan || site.slogan;
    site.description = desc || site.description;
    site.hero = hero || site.hero;
    save(SITE_KEY, site);
    renderHeader();
    alert('Site settings saved');
  };
  adminRender();
}

// helpers
function genId(){ return 'P-'+Math.random().toString(36).slice(2,9).toUpperCase(); }
function numberFormat(n){ return Number(n).toLocaleString(); }
function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
