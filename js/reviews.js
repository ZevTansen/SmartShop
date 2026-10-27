// Reviews carousel
const reviewsViewport = document.getElementById('reviews-viewport');
const reviewsTrack = document.getElementById('reviews-track');
const reviewsPrev = document.getElementById('reviews-prev');
const reviewsNext = document.getElementById('reviews-next');
const reviewsDots = document.getElementById('reviews-dots');

let reviews = [];
let active = 0;
let timer = null;

// Review card
function reviewCard(review) {
  const slide = document.createElement('figure');
  slide.className = 'flex min-h-40 flex-col items-center justify-center px-8 py-8 text-center sm:px-14';

  const quote = document.createElement('blockquote');
  quote.className = 'text-sm leading-6 text-slate-600';
  quote.textContent = `“${review.comment}”`;

  const meta = document.createElement('figcaption');
  meta.className = 'mt-4 flex items-center gap-2';
  meta.append(buildStars(review.rating));
  const name = document.createElement('span');
  name.className = 'text-sm font-medium text-slate-900';
  name.textContent = review.name;
  const separator = document.createElement('span');
  separator.className = 'text-xs text-slate-300';
  separator.textContent = '·';
  const date = document.createElement('span');
  date.className = 'text-xs text-slate-400';
  date.textContent = new Date(review.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  meta.append(name, separator, date);

  slide.append(quote, meta);
  return slide;
}
// End Review card

// Dots
function buildDots() {
  reviewsDots.replaceChildren(...reviews.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.className = 'h-2 w-2 rounded-full bg-slate-300 transition';
    dot.addEventListener('click', () => showReview(i));
    return dot;
  }));
}
// End Dots

// Navigation
function showReview(index) {
  active = (index + reviews.length) % reviews.length;
  [...reviewsTrack.children].forEach((el, i) => el.classList.toggle('hidden', i !== active));
  [...reviewsDots.children].forEach((el, i) => {
    el.classList.toggle('bg-slate-900', i === active);
    el.classList.toggle('bg-slate-300', i !== active);
  });
}

reviewsPrev.addEventListener('click', () => showReview(active - 1));
reviewsNext.addEventListener('click', () => showReview(active + 1));
// End Navigation

// Autoplay and load
function startAutoplay() {
  timer = setInterval(() => showReview(active + 1), 4000);
}

function showReviewsError() {
  const wrap = document.createElement('div');
  wrap.className = 'flex min-h-40 flex-col items-center justify-center gap-2 py-8 text-center';
  const msg = document.createElement('p');
  msg.className = 'text-sm font-medium text-slate-900';
  msg.textContent = "Couldn't load reviews.";
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.className = 'mt-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900';
  retry.addEventListener('click', loadReviews);
  wrap.append(msg, retry);
  reviewsTrack.replaceChildren(wrap);
}

async function loadReviews() {
  if (timer) clearInterval(timer);
  try {
    const res = await fetch('data/reviews.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    reviews = await res.json();
    if (!reviews.length) throw new Error('empty');
    reviewsTrack.replaceChildren(...reviews.map(reviewCard));
    buildDots();
    show(0);
    startAutoplay();
  } catch {
    showReviewsError();
  }
}

loadReviews();
// End Autoplay and load
// End Reviews carousel
