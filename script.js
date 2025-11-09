/* Shared JS for all pages
   - Mocked products dataset
   - Cart stored in localStorage as 'furni_cart' (array of items {id, name, price, qty, image})
   - Functions: initPage(page), renderFeatured, renderProducts, cart management, simple auth mock
*/

const PRODUCTS = [
  { id: 'p1', name: 'Modern Sofa', category: 'sofa', price: 499.00, image: 'https://www.shutterstock.com/image-photo/interior-light-living-room-grey-600nw-2338829017.jpg' },
  { id: 'p2', name: 'Wooden Chair', category: 'chair', price: 89.99, image: 'https://strongoakswoodshop.com/cdn/shop/files/il_fullxfull.674227139_n7gi_grande.jpg?v=1742329697' },
  { id: 'p3', name: 'Oak Table', category: 'table', price: 249.50, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxPsxOtJnADpcFOCFZ9fSDNleKJtQVw6iTIA&s' },
  { id: 'p4', name: 'Comfort Bed', category: 'bed', price: 699.00, image: 'https://www.shutterstock.com/image-photo/comfortable-bed-lamps-light-spacious-600nw-2317690149.jpg' },
  { id: 'p5', name: 'Lamp Modern', category: 'lighting', price: 39.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjkEH3GI5Hq_hTBDj_XQ9sGPPTIHDRKzppQg&s' },
  { id: 'p6', name: 'Storage Cabinet', category: 'storage', price: 179.00, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQnVeVuUV3kZBvcQcSbVXE508EibCkkgH_mg&s' },
  // more items can be added
];

function readCart() {
  try {
    const raw = localStorage.getItem('furni_cart');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read cart', e);
    return [];
  }
}
function writeCart(cart) { localStorage.setItem('furni_cart', JSON.stringify(cart)); updateNavCartCount(); }

function addToCart(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return alert('Product not found');
  const cart = readCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1, image: prod.image });
  writeCart(cart);
  showToast('Product added to cart');
}

function removeFromCart(productId) {
  let cart = readCart();
  cart = cart.filter(i => i.id !== productId);
  writeCart(cart);
}

function clearCart() {
  if (!confirm('Are you sure you want to clear the cart?')) return;
  writeCart([]);
  showToast('Cart cleared');
}

function getCartTotals() {
  const cart = readCart();
  const items = cart.reduce((s, it) => s + it.qty, 0);
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  return { items, total };
}

function updateNavCartCount() {
  const { items } = getCartTotals();
  $('#nav-cart-count, #nav-cart-count-2, #nav-cart-count-3').text(items);
}

/* simple ephemeral toast */
function showToast(msg) {
  const $t = $(`<div class="position-fixed bottom-0 end-0 p-3" style="z-index:1050"><div class="toast align-items-center text-bg-dark border-0 show"><div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div></div>`);
  $('body').append($t);
  setTimeout(()=> $t.fadeOut(300, ()=> $t.remove()), 2200);
}

/* Page initializers */
function initPage(page) {
  // set years
  $('#year, #year-2, #year-3, #year-4').text(new Date().getFullYear());
  updateNavCartCount();

  if (page === 'home') {
    renderFeatured();
  }
  if (page === 'products') {
    renderProductsPage();
    $('#search-input').on('input', filterProductsFromInputs);
    $('#category-select').on('change', filterProductsFromInputs);
  }
  if (page === 'cart') {
    renderCartPage();
    $('#clear-cart').on('click', ()=> { clearCart(); renderCartPage(); });
    $('#checkout-btn').on('click', ()=> { const modal = new bootstrap.Modal(document.getElementById('checkoutModal')); modal.show(); });
  }
  if (page === 'login') {
    setupLoginForm();
  }
}

/* HOME - featured */
function renderFeatured() {
  const featured = PRODUCTS.slice(0, 3);
  const $row = $('#featured-row').empty();
  featured.forEach(p => {
    const col = `<div class="col-md-4">
      <div class="card product-card">
        <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.name)}">
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(p.name)}</h5>
          <p class="card-text text-muted">$${p.price.toFixed(2)}</p>
          <div class="d-flex gap-2">
            <a href="products.html" class="btn btn-outline-secondary btn-sm">View</a>
            <button class="btn btn-warning btn-sm" onclick="addToCart('${p.id}')">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>`;
    $row.append(col);
  });
}

/* PRODUCTS page render & filtering */
function renderProductsPage() {
  renderProducts(PRODUCTS);
}
function renderProducts(list) {
  const $grid = $('#products-grid').empty();
  if (!list.length) {
    $grid.append('<div class="col-12 text-center py-5"><p class="lead">No products found</p></div>');
    return;
  }
  list.forEach(p => {
    const col = `<div class="col-12 col-md-6 col-lg-4">
      <div class="card product-card h-100">
        <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.name)}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(p.name)}</h5>
          <p class="card-text text-muted mb-3">$${p.price.toFixed(2)}</p>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-outline-secondary" onclick="viewProduct('${p.id}')">View</button>
            <button class="btn btn-warning" onclick="addToCart('${p.id}')">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>`;
    $grid.append(col);
  });
}

function filterProductsFromInputs() {
  const query = ($('#search-input').val() || '').trim().toLowerCase();
  const category = $('#category-select').val();
  let res = PRODUCTS.filter(p => {
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (category && category !== 'all' && p.category !== category) return false;
    return true;
  });
  renderProducts(res);
}