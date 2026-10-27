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

// Scrollspy
const spySections = ['home', 'products', 'reviews', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const spyLinks = [...document.querySelectorAll('header ul a')];

function updateSpy() {
  const pos = window.scrollY + 120;
  let currentId = spySections[0] ? spySections[0].id : null;
  spySections.forEach(section => {
    if (section.offsetTop <= pos) currentId = section.id;
  });
  spyLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('text-slate-900', active);
    link.classList.toggle('text-slate-500', !active);
  });
}

window.addEventListener('scroll', updateSpy, { passive: true });
updateSpy();
// End Scrollspy

// Contact form
const contactForm = document.getElementById('contact-form');
const contactName = document.getElementById('contact-name');
const contactEmail = document.getElementById('contact-email');
const contactMessage = document.getElementById('contact-message');
const contactSuccess = document.getElementById('contact-success');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(input, message) {
  input.classList.add('border-rose-500');
  input.classList.remove('border-slate-300');
  const existing = input.parentElement.querySelector('.field-error');
  if (existing) existing.remove();
  const err = document.createElement('p');
  err.className = 'field-error mt-1 text-xs text-rose-500';
  err.textContent = message;
  input.insertAdjacentElement('afterend', err);
}

function clearFieldError(input) {
  input.classList.remove('border-rose-500');
  input.classList.add('border-slate-300');
  const existing = input.parentElement.querySelector('.field-error');
  if (existing) existing.remove();
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const checks = [
    [contactName, contactName.value.trim() ? null : 'Please enter your name.'],
    [contactEmail, emailPattern.test(contactEmail.value.trim()) ? null : 'Please enter a valid email address.'],
    [contactMessage, contactMessage.value.trim() ? null : 'Please enter a message.'],
  ];
  let firstInvalid = null;
  checks.forEach(([input, error]) => {
    if (error) {
      setFieldError(input, error);
      if (!firstInvalid) firstInvalid = input;
    } else {
      clearFieldError(input);
    }
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  contactForm.classList.add('hidden');
  contactSuccess.classList.remove('hidden');
});

[contactName, contactEmail, contactMessage].forEach(input => {
  input.addEventListener('input', () => clearFieldError(input));
});
// End Contact form

// FAQ accordion
const faqButtons = document.querySelectorAll('#faq button');

function closeFaqItem(button) {
  button.nextElementSibling.classList.add('hidden');
  button.querySelector('svg').classList.remove('rotate-180');
}

faqButtons.forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    const wasOpen = !answer.classList.contains('hidden');
    faqButtons.forEach(closeFaqItem);
    if (!wasOpen) {
      answer.classList.remove('hidden');
      button.querySelector('svg').classList.add('rotate-180');
    }
  });
});
// End FAQ accordion
