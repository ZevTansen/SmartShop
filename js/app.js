// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});
// End Mobile menu toggle

// Banner slider
const bannerEl = document.getElementById('banner');
const bannerPrev = document.getElementById('banner-prev');
const bannerNext = document.getElementById('banner-next');
const bannerDots = document.getElementById('banner-dots');
const slides = bannerEl ? [...bannerEl.querySelectorAll('.banner-slide')] : [];

let activeSlide = 0;

function showSlide(index) {
  if (!slides.length) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((el, i) => el.classList.toggle('hidden', i !== activeSlide));
  [...bannerDots.children].forEach((dot, i) => {
    dot.classList.toggle('bg-white', i === activeSlide);
    dot.classList.toggle('bg-white/50', i !== activeSlide);
  });
}

bannerPrev.addEventListener('click', () => showSlide(activeSlide - 1));
bannerNext.addEventListener('click', () => showSlide(activeSlide + 1));
[...bannerDots.children].forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

setInterval(() => showSlide(activeSlide + 1), 4000);
// End Banner slider

// Back to top
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('hidden', window.scrollY < 300);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
// End Back to top
