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