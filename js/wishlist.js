// Wishlist storage and drawer
const wishlistKey = 'smartshop_wishlist';
const wishlistBtn = document.getElementById('wishlist-btn');
const wishlistClose = document.getElementById('wishlist-close');
const wishlistDrawer = document.getElementById('wishlist-drawer');
const wishlistBackdrop = document.getElementById('wishlist-backdrop');
const wishlistItems = document.getElementById('wishlist-items');
const wishlistCount = document.getElementById('wishlist-count');

let wishlist = [];

try {
  const stored = JSON.parse(localStorage.getItem(wishlistKey));
  if (Array.isArray(stored)) wishlist = stored.map(Number).filter(Number.isInteger);
} catch {
  wishlist = [];
}

function saveWishlist() {
  try {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  } catch {}
}

function inWishlist(id) {
  return wishlist.includes(id);
}

function toggleWishlist(id) {
  if (inWishlist(id)) wishlist = wishlist.filter(i => i !== id);
  else wishlist.push(id);
  saveWishlist();
  applyHeartStates();
  renderWishlist();
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(i => i !== id);
  saveWishlist();
  applyHeartStates();
  renderWishlist();
}

// Drawer open/close
function openWishlist() {
  wishlistDrawer.classList.remove('translate-x-full');
  wishlistBackdrop.classList.remove('opacity-0', 'pointer-events-none');
}

function closeWishlist() {
  wishlistDrawer.classList.add('translate-x-full');
  wishlistBackdrop.classList.add('opacity-0', 'pointer-events-none');
}

wishlistBtn.addEventListener('click', () => {
  if (wishlistDrawer.classList.contains('translate-x-full')) openWishlist();
  else closeWishlist();
});

wishlistClose.addEventListener('click', closeWishlist);
wishlistBackdrop.addEventListener('click', closeWishlist);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWishlist();
});
// End Drawer open/close

// Heart states on product cards
function applyHeartStates() {
  document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
    const active = inWishlist(Number(btn.dataset.wishlistToggle));
    btn.setAttribute('aria-pressed', String(active));
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', active ? 'currentColor' : 'none');
    btn.classList.toggle('text-rose-500', active);
    btn.classList.toggle('border-rose-200', active);
    btn.classList.toggle('text-slate-400', !active);
  });
}

productsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wishlist-toggle]');
  if (btn) toggleWishlist(Number(btn.dataset.wishlistToggle));
});

document.addEventListener('products:rendered', () => {
  applyHeartStates();
  renderWishlist();
});
// End Heart states on product cards

// Wishlist line items
function wishlistLine(id) {
  const product = getProduct(id);
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

  const move = document.createElement('button');
  move.type = 'button';
  move.className = 'shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900';
  move.textContent = 'Move to Cart';
  move.addEventListener('click', () => {
    closeWishlist();
    if (addToCart(id)) removeFromWishlist(id);
  });

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Remove from wishlist');
  remove.className = 'rounded-md p-1 text-xl leading-none text-slate-400 transition hover:text-rose-500';
  remove.textContent = '×';
  remove.addEventListener('click', () => removeFromWishlist(id));

  li.append(img, info, move, remove);
  return li;
}
// End Wishlist line items

// Render
function renderWishlist() {
  const known = wishlist.filter(id => getProduct(id));
  if (!known.length) {
    const empty = document.createElement('li');
    empty.className = 'py-10 text-center text-sm text-slate-500';
    empty.textContent = 'Your wishlist is empty.';
    wishlistItems.replaceChildren(empty);
  } else {
    wishlistItems.replaceChildren(...known.map(wishlistLine));
  }
  wishlistCount.textContent = known.length;
  wishlistCount.classList.toggle('hidden', !known.length);
}

renderWishlist();
// End Render
// End Wishlist storage and drawer
