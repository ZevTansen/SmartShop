// Products fetch and render
const productsGrid = document.getElementById('products-grid');
const resultCount = document.getElementById('result-count');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

let products = [];

// Loading skeletons
function skeletonCard() {
  const card = document.createElement('article');
  card.className = 'animate-pulse rounded-xl border border-slate-200 bg-white';
  const img = document.createElement('div');
  img.className = 'h-44 w-full bg-slate-100';
  const body = document.createElement('div');
  body.className = 'space-y-2 p-4';
  const line1 = document.createElement('div');
  line1.className = 'h-3 w-3/4 rounded bg-slate-100';
  const line2 = document.createElement('div');
  line2.className = 'h-3 w-1/2 rounded bg-slate-100';
  const line3 = document.createElement('div');
  line3.className = 'h-9 w-full rounded-lg bg-slate-100';
  body.append(line1, line2, line3);
  card.append(img, body);
  return card;
}

function showSkeletons() {
  productsGrid.replaceChildren(...Array.from({ length: 8 }, skeletonCard));
  if (resultCount) resultCount.textContent = '';
}
// End Loading skeletons

// Error state
function showProductsError() {
  const wrap = document.createElement('div');
  wrap.className = 'sm:col-span-2 lg:col-span-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-center';
  const msg = document.createElement('p');
  msg.className = 'text-sm font-medium text-slate-900';
  msg.textContent = "Couldn't load products.";
  const hint = document.createElement('p');
  hint.className = 'text-sm text-slate-500';
  hint.textContent = 'Check your connection and try again.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.className = 'mt-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900';
  retry.addEventListener('click', loadProducts);
  wrap.append(msg, hint, retry);
  productsGrid.replaceChildren(wrap);
}
// End Error state

// Card builder
const STAR_PATH = 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z';

function starIcon(variant, className) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', className);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', STAR_PATH);
  if (variant === 'filled') {
    svg.setAttribute('fill', 'currentColor');
  } else {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
  }
  svg.appendChild(path);
  return svg;
}

function buildStars(rate) {
  const row = (variant, color) => {
    const r = document.createElement('div');
    r.className = 'flex w-max gap-[2px]';
    for (let i = 0; i < 5; i++) r.appendChild(starIcon(variant, `h-3.5 w-3.5 ${color}`));
    return r;
  };
  const wrap = document.createElement('div');
  wrap.className = 'relative h-3.5';
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', `Rated ${rate} out of 5`);
  wrap.appendChild(row('outline', 'text-slate-300'));
  const percent = Math.min(100, Math.max(0, Math.round(rate / 5 * 10) * 10));
  const overlay = document.createElement('div');
  overlay.className = `absolute inset-y-0 left-0 overflow-hidden w-[${percent}%]`;
  overlay.appendChild(row('filled', 'text-amber-400'));
  wrap.appendChild(overlay);
  return wrap;
}

function createCard(product) {
  const card = document.createElement('article');
  card.className = 'flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300';

  const img = document.createElement('img');
  img.src = product.image;
  img.alt = product.title;
  img.loading = 'lazy';
  img.className = 'h-44 w-full bg-white object-contain p-4';

  const body = document.createElement('div');
  body.className = 'flex flex-1 flex-col p-4';

  const title = document.createElement('h3');
  title.className = 'text-sm font-medium leading-5 text-slate-900 line-clamp-2';
  title.textContent = product.title;

  const ratingRow = document.createElement('div');
  ratingRow.className = 'mt-1.5 flex items-center gap-1.5';
  ratingRow.append(buildStars(product.rating?.rate ?? 0));
  const rate = document.createElement('span');
  rate.className = 'text-xs font-medium text-slate-700';
  rate.textContent = (product.rating?.rate ?? 0).toFixed(1);
  const count = document.createElement('span');
  count.className = 'text-xs text-slate-400';
  count.textContent = `(${product.rating?.count ?? 0})`;
  ratingRow.append(rate, count);

  const price = document.createElement('p');
  price.className = 'mt-2 text-base font-semibold text-slate-900';
  price.textContent = `৳${product.priceBDT.toLocaleString('en-US')}`;

  const actions = document.createElement('div');
  actions.className = 'mt-3 flex items-center gap-2 pt-1';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.dataset.addToCart = product.id;
  addBtn.className = 'flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800';
  addBtn.textContent = 'Add to Cart';

  const heart = document.createElement('button');
  heart.type = 'button';
  heart.dataset.wishlistToggle = product.id;
  heart.setAttribute('aria-label', 'Toggle wishlist');
  heart.setAttribute('aria-pressed', 'false');
  heart.className = 'rounded-lg border border-slate-300 p-2 text-slate-400 transition hover:border-slate-900 hover:text-slate-900';
  const heartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heartSvg.setAttribute('viewBox', '0 0 24 24');
  heartSvg.setAttribute('fill', 'none');
  heartSvg.setAttribute('stroke', 'currentColor');
  heartSvg.setAttribute('stroke-width', '1.5');
  heartSvg.setAttribute('aria-hidden', 'true');
  heartSvg.setAttribute('class', 'h-5 w-5');
  const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  heartPath.setAttribute('stroke-linecap', 'round');
  heartPath.setAttribute('stroke-linejoin', 'round');
  heartPath.setAttribute('d', 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z');
  heartSvg.appendChild(heartPath);
  heart.appendChild(heartSvg);

  actions.append(addBtn, heart);
  body.append(title, ratingRow, price, actions);
  card.append(img, body);
  return card;
}
// End Card builder

// Search
function buildEmptyState() {
  const wrap = document.createElement('div');
  wrap.className = 'sm:col-span-2 lg:col-span-4 flex flex-col items-center rounded-xl border border-dashed border-slate-300 py-16 text-center';
  const msg = document.createElement('p');
  msg.className = 'text-sm font-medium text-slate-900';
  msg.textContent = 'No products found';
  const hint = document.createElement('p');
  hint.className = 'text-sm text-slate-500';
  hint.textContent = 'Try a different keyword.';
  wrap.append(msg, hint);
  return wrap;
}

function getVisibleProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query ? products.filter(p => p.title.toLowerCase().includes(query)) : products;
  return sortProducts(filtered);
}
// End Search

// Sort
function sortProducts(list) {
  const value = sortSelect.value;
  const sorted = [...list];
  if (value === 'price-asc') sorted.sort((a, b) => a.priceBDT - b.priceBDT);
  if (value === 'price-desc') sorted.sort((a, b) => b.priceBDT - a.priceBDT);
  if (value === 'rating') sorted.sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0));
  return sorted;
}
// End Sort

// Render and load
function renderProducts(list) {
  if (!list.length) {
    productsGrid.replaceChildren(buildEmptyState());
    if (resultCount) resultCount.textContent = '0 products';
    document.dispatchEvent(new CustomEvent('products:rendered'));
    return;
  }
  productsGrid.replaceChildren(...list.map(createCard));
  if (resultCount) resultCount.textContent = `${list.length} products`;
  document.dispatchEvent(new CustomEvent('products:rendered'));
}

async function loadProducts() {
  showSkeletons();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    products = data.map(p => ({ ...p, priceBDT: Math.round(p.price * USD_TO_BDT) }));
    renderProducts(products);
  } catch {
    showProductsError();
  }
}

loadProducts();

// Live search
searchInput.addEventListener('input', () => {
  if (products.length) renderProducts(getVisibleProducts());
});
// End Live search

// Sort control
sortSelect.addEventListener('change', () => {
  if (products.length) renderProducts(getVisibleProducts());
});
// End Sort control
// End Render and load
// End Products fetch and render
