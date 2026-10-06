/* ═══════════════════════════════════════════════════
   Tomáš Petera — portfolio
   Sdílený skript pro index.html i prace.html.
   Každá sekce je volitelná — chybí-li, blok se přeskočí.
   Vanilla JS, 0 závislostí.
   ═══════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasHover = matchMedia('(hover: hover)').matches;

document.documentElement.classList.add('js');

let vw = innerWidth, vh = innerHeight;
let heroP = 0;
let mouseNX = 0, mouseNY = 0, mNX = 0, mNY = 0;

/* ═══════════ 1. PRELOADER ═══════════ */
const loader = $('#loader');
const loaderBar = $('#loaderBar');
// Když skript dorazil tak pozdě, že načítací obrazovku už schovala pojistka v CSS (velmi
// pomalé připojení), obsah je dávno vidět a úvodní animace se znovu nespouští.
const POZDE = !!loader && getComputedStyle(loader).visibility === 'hidden';

function bootHero() {
  $$('.hero__title .split').forEach((el, i) => {
    el.style.transform = 'translateY(0)';
    el.style.transitionDelay = (.09 * i) + 's';
  });
  ['.hero__eyebrow', '.hero__sub', '.hero__cta'].forEach((sel, i) => {
    const el = $(sel);
    if (!el) return;
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, 420 + i * 130);
  });
}

if (!REDUCED && !POZDE) {
  $$('.hero__title .split').forEach(el => {
    el.style.transform = 'translateY(110%)';
    el.style.transition = 'transform 1.2s cubic-bezier(.22,1,.36,1)';
  });
  ['.hero__eyebrow', '.hero__sub', '.hero__cta'].forEach(sel => {
    const el = $(sel);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 1s var(--ease), transform 1s cubic-bezier(.22,1,.36,1)';
  });
}

/* Bar dřív běžel na náhodném čísle — doskákal za 0,8 až 2 s bez ohledu na to,
   jak rychle byl web opravdu načtený, a přesně o tu dobu se odkládalo zobrazení
   obsahu. Google tenhle okamžik měří jako LCP. Teď má plnění pevnou délku
   a čeká se navíc jen na fonty, aby text nepřeskočil. Vizuálně stejné. */
if (loader && POZDE) loader.classList.add('done');
else if (loader) {
  const START = performance.now();
  const SPAN  = 420;   // jak dlouho se bar plní
  const CAP   = 900;   // na fonty čekáme nejdéle takhle dlouho

  let fontsOk = !(document.fonts && document.fonts.ready);
  if (!fontsOk) document.fonts.ready.then(() => { fontsOk = true; });

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    if (loaderBar) loaderBar.style.width = '100%';
    setTimeout(() => { loader.classList.add('done'); bootHero(); }, 120);
  };

  const tick = () => {
    if (finished) return;
    const t = performance.now() - START;
    if (loaderBar) loaderBar.style.width = (easeOut(Math.min(1, t / SPAN)) * 100).toFixed(1) + '%';
    if (t >= SPAN && (fontsOk || t >= CAP)) { finish(); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Pojistka: requestAnimationFrame v záložce na pozadí neběží. Ať se stane
  // cokoli, loader nesmí zůstat viset přes obsah.
  setTimeout(finish, 3000);
}

/* Desky prstence, které při načtení nejsou vidět, se stahují až po načtení stránky
   (nebo hned při prvním posunu, protože ten prstenec roztáčí). Na pomalém mobilu
   tak nezabírají linku stylům, písmům a první desce. */
{
  const odlozene = $$('.ring__face img[data-src]');
  if (odlozene.length) {
    let hotovo = false;
    const nacti = () => {
      if (hotovo) return;
      hotovo = true;
      odlozene.forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
    };
    if (document.readyState === 'complete') nacti();
    else addEventListener('load', () => setTimeout(nacti, 150), { once: true });
    addEventListener('scroll', nacti, { passive: true, once: true });
  }
}

/* Start images near the viewport immediately, without waiting for window.load.
   Keep native lazy loading as a no-JS fallback; never download the whole gallery
   in a background queue or hide the embedded preview while the image loads. */
if ('IntersectionObserver' in window) {
  const nearImages = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.loading = 'eager';
      nearImages.unobserve(target);
    });
  }, { rootMargin: '1000px 0px' });
  $$('.item img[loading="lazy"]').forEach(im => nearImages.observe(im));

  // Slides share a sticky stage. Load all six when the section approaches,
  // even when later slides are hidden by the animation.
  const section = $('#showcase');
  if (section) {
    const nearShowcase = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      $$('.shot__media img', section).forEach(im => { im.loading = 'eager'; });
      nearShowcase.disconnect();
    }, { rootMargin: '1400px 0px' });
    nearShowcase.observe(section);
  }
}

/* ═══════════ 2. KURZOR + MAGNETICKÁ TLAČÍTKA ═══════════ */
const dot = $('#cursorDot'), ring = $('#cursorRing');
let mx = vw / 2, my = vh / 2, rx = mx, ry = my;

if (hasHover && dot && ring) {
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    mouseNX = (mx / vw) * 2 - 1;
    mouseNY = (my / vh) * 2 - 1;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  }, { passive: true });

  $$('[data-cursor]').forEach(el => {
    const mode = el.dataset.cursor;
    el.addEventListener('mouseenter', () => ring.classList.add(mode));
    el.addEventListener('mouseleave', () => ring.classList.remove(mode));
  });
}

$$('[data-magnetic]').forEach(el => {
  if (REDUCED || !hasHover) return;
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .22}px, ${(e.clientY - r.top - r.height/2) * .34}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

$$('[data-spot]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ═══════════ 3. NAVIGACE ═══════════ */
const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
if (burger && menu) {
  const setMenu = on => {
    menu.classList.toggle('on', on);
    burger.classList.toggle('on', on);
    document.body.classList.toggle('is-locked', on);
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');     // čtečka obrazovky ohlásí, jestli je menu otevřené
  };
  burger.setAttribute('aria-controls', 'menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('on')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('on')) { setMenu(false); burger.focus(); }
  });
}

/* Odkazy, které se otevírají v novém okně, to oznámí i čtečce obrazovky. */
$$('a[target="_blank"]').forEach(a => {
  if (a.querySelector('.vh')) return;
  const s = document.createElement('span');
  s.className = 'vh';
  s.textContent = (document.documentElement.lang === "en" ? " (opens in a new window)" : " (otevře se v novém okně)");
  a.appendChild(s);
});

/* ═══════════ 4. PÁS LOG ═══════════ */
$$('.marquee__track').forEach(track => track.append(...[...track.children].map(c => {
  const k = c.cloneNode(true);
  k.setAttribute('aria-hidden', 'true');          // kopie je jen kvůli nekonečné smyčce, čtečka ji číst nemá
  return k;
})));

/* ═══════════ 5. CENY — odhalit najetím / klepnutím ═══════════ */
$$('[data-price]').forEach(plan => {
  const price = $('.plan__price', plan);
  const hint = $('.plan__price-hint', plan);
  if (!price) return;
  if (!hasHover && hint) hint.childNodes[hint.childNodes.length - 1].textContent = 'Klepni pro cenu';

  // ovládání z klávesnice: cena je „tlačítko", na které se dá dojít tabulátorem
  price.tabIndex = 0;
  price.setAttribute('role', 'button');
  price.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); price.click(); }
  });

  let timer = 0;
  price.addEventListener('click', () => {
    plan.classList.add('is-shown');
    clearTimeout(timer);
    timer = setTimeout(() => plan.classList.remove('is-shown'), 4000);
  });
});

/* ═══════════ 6. FILTR + LIGHTBOX (jen prace.html) ═══════════ */
const items = $$('.item');
$$('.filter').forEach(b => b.setAttribute('aria-pressed', b.classList.contains('is-on') ? 'true' : 'false'));
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); });
  btn.classList.add('is-on');
  btn.setAttribute('aria-pressed', 'true');
  const f = btn.dataset.filter;
  items.forEach(it => it.classList.toggle('is-hidden', f !== 'all' && !it.dataset.cat.split(' ').includes(f)));
}));

const lb = $('#lb');
if (lb && items.length) {
  const LB_SIZES = '(max-width: 760px) 94vw, min(94vw, 117.33vh, 1200px)';
  const lbSrcset = src => src.replace(/\.webp$/, '-800.webp') + ' 800w, ' + src.replace(/\.webp$/, '-1200.webp') + ' 1200w, ' + src + ' 1600w';
  let lbImg = $('#lbImg');
  const lbTitle = $('#lbTitle'), lbMeta = $('#lbMeta'),
        lbDesc = $('#lbDesc'), lbCount = $('#lbCount'),
        lbLink = $('#lbLink'), lbLinkTxt = $('#lbLinkTxt');
  let lbIndex = 0, imageRequest = 0;
  const visibleItems = () => items.filter(i => !i.classList.contains('is-hidden'));

  const paint = el => {
    const request = ++imageRequest;
    const small = el.querySelector('img');
    // A fresh node keeps an old decoded frame or request out of the next slide.
    const next = new Image();
    next.id = 'lbImg';
    next.alt = el.dataset.title;
    next.width = 1600;
    next.height = 900;
    next.decoding = 'async';
    next.fetchPriority = 'high';
    next.style.backgroundImage = small ? small.style.backgroundImage : '';
    next.onerror = () => {
      if (request !== imageRequest) return;
      next.onerror = null;
      next.removeAttribute('srcset');
      next.removeAttribute('sizes');
      next.src = el.dataset.img;
    };
    next.sizes = LB_SIZES;
    next.srcset = lbSrcset(el.dataset.img);
    next.src = el.dataset.img.replace(/\.webp$/, '-800.webp');
    lbImg.onerror = null;
    lbImg.replaceWith(next);
    lbImg = next;
    lbTitle.textContent = el.dataset.title;
    lbMeta.textContent = el.dataset.meta;
    lbDesc.textContent = el.dataset.desc;
    // odkaz na živý web nebo Instagram jen u projektů, které ho mají (data-url v prace.html)
    if (lbLink) {
      const url = el.dataset.url;
      lbLink.hidden = !url;
      if (url) {
        lbLink.href = url;
        lbLink.dataset.ext = el.dataset.urlType || 'web';
        lbLinkTxt.textContent = el.dataset.urlLabel || (document.documentElement.lang === "en" ? "Visit website" : "Živý web");
      } else {
        lbLink.removeAttribute('href');
      }
    }
    const secondary = $('#lbSecondary');
    if (secondary) {
      secondary.hidden = !el.dataset.urlSecondary;
      if (el.dataset.urlSecondary) {
        secondary.href = el.dataset.urlSecondary;
        secondary.textContent = el.dataset.urlSecondaryLabel + ' ↗';
      } else {
        secondary.removeAttribute('href');
        secondary.textContent = '';
      }
    }
    const list = visibleItems(), i = list.indexOf(el);
    if (lbCount) lbCount.textContent = `${i + 1} / ${list.length}`;

  };
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-labelledby', 'lbTitle');
  let lbOpener = null;                       // odkud se detail otevřel — tam se po zavření vrátí fokus
  const open = el => {
    lbOpener = el;
    lbIndex = visibleItems().indexOf(el);
    paint(el);
    lb.classList.add('on');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    setTimeout(() => { const z = $('#lbClose'); if (z && lb.classList.contains('on')) z.focus(); }, 60);
  };
  const step = dir => {
    const list = visibleItems();
    if (!list.length) return;
    lbIndex = (lbIndex + dir + list.length) % list.length;
    paint(list[lbIndex]);
  };
  const close = () => {
    imageRequest++;
    lb.classList.remove('on');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lbOpener && document.contains(lbOpener)) lbOpener.focus({ preventScroll: true });
    lbOpener = null;
  };
  // tabulátor zůstává uvnitř otevřeného detailu
  lb.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !lb.classList.contains('on')) return;
    const f = $$('button, a[href]', lb).filter(x => !x.hidden && x.offsetParent !== null);
    if (!f.length) return;
    const prvni = f[0], posledni = f[f.length - 1];
    if (e.shiftKey && document.activeElement === prvni) { e.preventDefault(); posledni.focus(); }
    else if (!e.shiftKey && document.activeElement === posledni) { e.preventDefault(); prvni.focus(); }
    else if (!lb.contains(document.activeElement)) { e.preventDefault(); prvni.focus(); }
  });

  items.forEach(el => {
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', (document.documentElement.lang === "en" ? "Open project " : "Otevřít projekt ") + el.dataset.title);
    el.addEventListener('click', () => open(el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
  });
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  // Na dotykových zařízeních se listuje přejetím prstem doleva nebo doprava.
  // Svislý pohyb a dva prsty (zvětšení) necháváme být.
  const lbBox = $('.lb__box');
  let tx = 0, ty = 0, tahne = false;
  const pustit = () => { tahne = false; if (lbBox) { lbBox.style.transition = ''; lbBox.style.transform = ''; } };
  lb.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { pustit(); return; }
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tahne = true;
    if (lbBox) lbBox.style.transition = 'none';
  }, { passive: true });
  lb.addEventListener('touchmove', e => {
    if (!tahne || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
    if (lbBox && Math.abs(dx) > Math.abs(dy)) lbBox.style.transform = `translateX(${(dx * .35).toFixed(1)}px)`;
  }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (!tahne) return;
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    pustit();
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
  }, { passive: true });
  lb.addEventListener('touchcancel', pustit, { passive: true });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/* Email format checks and opt-in typo correction. No address is sent to a lookup service.
   Syntax checks cannot prove that a mailbox exists or belongs to the visitor. */
const contactEmail = document.querySelector('form.form input[name="email"]');
if (contactEmail) {
  const en = document.documentElement.lang === 'en';
  const hint = document.getElementById('emailHelp');
  const corrections = {
    'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com',
    'gmail.con': 'gmail.com', 'gmail.cmo': 'gmail.com', 'gnail.com': 'gmail.com',
    'seznam.czz': 'seznam.cz', 'seznma.cz': 'seznam.cz', 'seznam.zc': 'seznam.cz',
    'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com',
    'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com',
    'yahoo.con': 'yahoo.com', 'icloud.con': 'icloud.com'
  };
  function validateEmail() {
    contactEmail.setCustomValidity('');
    const value = contactEmail.value;
    if (!value) return; // The existing required attribute handles empty input.
    const parts = value.split('@');
    const local = parts[0];
    const domain = parts[1] || '';
    const labels = domain.split('.');
    const invalid = parts.length !== 2 || local.length > 64 || value.length > 254 ||
      local.startsWith('.') || local.endsWith('.') || local.includes('..') ||
      labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) ||
      !/[a-z]/i.test(labels[labels.length - 1]);
    if (invalid || contactEmail.validity.typeMismatch) contactEmail.setCustomValidity(en
      ? 'Enter a complete email address, for example name@company.com.'
      : 'Zadej úplnou e-mailovou adresu, například jmeno@firma.cz.');
  }
  function hideSuggestion() {
    if (hint) { hint.hidden = true; hint.textContent = ''; }
  }
  contactEmail.addEventListener('input', () => { hideSuggestion(); validateEmail(); });
  contactEmail.addEventListener('blur', () => {
    contactEmail.value = contactEmail.value.trim();
    validateEmail();
    hideSuggestion();
    if (!hint || !contactEmail.validity.valid) return;
    const at = contactEmail.value.lastIndexOf('@');
    const suggestedDomain = corrections[contactEmail.value.slice(at + 1).toLowerCase()];
    if (!suggestedDomain) return;
    const address = contactEmail.value.slice(0, at + 1) + suggestedDomain;
    hint.append(document.createTextNode(en ? 'Possible typo. Did you mean ' : 'Možný překlep. Nemyslíš '));
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = address + '?';
    button.style.cssText = 'color:var(--neon);text-decoration:underline;overflow-wrap:anywhere';
    button.addEventListener('click', () => {
      contactEmail.value = address;
      contactEmail.dispatchEvent(new Event('input', { bubbles: true }));
      contactEmail.dispatchEvent(new Event('change', { bubbles: true }));
      contactEmail.focus();
    });
    hint.append(button);
    hint.hidden = false;
  });
  contactEmail.form.addEventListener('submit', e => {
    contactEmail.value = contactEmail.value.trim();
    validateEmail();
    if (!contactEmail.validity.valid) {
      e.preventDefault();
      contactEmail.reportValidity();
    }
  });
}

/* ═══════════ 7. PŘÍLOHY V POPTÁVCE ═══════════ */
const LIMIT = 10 * 1024 * 1024;
const fileInput = $('#attach');
const fileTxt = $('#fileTxt');
const IDLE_TXT = (document.documentElement.lang === "en" ? "Attach your questionnaire or project files" : "Přiložit vyplněný dotazník nebo podklady");

if (fileInput && fileTxt) {
  const wrap = fileInput.closest('.file');

  fileInput.addEventListener('change', () => {
    const files = [...fileInput.files];
    if (!files.length) {
      wrap.classList.remove('has-file', 'is-over');
      fileTxt.textContent = IDLE_TXT;
      return;
    }
    const total = files.reduce((s, f) => s + f.size, 0);
    const mb = (total / 1048576).toFixed(1);
    const over = total > LIMIT;

    wrap.classList.add('has-file');
    wrap.classList.toggle('is-over', over);

    if (over) fileTxt.textContent = (document.documentElement.lang === "en" ? `Attachments total ${mb} MB — the limit is 10 MB` : `Přílohy mají ${mb} MB — limit je 10 MB`);
    else if (files.length === 1) fileTxt.textContent = `${files[0].name} · ${mb} MB`;
    else fileTxt.textContent = (document.documentElement.lang === "en" ? `${files.length} files · ${mb} MB` : `${files.length} ${files.length < 5 ? 'soubory' : 'souborů'} · ${mb} MB`);
  });

  fileInput.form.addEventListener('submit', e => {
    if (!wrap.classList.contains('is-over')) return;
    e.preventDefault();
    wrap.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' });
  });
}

/* ═══════════ 8. ODHALENÍ PŘI SCROLLU ═══════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    setTimeout(() => e.target.classList.add('in'), i * 80);
    io.unobserve(e.target);
  });
}, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach(el => io.observe(el));

// Pojistka: kdyby observer nedoručil, po 5 s ukaž, co je na obrazovce.
setTimeout(() => {
  $$('.reveal:not(.in)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) el.classList.add('in');
  });
}, 5000);

/* ═══════════ 9. HODINY, ROK, KOTVY ═══════════ */
const clock = $('#clock');
if (clock) {
  // Formátovač času se vytváří jen jednou a až po načtení stránky: jeho první použití
  // stojí na pomalém mobilu desítky milisekund a hodiny jsou až v patičce.
  let fmt = null;
  const paint = () => {
    if (!fmt) {
      try { fmt = new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit' }); }
      catch (e) { fmt = { format: d => d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) }; }
    }
    clock.textContent = fmt.format(new Date());
  };
  const startClock = () => { paint(); setInterval(paint, 15000); };
  if (document.readyState === 'complete') setTimeout(startClock, 600);
  else addEventListener('load', () => setTimeout(startClock, 600), { once: true });
}
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const t = document.querySelector(id);
  if (!t) return;
  e.preventDefault();
  scrollTo({ top: t.getBoundingClientRect().top + scrollY - 60, behavior: REDUCED ? 'auto' : 'smooth' });
}));

/* ═══════════ 10. PRVKY PRO SMYČKU ═══════════ */
const progressBar = $('#progressBar');
const heroSection = $('#hero');
const heroContent = $('#heroContent');
const heroReveal = $('#heroReveal');
const heroHint = $('#heroHint');
const ringWrap = $('#ringWrap');
const ringEl = $('#ring');
const faces = $$('.ring__face');
const timeline = $('#timeline');
const timelineFill = $('#timelineFill');
const timelineSteps = $$('.timeline .step');
const showcase = $('#showcase');
const shots = $$('.showcase .shot');
const showcaseFill = $('#showcaseFill');
const flow = $('#flow');
const guide = $('#guide');
const guidePath = $('#guidePath');
const guideDot = $('#guideDot');

/* orientace — boční tečky, zvýraznění v hlavičce, zpět nahoru */
const dotsNav = $('#dots');
const dotLinks = $$('#dots a');
const toTop = $('#toTop');
const navLinks = $$('.nav__links a[href^="#"]');
const sections = dotLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
let activeIdx = -1;

if (toTop) toTop.addEventListener('click', () =>
  scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));

let heroRange = 1, heroTop = 0, guideLen = 0, lastRot = 999;

/* Pozice sekcí v dokumentu se počítají jednou v measure().
   Animace pak běží na tlumené hodnotě scrollu (sySmooth) místo
   na scrollY — díky tomu doplouvají a netrhají se při zastavení.
   Sticky pozicování zůstává nativní, takže se nic nerozjede. */
let sySmooth = scrollY, smoothInit = false;
let showcaseTop = 0, showcaseH = 0;
let timelineTop = 0, timelineH = 0;
let flowTop = 0, flowH = 0;
let sectionTops = [];            // pozice sekcí pro boční tečky (čtou se jen v measure)

/* vlnovka přes celou šířku — vede od klientů dolů k formuláři */
let lastGuideW = 0, lastGuideH = 0;
let guideX = [], guideY = [], guideS = [];   // body čáry a délka od začátku k nim (pro polohu tečky)

function buildGuide() {
  if (!flow || !guide || !guidePath) return;
  const h = flow.offsetHeight, w = flow.offsetWidth;
  if (!h || !w) return;
  // ResizeObserver umí střílet často — přepočítávej jen při skutečné změně,
  // getTotalLength() na dlouhé cestě není zadarmo
  if (w === lastGuideW && h === lastGuideH) return;
  lastGuideW = w; lastGuideH = h;

  guide.setAttribute('width', w);
  guide.setAttribute('height', h);
  guide.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // Méně průchodů = linka řeže text méně často.
  const N = 140, mid = w * .5, amp = w * .40;
  let d = '';
  guideX = []; guideY = []; guideS = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // stejné zaokrouhlení jako v cestě, ať tečka sedí přesně na čáře
    const x = +(mid + Math.sin(t * Math.PI * 2.5) * amp).toFixed(1), y = +(t * h).toFixed(1);
    d += (i ? ' L' : 'M') + x + ' ' + y;
    guideS.push(i ? guideS[i - 1] + Math.hypot(x - guideX[i - 1], y - guideY[i - 1]) : 0);
    guideX.push(x); guideY.push(y);
  }
  guidePath.setAttribute('d', d);
  guideLen = guideS[N];
  guidePath.style.strokeDasharray = guideLen;
  guidePath.style.strokeDashoffset = guideLen;
}

function measure() {
  vw = innerWidth; vh = innerHeight;
  const sy = scrollY;
  if (heroSection) {
    heroTop = heroSection.getBoundingClientRect().top + sy;
    heroRange = Math.max(1, heroSection.offsetHeight - vh);
  }
  if (showcase) {
    showcaseTop = showcase.getBoundingClientRect().top + sy;
    showcaseH = showcase.offsetHeight;
  }
  if (timeline) {
    timelineTop = timeline.getBoundingClientRect().top + sy;
    timelineH = timeline.offsetHeight;
  }
  if (flow) {
    flowTop = flow.getBoundingClientRect().top + sy;
    flowH = flow.offsetHeight;
  }
  sectionTops = sections.map(el => el.getBoundingClientRect().top + sy);
  buildGuide();
}

/* ═══════════ 11. HLAVNÍ SMYČKA ═══════════ */
/* Smyčka běží jen tehdy, když se něco hýbe. Jakmile se scroll, myš i dojezdy
   ustálí, po ~20 klidných snímcích se zastaví (nulová zátěž procesoru a baterie)
   a znovu ji probudí scroll, pohyb myši, dotyk nebo změna velikosti okna. */
let running = false, idleFrames = 0, guideP = -1;
function wake() {
  idleFrames = 0;
  if (!running) { running = true; requestAnimationFrame(frame); }
}

function frame() {
  const sy = scrollY;
  const docH = document.documentElement.scrollHeight - vh;

  if (progressBar) progressBar.style.transform = 'scaleX(' + clamp(sy / (docH || 1)).toFixed(4) + ')';
  if (nav) nav.classList.toggle('stuck', sy > 40);

  // ── kde právě jsem ────────────────────────────────
  if (sections.length) {
    // aktivní je poslední sekce, jejíž vršek už minul třetinu obrazovky
    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sectionTops[i] - sy <= vh * .34) idx = i;
    }
    if (idx !== activeIdx) {
      activeIdx = idx;
      dotLinks.forEach((a, i) => a.classList.toggle('is-on', i === idx));
      const id = dotLinks[idx].getAttribute('href');
      navLinks.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === id));
    }
    if (dotsNav) dotsNav.classList.toggle('on', sy > vh * .6);
  }
  if (toTop) toTop.classList.toggle('on', sy > vh * 1.4);

  mNX = lerp(mNX, mouseNX, .05);
  mNY = lerp(mNY, mouseNY, .05);

  // tlumený scroll — animace doplouvají, i když prst nebo kolečko zastaví
  if (!smoothInit) { sySmooth = sy; smoothInit = true; }
  sySmooth = REDUCED ? sy : lerp(sySmooth, sy, .1);

  if (heroSection) heroP = REDUCED ? 0 : clamp((sySmooth - heroTop) / heroRange);

  // ── 3D prstenec ───────────────────────────────────
  if (ringEl && ringWrap) {
    const rot  = -heroP * 400 + mNX * 14;                 // otáčení scrollem + myš
    const tilt = -5 - heroP * 12 + mNY * 5;
    const back = -heroP * 340;                            // prstenec couvá do dálky
    ringEl.style.transform =
      `translateZ(${back.toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) translateZ(var(--posun, 0px)) rotateY(${rot.toFixed(2)}deg)`;
    ringWrap.style.opacity = (1 - clamp((heroP - .68) / .24)).toFixed(3);

    // krytí desek podle toho, jak jsou natočené k divákovi
    if (Math.abs(rot - lastRot) > .2) {
      lastRot = rot;
      const RAD = Math.PI / 180, KROK = 360 / faces.length;
      faces.forEach((f, i) => {
        const c = Math.cos((i * KROK + rot) * RAD);
        f.style.opacity = c <= 0 ? '0' : (.18 + .82 * Math.pow(c, .7)).toFixed(3);
      });
    }
  }

  // ── text v hero ───────────────────────────────────
  if (heroContent && !REDUCED) {
    const o = 1 - clamp((heroP - .04) / .3);
    heroContent.style.opacity = o;
    heroContent.style.transform = `translateY(${-heroP * 60}px)`;
    heroContent.style.pointerEvents = o < .05 ? 'none' : '';

    if (heroHint) heroHint.style.opacity = 1 - clamp(heroP / .1);

    if (heroReveal) {
      const rv = clamp((heroP - .74) / .2);
      heroReveal.style.opacity = rv;
      heroReveal.style.transform = `translateY(${(1 - easeOut(rv)) * 30}px)`;
      heroReveal.classList.toggle('on', rv > .6);
    }
  }

  // ── showcase — projekty jeden po druhém ───────────
  if (showcase && shots.length && !REDUCED) {
    const top = showcaseTop - sySmooth;                  // pozice vůči oknu
    if (top + showcaseH > 0 && top < vh) {
      const range = Math.max(1, showcaseH - vh);
      const p = clamp((-top) / range);

      // Schodovité mapování: projekt stojí naplno po většinu svého úseku
      // a prostřídá se rychle. Lineární průběh držel dva projekty
      // půl úseku přes sebe a texty se navzájem překrývaly.
      const raw = p * (shots.length - 1);
      const idx = Math.min(Math.floor(raw), shots.length - 2);
      const frac = clamp(raw - idx);
      const DWELL = .72;                                   // podíl úseku bez pohybu
      const pos = idx + clamp((frac - DWELL) / (1 - DWELL));

      shots.forEach((shot, i) => {
        const local = pos - i;
        const dist = Math.abs(local);
        const a = clamp(1 - (dist - .18) / .64);
        shot.style.opacity = a;
        if (a <= .001) { shot.style.visibility = 'hidden'; return; }
        shot.style.visibility = '';
        shot.style.transform = `translateY(${(-local * 70).toFixed(1)}px) scale(${(1 - dist * .05).toFixed(3)})`;

        // popisek mizí mnohem dřív než obrázek, aby se texty nikdy nepřekryly
        const cap = shot.lastElementChild;
        if (cap) {
          cap.style.opacity = clamp(1 - dist / .3);
          cap.style.transform = `translateY(${(-local * 26).toFixed(1)}px)`;
        }
        const img = shot.firstElementChild && shot.firstElementChild.firstElementChild;
        if (img) img.style.transform = `scale(1.06) translateY(${(local * 22).toFixed(1)}px)`;
      });

      if (showcaseFill) showcaseFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
  }

  // ── časová osa procesu ────────────────────────────
  if (timeline && timelineFill) {
    const top = timelineTop - sySmooth;
    if (top + timelineH > -200 && top < vh + 200) {
      const START = vh * .85;
      const p = clamp((START - top) / Math.max(1, timelineH + START - vh * .25));
      timelineFill.style.setProperty('--fill', p.toFixed(4));
      timelineSteps.forEach((s, i) => s.classList.toggle('is-on', p >= (i + .3) / timelineSteps.length));
    }
  }

  // ── vodicí linka ──────────────────────────────────
  if (guideLen && flow) {
    const top = flowTop - sySmooth;
    const p = clamp((vh * .62 - top) / Math.max(1, flowH - vh * .25));
    // Překresluje se jen při znatelné změně (a vždy na krajích). SVG je vysoké
    // tisíce pixelů, takže každé zbytečné přepsání stojí vykreslení celé linky.
    if (Math.abs(p - guideP) > .0003 || ((p === 0 || p === 1) && p !== guideP)) {
      guideP = p;
      guidePath.style.strokeDashoffset = guideLen * (1 - p);
      if (guideDot) {
        if (p > 0 && p < 1) {
          // bod na čáře v dané délce: půlením najdu úsek a dopočítám polohu v něm
          const s = guideLen * p;
          let lo = 0, hi = guideS.length - 1;
          while (hi - lo > 1) { const m = (lo + hi) >> 1; if (guideS[m] <= s) lo = m; else hi = m; }
          const k = (s - guideS[lo]) / ((guideS[hi] - guideS[lo]) || 1);
          const x = guideX[lo] + (guideX[hi] - guideX[lo]) * k, y = guideY[lo] + (guideY[hi] - guideY[lo]) * k;
          guideDot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
          guideDot.style.opacity = 1;
        } else {
          guideDot.style.opacity = 0;
        }
      }
    }
  }

  if (hasHover && !REDUCED && ring) {
    rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18);
    ring.style.transform = `translate(${rx.toFixed(2)}px, ${ry.toFixed(2)}px)`;
  }

  // ustálilo se všechno, co doplouvá? pak smyčku po chvíli uspíme
  const moving = Math.abs(sy - sySmooth) > .05 ||
                 Math.abs(mNX - mouseNX) > .001 || Math.abs(mNY - mouseNY) > .001 ||
                 (hasHover && !REDUCED && (Math.abs(rx - mx) > .1 || Math.abs(ry - my) > .1));
  idleFrames = moving ? 0 : idleFrames + 1;
  if (idleFrames > 20) { running = false; return; }
  requestAnimationFrame(frame);
}

/* Pozice se cachují, takže je nutné přeměřit při každé změně layoutu —
   doloadované obrázky, výměna fontu, otočení telefonu. Bez toho by
   animace jely proti zastaralým souřadnicím. */
let measurePending = false;
function requestMeasure() {
  if (measurePending) return;
  measurePending = true;
  requestAnimationFrame(() => { measurePending = false; measure(); wake(); });
}

addEventListener('resize', requestMeasure, { passive: true });
addEventListener('load', requestMeasure);
if (window.ResizeObserver) new ResizeObserver(requestMeasure).observe(document.body);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestMeasure);

measure();
['scroll', 'mousemove', 'touchstart', 'touchmove', 'resize'].forEach(ev =>
  addEventListener(ev, wake, { passive: true }));
wake();

})();
