/* ═══════════════════════════════════════════════════
   Drobné efekty: spotlight v portfoliu, „dešifrování" štítků
   a nadpisy, které při scrollu mění váhu písma.

   Zásady: žádná vlastní smyčka (jen události a requestAnimationFrame po
   nutnou dobu), žádné čtení rozměrů při každém pohybu, a při nastavení
   systému „omezit animace" se nespouští nic.
   ═══════════════════════════════════════════════════ */
(() => {
'use strict';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (REDUCED) return;

const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const MYS = matchMedia('(hover: hover) and (pointer: fine)').matches;
const loader = document.getElementById('loader');

/* Co se děje pod úvodním načítáním, nikdo nevidí — efekty počkají, až zmizí. */
function pockejNaStranku(fn) {
  if (!loader || loader.classList.contains('done')) { fn(); return; }
  const mo = new MutationObserver(() => {
    if (!loader.classList.contains('done')) return;
    mo.disconnect();
    setTimeout(fn, 500);
  });
  mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
  setTimeout(() => { mo.disconnect(); fn(); }, 4500);     // pojistka
}

/* ───── 1) Spotlight: portfolio je tlumené a pod kurzorem se rozsvítí ─────
   Jeden fixní překryv s „dírou" v gradientu. Pohyb myši jen přepisuje dvě
   CSS proměnné (jednou za snímek), nic se nepřeměřuje. */
const grid = document.getElementById('grid');
if (grid && MYS) {
  const veil = document.createElement('div');
  veil.className = 'spot-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);

  let sx = 0, sy = 0, docTop = 0, docH = 0, planovano = false;
  const zmer = () => { const r = grid.getBoundingClientRect(); docTop = r.top + scrollY; docH = r.height; };
  const kresli = () => {
    planovano = false;
    const vh = innerHeight;
    const nahore = clamp(docTop - scrollY, 0, vh);
    const dole = clamp(docTop + docH - scrollY, 0, vh);
    veil.style.setProperty('--sx', sx + 'px');
    veil.style.setProperty('--sy', sy + 'px');
    veil.style.clipPath = 'inset(' + nahore + 'px 0 ' + (vh - dole) + 'px 0)';
  };
  const plan = () => { if (!planovano) { planovano = true; requestAnimationFrame(kresli); } };

  grid.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    zmer(); sx = e.clientX; sy = e.clientY; kresli();
    veil.classList.add('on');
  });
  grid.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    sx = e.clientX; sy = e.clientY; plan();
  }, { passive: true });
  grid.addEventListener('pointerleave', () => veil.classList.remove('on'));
  addEventListener('scroll', () => { if (veil.classList.contains('on')) plan(); }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(() => { zmer(); plan(); }).observe(grid);
}

/* ───── 2) „Dešifrování" štítků ─────
   Skutečný text zůstane pro čtečky obrazovky, animuje se jen jeho kopie.
   Štítky jsou v neproporcionálním písmu, takže se šířka řádku nemění. */
const ZNAKY = '01<>/_#+*';
const stitky = $$('.eyebrow, .brands__label').filter(e => e.textContent.trim());
const desifrovat = new IntersectionObserver((zaznamy) => {
  zaznamy.forEach(z => {
    if (!z.isIntersecting) return;
    desifrovat.unobserve(z.target);
    pockejNaStranku(() => spust(z.target));
  });
}, { threshold: .7 });

function spust(el) {
  const cil = el._text, kos = el._kos, n = cil.length;
  const uzel = kos.firstChild;            // textový uzel: přepisuje se jen jeho obsah, levnější než textContent
  const start = performance.now(), DOBA = 650;
  let posledni = 0;
  const krok = (t) => {
    const p = Math.min(1, (t - start) / DOBA);
    if (p < 1 && t - posledni < 45) { requestAnimationFrame(krok); return; }
    posledni = t;
    const hotovo = Math.floor(p * n);
    let s = '';
    for (let i = 0; i < n; i++) {
      const c = cil[i];
      s += (i < hotovo || c === ' ' || c === '—' || c === '·' || c === '?') ? c : ZNAKY[(Math.random() * ZNAKY.length) | 0];
    }
    if (uzel) uzel.data = p < 1 ? s : cil; else kos.textContent = p < 1 ? s : cil;
    if (p < 1) requestAnimationFrame(krok);
  };
  requestAnimationFrame(krok);
}

stitky.forEach(el => {
  const text = el.textContent;
  const ctecka = document.createElement('span');
  ctecka.className = 'vh';
  ctecka.textContent = text;
  const kos = document.createElement('span');
  kos.setAttribute('aria-hidden', 'true');
  kos.textContent = text;
  el.textContent = '';
  el.append(ctecka, kos);
  el._text = text; el._kos = kos;
  desifrovat.observe(el);
});

/* ───── 3) Nadpisy mění váhu písma podle scrollu ─────
   Jen druhý (barevný) řádek nadpisu: je na samostatném řádku a nejtlustší
   verze je právě ta, na kterou je web navržený, takže se při zeštíhlení
   nikdy nezalomí jinak. Váha se mění po krocích a jen u nadpisů, které
   jsou zrovna vidět. */
const nadpisy = $$('.h2 .accent, .page-head__title .accent').map(el => ({ el, top: 0, vidi: false, w: 600 }));
if (nadpisy.length) {
  let planovano = false;
  // Poloha stránky a výška okna se čtou při události scroll (a při měření), ne uvnitř snímku: ve snímku
  // už main.js mezitím přepsal styly a čtení by prohlížeč nutilo přepočítat rozvržení navíc.
  // Při startu se nečte nic, první hodnoty doplní pozorovatel níž.
  let sy = 0, vh = 0;
  const zmer = () => { sy = scrollY; vh = innerHeight; nadpisy.forEach(p => { p.top = p.el.getBoundingClientRect().top + sy; }); };
  const aplikuj = () => {
    planovano = false;
    nadpisy.forEach(p => {
      if (!p.vidi) return;
      const prog = clamp((vh * .98 - (p.top - sy)) / (vh * .55));
      const w = 400 + Math.round(prog * 20) * 10;            // 400 až 600 po deseti
      if (w !== p.w) { p.w = w; p.el.style.fontWeight = w; }
    });
  };
  const plan = () => { if (!planovano) { planovano = true; requestAnimationFrame(aplikuj); } };
  const priScrollu = () => { sy = scrollY; plan(); };
  const io = new IntersectionObserver(zaznamy => {
    zaznamy.forEach(z => { nadpisy.find(p => p.el === z.target).vidi = z.isIntersecting; });
    sy = scrollY; vh = innerHeight;      // pozorovatel se volá po rozvržení, čtení tady nic nestojí
    plan();
  }, { rootMargin: '12% 0px 12% 0px' });
  nadpisy.forEach(p => io.observe(p.el));
  const znovu = () => { zmer(); plan(); };
  addEventListener('scroll', priScrollu, { passive: true });
  addEventListener('resize', znovu, { passive: true });
  addEventListener('load', znovu);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(znovu);
  if (window.ResizeObserver) new ResizeObserver(znovu).observe(document.body);
}
})();
