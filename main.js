const root = document.documentElement;

// ---------- Screenshot viewer: each project cover opens all its screenshots ----------
const viewer = document.getElementById('viewer');
const viewerFrame = viewer.querySelector('.viewer-frame');
const viewerImg = viewer.querySelector('.viewer-frame img');
const viewerCaption = viewer.querySelector('figcaption');
const viewerCount = viewer.querySelector('.viewer-count');
const viewerPrev = viewer.querySelector('.viewer-prev');
const viewerNext = viewer.querySelector('.viewer-next');
const viewerThumbs = viewer.querySelector('.viewer-thumbs');
let shots = [];
let shotIndex = 0;

// Portrait screenshots get the phone frame, landscape ones the screen frame
viewerImg.addEventListener('load', () => {
  viewerFrame.classList.toggle('is-phone', viewerImg.naturalHeight > viewerImg.naturalWidth);
  viewerFrame.classList.remove('is-loading');
});

function showShot(i) {
  shotIndex = (i + shots.length) % shots.length;
  const fig = shots[shotIndex];
  const img = fig.querySelector('img');
  viewerFrame.classList.add('is-loading');
  viewerImg.src = img.getAttribute('src');
  viewerImg.alt = img.alt;
  viewerCaption.innerHTML = fig.querySelector('figcaption').innerHTML;
  viewerCount.textContent = `${shotIndex + 1} / ${shots.length}`;
  viewerThumbs.querySelectorAll('button').forEach((b, n) => {
    b.setAttribute('aria-current', String(n === shotIndex));
    if (n === shotIndex) b.scrollIntoView({ block: 'nearest', inline: 'center' });
  });
}

function buildThumbs() {
  viewerThumbs.replaceChildren(...shots.map((fig, n) => {
    const b = document.createElement('button');
    const img = fig.querySelector('img');
    b.setAttribute('aria-label', img.alt);
    b.innerHTML = `<img src="${img.getAttribute('src')}" alt="">`;
    b.addEventListener('click', () => showShot(n));
    return b;
  }));
}

document.querySelectorAll('[data-shots]').forEach((button) => {
  button.addEventListener('click', () => {
    shots = [...button.nextElementSibling.querySelectorAll('figure')];
    buildThumbs();
    viewer.showModal();
    showShot(0);
  });
});

viewerPrev.addEventListener('click', () => showShot(shotIndex - 1));
viewerNext.addEventListener('click', () => showShot(shotIndex + 1));
viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (e) => { if (e.target === viewer || e.target.classList.contains('viewer-stage') || e.target.classList.contains('viewer-figure')) viewer.close(); });
viewer.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showShot(shotIndex - 1);
  if (e.key === 'ArrowRight') showShot(shotIndex + 1);
});
// Swipe on touch screens
let touchX = null;
viewer.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
viewer.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showShot(shotIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ---------- Language (English in the HTML, French in i18n.js) ----------
const textEls = document.querySelectorAll('[data-i18n]');
const hrefEls = document.querySelectorAll('[data-i18n-href]');
const ariaEls = document.querySelectorAll('[data-i18n-aria]');
const altEls = document.querySelectorAll('[data-i18n-alt]');

// Keep the English originals so we can switch back without reloading
const EN = {
  'meta.title': document.title,
  'meta.description': document.querySelector('meta[name="description"]').content,
};
textEls.forEach((el) => { EN[el.dataset.i18n] = el.innerHTML; });
hrefEls.forEach((el) => { EN[el.dataset.i18nHref] = el.getAttribute('href'); });
ariaEls.forEach((el) => { EN[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
altEls.forEach((el) => { EN[el.dataset.i18nAlt] = el.alt; });

const DICTS = { en: EN, fr: window.I18N_FR || {} };

function detectLang() {
  // 1. ?lang=fr in the URL (handy for the link on a French CV)
  const param = new URLSearchParams(location.search).get('lang');
  if (Object.hasOwn(DICTS, param ?? '')) return param;
  // 2. The visitor's last choice
  try { const saved = localStorage.getItem('lang'); if (Object.hasOwn(DICTS, saved ?? '')) return saved; } catch (e) {}
  // 3. The browser language; English for everything that is not French
  const browser = (navigator.languages || [navigator.language]).find((l) => /^(fr|en)/i.test(l));
  return browser && /^fr/i.test(browser) ? 'fr' : 'en';
}

function applyLang(lang) {
  const dict = DICTS[lang];
  const t = (key) => dict[key] ?? EN[key];
  root.lang = lang;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]').content = t('meta.description');
  textEls.forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  hrefEls.forEach((el) => { el.setAttribute('href', t(el.dataset.i18nHref)); });
  ariaEls.forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  altEls.forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
  updateThemeLabel(lang);
  langToggle.textContent = lang === 'fr' ? 'EN' : 'FR';
  langToggle.setAttribute('aria-label', lang === 'fr' ? 'EN, switch to English' : 'FR, passer en français');
}

const langToggle = document.getElementById('lang-toggle');
const themeToggle = document.getElementById('theme-toggle');
let lang = detectLang();
applyLang(lang);

langToggle.addEventListener('click', () => {
  lang = lang === 'fr' ? 'en' : 'fr';
  applyLang(lang);
  try { localStorage.setItem('lang', lang); } catch (e) {}
});

// ---------- Theme: remembers the visitor's choice; otherwise follows the system ----------
function currentTheme() {
  return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function updateThemeLabel(l) {
  const toDark = currentTheme() === 'light';
  const labels = l === 'fr'
    ? (toDark ? 'Passer en thème sombre' : 'Passer en thème clair')
    : (toDark ? 'Switch to dark theme' : 'Switch to light theme');
  themeToggle.setAttribute('aria-label', labels);
}
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateThemeLabel(lang);
});

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Scroll reveal: blocks below the fold fade up once when they come into view ----------
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.section-head, .about, .steps, .card, .job, .stack-row, .work, .contact .btn');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal');
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach((el) => {
    // Anything already on screen at load stays as it is
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.classList.add('reveal-pending');
    observer.observe(el);
  });
}
