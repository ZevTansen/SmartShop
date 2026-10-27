// Cart state and drawer
const cartBtn = document.getElementById('cart-btn');
const cartClose = document.getElementById('cart-close');
const cartDrawer = document.getElementById('cart-drawer');
const cartBackdrop = document.getElementById('cart-backdrop');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const toastContainer = document.getElementById('toast-container');
const couponInput = document.getElementById('coupon-input');
const couponApply = document.getElementById('coupon-apply');
const couponNote = document.getElementById('coupon-note');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const shippingEl = document.getElementById('shipping');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const cartWarning = document.getElementById('cart-warning');
const checkoutBtn = document.getElementById('checkout-btn');

let cart = [];

// Drawer open/close
function openCart() {
  cartDrawer.classList.remove('translate-x-full');
  cartBackdrop.classList.remove('opacity-0', 'pointer-events-none');
  hideCartWarning();
}

function closeCart() {
  cartDrawer.classList.add('translate-x-full');
  cartBackdrop.classList.add('opacity-0', 'pointer-events-none');
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCart();
});
// End Drawer open/close

// Toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}
// End Toast

// State changes
function addToCart(id) {
  const projected = projectedTotals(id);
  if (projected.total > getBalance()) {
    openCart();
    showCartWarning(projected);
    showToast('Insufficient balance.');
    return false;
  }
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  renderCart();
  openCart();
  showToast('Added to cart');
  return true;
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  showToast('Removed from cart');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  if (delta > 0) {
    const projected = projectedTotals(id, delta);
    if (projected.total > getBalance()) {
      showCartWarning(projected);
      showToast('Insufficient balance.');
      return;
    }
  }
  if (item.qty + delta <= 0) return removeFromCart(id);
  item.qty += delta;
  renderCart();
}
// End State changes

// Overdraft guard
function hideCartWarning() {
  cartWarning.className = 'hidden';
  cartWarning.textContent = '';
}

function showCartWarning(projected) {
  cartWarning.className = 'mt-3 text-xs text-rose-500';
  cartWarning.textContent = `Insufficient balance: total ৳${projected.total.toLocaleString('en-US')} exceeds your ৳${getBalance().toLocaleString('en-US')} balance. Add money and try again.`;
}

function projectedTotals(id, qty = 1) {
  const simulated = cart.map(i => ({ ...i }));
  const existing = simulated.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else simulated.push({ id, qty });
  return calcTotals(simulated);
}
// End Overdraft guard

// Totals engine
function calcTotals(list = cart) {
  const subtotal = list.reduce((sum, i) => sum + getProduct(i.id).priceBDT * i.qty, 0);
  const delivery = !subtotal || subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  const shipping = !subtotal ? 0 : SHIPPING_FEE;
  const discount = appliedCoupon ? Math.round(subtotal * COUPONS[appliedCoupon]) : 0;
  const total = subtotal - discount + delivery + shipping;
  return { subtotal, delivery, shipping, discount, total };
}

function renderTotals() {
  const t = calcTotals();
  subtotalEl.textContent = `৳${t.subtotal.toLocaleString('en-US')}`;
  deliveryEl.textContent = `৳${t.delivery.toLocaleString('en-US')}`;
  shippingEl.textContent = `৳${t.shipping.toLocaleString('en-US')}`;
  discountEl.textContent = `−৳${t.discount.toLocaleString('en-US')}`;
  totalEl.textContent = `৳${t.total.toLocaleString('en-US')}`;
}
// End Totals engine

// Coupon
let appliedCoupon = null;

function showCouponNote(message, tone) {
  couponNote.className = `mt-2 flex items-center gap-2 text-xs ${tone === 'success' ? 'text-emerald-600' : 'text-rose-500'}`;
  couponNote.textContent = message;
  if (tone === 'success') {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'Remove';
    clear.className = 'font-medium underline underline-offset-2';
    clear.addEventListener('click', clearCoupon);
    couponNote.appendChild(clear);
  }
}

function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  if (!code) return;
  if (!COUPONS[code]) {
    showCouponNote('Invalid coupon code.', 'error');
    return;
  }
  appliedCoupon = code;
  const percent = Math.round(COUPONS[code] * 100);
  showCouponNote(`${code} applied: ${percent}% off your subtotal.`, 'success');
  renderTotals();
}

function clearCoupon() {
  appliedCoupon = null;
  couponInput.value = '';
  couponNote.className = 'hidden';
  couponNote.textContent = '';
  renderTotals();
}

couponApply.addEventListener('click', applyCoupon);
couponInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    applyCoupon();
  }
});
// End Coupon

// Line items
function getProduct(id) {
  return products.find(p => p.id === id);
}

function lineItem(item) {
  const product = getProduct(item.id);
  const li = document.createElement('li');
  li.className = 'flex items-center gap-3 py-3';

  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.title;
  img.loading = 'lazy';
  img.className = 'h-12 w-12 rounded-lg object-contain';

  const info = document.createElement('div');
  info.className = 'min-w-0 flex-1';
  const title = document.createElement('p');
  title.className = 'truncate text-sm font-medium text-slate-900';
  title.textContent = product.title;
  const price = document.createElement('p');
  price.className = 'text-xs text-slate-500';
  price.textContent = `৳${product.priceBDT.toLocaleString('en-US')}`;
  info.append(title, price);

  const qtyWrap = document.createElement('div');
  qtyWrap.className = 'flex items-center gap-1';
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.dataset.id = item.id;
  minus.dataset.changeQty = -1;
  minus.setAttribute('aria-label', 'Decrease quantity');
  minus.className = 'h-6 w-6 rounded-md border border-slate-300 text-sm leading-none text-slate-600 transition hover:border-slate-900 hover:text-slate-900';
  minus.textContent = '−';
  const qty = document.createElement('span');
  qty.className = 'w-6 text-center text-sm tabular-nums text-slate-900';
  qty.textContent = item.qty;
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.dataset.id = item.id;
  plus.dataset.changeQty = 1;
  plus.setAttribute('aria-label', 'Increase quantity');
  plus.className = 'h-6 w-6 rounded-md border border-slate-300 text-sm leading-none text-slate-600 transition hover:border-slate-900 hover:text-slate-900';
  plus.textContent = '+';
  qtyWrap.append(minus, qty, plus);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.dataset.id = item.id;
  remove.dataset.remove = '';
  remove.setAttribute('aria-label', 'Remove item');
  remove.className = 'rounded-md p-1 text-xl leading-none text-slate-400 transition hover:text-rose-500';
  remove.textContent = '×';

  li.append(img, info, qtyWrap, remove);
  return li;
}
// End Line items

// Render and events
function renderCart() {
  hideCartWarning();
  if (!cart.length) {
    const empty = document.createElement('li');
    empty.className = 'py-10 text-center text-sm text-slate-400';
    empty.textContent = 'Your cart is empty.';
    cartItems.replaceChildren(empty);
  } else {
    cartItems.replaceChildren(...cart.map(lineItem));
  }
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalQty;
  cartCount.classList.toggle('hidden', totalQty === 0);
  renderTotals();
}

cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if ('remove' in btn.dataset) return removeFromCart(id);
  if ('changeQty' in btn.dataset) return changeQty(id, Number(btn.dataset.changeQty));
});

productsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add-to-cart]');
  if (btn) addToCart(Number(btn.dataset.addToCart));
});

// Checkout
function checkout() {
  if (!cart.length) {
    hideCartWarning();
    showToast('Your cart is empty.');
    return;
  }
  const t = calcTotals();
  if (t.total > getBalance()) {
    showCartWarning(t);
    showToast('Insufficient balance.');
    return;
  }
  setBalance(getBalance() - t.total);
  cart = [];
  clearCoupon();
  hideCartWarning();
  renderCart();
  showToast('Order placed! Thank you for shopping with us.');
}

checkoutBtn.addEventListener('click', checkout);
// End Checkout

renderCart();
// End Render and events
// End Cart state and drawer
