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

if (!REDUCED) {
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

if (loader) {
  let pct = 0;
  const ticker = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 16 + 6);
    if (loaderBar) loaderBar.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(ticker);
      setTimeout(() => { loader.classList.add('done'); bootHero(); }, 260);
    }
  }, 100);
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
  burger.addEventListener('click', () => {
    const on = menu.classList.toggle('on');
    burger.classList.toggle('on', on);
    document.body.classList.toggle('is-locked', on);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('on'); burger.classList.remove('on');
    document.body.classList.remove('is-locked');
  }));
}

/* ═══════════ 4. PÁS LOG ═══════════ */
const track = $('.marquee__track');
if (track) track.append(...[...track.children].map(c => c.cloneNode(true)));

/* ═══════════ 5. CENY — odhalit najetím / klepnutím ═══════════ */
$$('[data-price]').forEach(plan => {
  const price = $('.plan__price', plan);
  const hint = $('.plan__price-hint', plan);
  if (!price) return;
  if (!hasHover && hint) hint.childNodes[hint.childNodes.length - 1].textContent = 'Klepni pro cenu';

  let timer = 0;
  price.addEventListener('click', () => {
    plan.classList.add('is-shown');
    clearTimeout(timer);
    timer = setTimeout(() => plan.classList.remove('is-shown'), 4000);
  });
});

/* ═══════════ 6. FILTR + LIGHTBOX (jen prace.html) ═══════════ */
const items = $$('.item');
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => b.classList.remove('is-on'));
  btn.classList.add('is-on');
  const f = btn.dataset.filter;
  items.forEach(it => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
}));

const lb = $('#lb');
if (lb && items.length) {
  const lbImg = $('#lbImg'), lbTitle = $('#lbTitle'), lbMeta = $('#lbMeta'),
        lbDesc = $('#lbDesc'), lbCount = $('#lbCount');
  let lbIndex = 0;
  const visibleItems = () => items.filter(i => !i.classList.contains('is-hidden'));

  const paint = el => {
    lbImg.src = el.dataset.img;
    lbImg.alt = el.dataset.title;
    lbTitle.textContent = el.dataset.title;
    lbMeta.textContent = el.dataset.meta;
    lbDesc.textContent = el.dataset.desc;
    if (lbCount) {
      const list = visibleItems();
      lbCount.textContent = `${list.indexOf(el) + 1} / ${list.length}`;
    }
  };
  const open = el => {
    lbIndex = visibleItems().indexOf(el);
    paint(el);
    lb.classList.add('on');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  };
  const step = dir => {
    const list = visibleItems();
    if (!list.length) return;
    lbIndex = (lbIndex + dir + list.length) % list.length;
    paint(list[lbIndex]);
  };
  const close = () => {
    lb.classList.remove('on');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  };

  items.forEach(el => el.addEventListener('click', () => open(el)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/* ═══════════ 7. PŘÍLOHY V POPTÁVCE ═══════════ */
const LIMIT = 10 * 1024 * 1024;
const fileInput = $('#attach');
const fileTxt = $('#fileTxt');
const IDLE_TXT = 'Přiložit vyplněný dotazník nebo podklady';

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

    if (over) fileTxt.textContent = `Přílohy mají ${mb} MB — limit je 10 MB`;
    else if (files.length === 1) fileTxt.textContent = `${files[0].name} · ${mb} MB`;
    else fileTxt.textContent = `${files.length} ${files.length < 5 ? 'soubory' : 'souborů'} · ${mb} MB`;
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
  const paint = () => {
    clock.textContent = new Date().toLocaleTimeString('cs-CZ', {
      timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit'
    });
  };
  paint(); setInterval(paint, 15000);
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

/* vlnovka přes celou šířku — vede od klientů dolů k formuláři */
let lastGuideW = 0, lastGuideH = 0;

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
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = mid + Math.sin(t * Math.PI * 2.5) * amp;
    d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + (t * h).toFixed(1);
  }
  guidePath.setAttribute('d', d);
  guideLen = guidePath.getTotalLength();
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
  buildGuide();
}

/* ═══════════ 11. HLAVNÍ SMYČKA ═══════════ */
function frame() {
  const sy = scrollY;
  const docH = document.documentElement.scrollHeight - vh;

  if (progressBar) progressBar.style.width = (clamp(sy / (docH || 1)) * 100) + '%';
  if (nav) nav.classList.toggle('stuck', sy > 40);

  // ── kde právě jsem ────────────────────────────────
  if (sections.length) {
    // aktivní je poslední sekce, jejíž vršek už minul třetinu obrazovky
    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= vh * .34) idx = i;
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
      `translateZ(${back.toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${rot.toFixed(2)}deg)`;
    ringWrap.style.opacity = (1 - clamp((heroP - .68) / .24)).toFixed(3);

    // krytí desek podle toho, jak jsou natočené k divákovi
    if (Math.abs(rot - lastRot) > .2) {
      lastRot = rot;
      const RAD = Math.PI / 180;
      faces.forEach((f, i) => {
        const c = Math.cos((i * 30 + rot) * RAD);
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

      if (showcaseFill) showcaseFill.style.width = (p * 100).toFixed(1) + '%';
    }
  }

  // ── časová osa procesu ────────────────────────────
  if (timeline && timelineFill) {
    const top = timelineTop - sySmooth;
    if (top + timelineH > -200 && top < vh + 200) {
      const START = vh * .85;
      const p = clamp((START - top) / Math.max(1, timelineH + START - vh * .25));
      timelineFill.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
      timelineSteps.forEach((s, i) => s.classList.toggle('is-on', p >= (i + .3) / timelineSteps.length));
    }
  }

  // ── vodicí linka ──────────────────────────────────
  if (guideLen && flow) {
    const top = flowTop - sySmooth;
    const p = clamp((vh * .62 - top) / Math.max(1, flowH - vh * .25));
    guidePath.style.strokeDashoffset = guideLen * (1 - p);
    if (p > 0 && p < 1) {
      const pt = guidePath.getPointAtLength(guideLen * p);
      guideDot.setAttribute('cx', pt.x);
      guideDot.setAttribute('cy', pt.y);
      guideDot.style.opacity = 1;
    } else {
      guideDot.style.opacity = 0;
    }
  }

  if (hasHover && !REDUCED && ring) {
    rx = lerp(rx, mx, .18); ry = lerp(ry, my, .18);
    ring.style.transform = `translate(${rx.toFixed(2)}px, ${ry.toFixed(2)}px)`;
  }

  requestAnimationFrame(frame);
}

/* Pozice se cachují, takže je nutné přeměřit při každé změně layoutu —
   doloadované obrázky, výměna fontu, otočení telefonu. Bez toho by
   animace jely proti zastaralým souřadnicím. */
let measurePending = false;
function requestMeasure() {
  if (measurePending) return;
  measurePending = true;
  requestAnimationFrame(() => { measurePending = false; measure(); });
}

addEventListener('resize', requestMeasure, { passive: true });
addEventListener('load', requestMeasure);
if (window.ResizeObserver) new ResizeObserver(requestMeasure).observe(document.body);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestMeasure);

measure();
requestAnimationFrame(frame);

})();
