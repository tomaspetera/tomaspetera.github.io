/* ═══════════════════════════════════════════════════
   Měření návštěvnosti a chování — bez cookies a bez osobních údajů
   Vanilla JS, žádné knihovny.

   Sám o sobě nic neodesílá: dokud dole není vyplněné PROVIDER, nic se
   nenačítá, nic se neposlouchá a nic se neodesílá. Zapnutí = vyplnit jednu
   konstantu a zvýšit číslo ?v= u tohoto souboru ve všech HTML stránkách webu.
   ═══════════════════════════════════════════════════ */
(() => {
'use strict';

/* ───── 1) NASTAVENÍ — jediné místo, které se mění ─────
   Po založení účtu v nástroji opiš údaje z jeho „tracking code".
   Příklady podle toho, který nástroj zvolíš:

   Umami
     const PROVIDER = {
       src: 'https://cloud.umami.is/script.js',        // adresa skriptu z administrace
       attrs: { 'data-website-id': 'TVOJE-ID', 'data-domains': 'tomaspetera.cz' }
     };

   GoatCounter
     const PROVIDER = {
       src: '//gc.zgo.at/count.js',
       attrs: { 'data-goatcounter': 'https://TVUJKOD.goatcounter.com/count' }
     };

   Plausible: použij snippet z jeho administrace (src + atributy), případně
   ho nech přizpůsobit. */
const PROVIDER = {
  src: 'https://cloud.umami.is/script.js',
  attrs: {
    'data-website-id': '330b82ef-3ae2-42a8-b45b-fc11f5c02b92',
    'data-domains': 'tomaspetera.cz',
    'data-do-not-track': 'true',
    'data-performance': 'true'      // skutečná rychlost u návštěvníků (Core Web Vitals), jedno hlášení na načtení stránky
  }
};

/* ───── Rozpočet událostí ─────
   Umami počítá událost jako 1 + 1 za každou uloženou vlastnost (bezplatný
   tarif = 100 000 měsíčně). Proto má každá událost níž nejvýš jednu vlastnost,
   některé žádnou. Při přidávání dalších to drž. Chyby (js_error) jsou omezené
   na 3 za načtení stránky. */

/* ───── 2) Vypnutí měření pro mě ─────
   Vyloučení podle IP je v Umami placené, proto si měření vypínáš v každém svém
   prohlížeči sám: otevři tomaspetera.cz/?nemerit (zpátky zapneš přes ?merit).
   Příznak si pamatuje prohlížeč (localStorage, stejný klíč čte i skript Umami),
   takže to platí jen pro ten jeden prohlížeč — na telefonu to udělej zvlášť. */
const KLIC_VYPNUTO = 'umami.disabled';
let uloziste = null;
try { uloziste = window.localStorage; } catch (e) { /* zablokované úložiště */ }

function oznameni(text) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.textContent = text;
  el.style.cssText = 'position:fixed;left:50%;bottom:1.5rem;transform:translateX(-50%);z-index:10000;' +
    'max-width:calc(100vw - 2rem);padding:.7rem 1.2rem;border-radius:999px;font-size:.8125rem;line-height:1.35;' +
    'text-align:center;background:#0a0810;color:#fff;border:1px solid rgba(168,85,247,.5);' +
    'box-shadow:0 8px 32px rgba(0,0,0,.5)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

const dotaz = new URLSearchParams(location.search);
const prepinac = dotaz.has('nemerit') ? 'vypnuto' : dotaz.has('merit') ? 'zapnuto' : '';
if (prepinac) {
  try {
    if (!uloziste) throw new Error('bez úložiště');
    if (prepinac === 'vypnuto') uloziste.setItem(KLIC_VYPNUTO, '1'); else uloziste.removeItem(KLIC_VYPNUTO);
    oznameni(prepinac === 'vypnuto'
      ? 'Měření je v tomto prohlížeči vypnuté. Zpět zapneš přes ?merit.'
      : 'Měření je v tomto prohlížeči zapnuté.');
  } catch (e) {
    oznameni('Tento prohlížeč nedovolí nastavení uložit, měření se nezměnilo.');
  }
  // z adresy příznak odstraníme, ať se nekopíruje dál
  ['nemerit', 'merit'].forEach(k => dotaz.delete(k));
  const zbytek = dotaz.toString();
  try { history.replaceState(null, '', location.pathname + (zbytek ? '?' + zbytek : '') + location.hash); } catch (e) { /* nic */ }
}
let VYPNUTO = false;
try { VYPNUTO = !!(uloziste && uloziste.getItem(KLIC_VYPNUTO)); } catch (e) { /* nic */ }

/* ───── 3) Kdy se měří ───── */
const HOSTY = ['tomaspetera.cz', 'www.tomaspetera.cz'];       // jen ostrý web, ne lokální náhledy
const DNT = navigator.doNotTrack === '1' || window.doNotTrack === '1';   // respektujeme „Do Not Track"
const TEST = typeof window.__statsTest === 'function';          // háček pro automatické testy
if (VYPNUTO || DNT || !(TEST || (PROVIDER && HOSTY.includes(location.hostname)))) return;

if (PROVIDER && !TEST) {
  const s = document.createElement('script');
  s.async = true;
  s.src = PROVIDER.src;
  Object.entries(PROVIDER.attrs || {}).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

/* ───── 4) Odesílání: jedno místo pro všechny nástroje ───── */
const fronta = [];
let hlidam = false;

function odeslat(nazev, data) {
  try {
    if (TEST) { window.__statsTest(nazev, data); return true; }
    if (window.umami && typeof window.umami.track === 'function') { window.umami.track(nazev, data); return true; }
    if (typeof window.plausible === 'function') { window.plausible(nazev, { props: data }); return true; }
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      // GoatCounter neumí vlastnosti událostí, proto je přibalíme do názvu
      window.goatcounter.count({
        path: nazev + (data ? ':' + Object.values(data).join(':') : ''),
        title: nazev,
        event: true
      });
      return true;
    }
  } catch (e) { /* měření nikdy nesmí rozbít web */ }
  return false;
}

function track(nazev, data) {
  if (odeslat(nazev, data)) return;
  // skript nástroje ještě není načtený — události chvíli počkají (max ~16 s)
  fronta.push([nazev, data]);
  if (hlidam) return;
  hlidam = true;
  let pokusy = 0;
  const t = setInterval(() => {
    while (fronta.length && odeslat(fronta[0][0], fronta[0][1])) fronta.shift();
    if (!fronta.length || ++pokusy > 40) { clearInterval(t); hlidam = false; fronta.length = 0; }
  }, 400);
}

const videno = new Set();
const jednou = (klic, nazev, data) => {
  if (videno.has(klic)) return;
  videno.add(klic);
  track(nazev, data);
};
const text = el => (el && el.textContent || '').replace(/\s+/g, ' ').trim();

/* ───── 5) Které části stránky lidé dojedou ─────
   Sekce, ne procenta: showcase je 6× vyšší než obrazovka, takže
   „75 % stránky" by o tvém obsahu skoro nic neřeklo. */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(zaznamy => zaznamy.forEach(z => {
    if (!z.isIntersecting) return;
    jednou('sekce:' + z.target.id, 'section_view', { sekce: z.target.id });
    io.unobserve(z.target);
  }), { rootMargin: '-45% 0px -45% 0px', threshold: 0 });     // sekce se počítá, když protne střed obrazovky
  ['about', 'showcase', 'services', 'process', 'pricing', 'quiz', 'reference', 'contact', 'work', 'thanks']
    .forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
}

/* Kolik z vybraných projektů v showcase lidé skutečně projdou */
const shots = [...document.querySelectorAll('.showcase .shot')];
if (shots.length && 'MutationObserver' in window) {
  const mo = new MutationObserver(zmeny => zmeny.forEach(z => {
    const s = z.target;
    if (parseFloat(s.style.opacity) > 0.9 && s.style.visibility !== 'hidden') {
      const i = shots.indexOf(s);
      jednou('shot:' + i, 'showcase_view', { projekt: text(s.querySelector('h3')) });
    }
  }));
  shots.forEach(s => mo.observe(s, { attributes: true, attributeFilter: ['style'] }));
}

/* ───── 6) Kliknutí: kam lidé míří ───── */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a || a.classList.contains('nav__logo')) return;
  const href = a.getAttribute('href') || '';

  if (href.startsWith('mailto:')) return track('contact_click', { typ: 'email' });
  if (href.startsWith('tel:')) return track('contact_click', { typ: 'telefon' });
  if (/linkedin\.com/i.test(href)) return track('contact_click', { typ: 'linkedin' });
  if (/calendar\.google\.com\/calendar\/appointments/.test(href)) return track('booking_click', { kde: a.closest('.thanks') ? 'dekuji' : 'poptavka' });
  if (/assets\/dotaznik\//.test(href)) return track('dotaznik_download', { format: /\.pdf$/i.test(href) ? 'pdf' : 'docx' });
  if (a.dataset.ext) {
    // odkaz z projektu ven (živý web, Instagram): v showcase i v detailu projektu
    const nazev = a.closest('.shot') ? a.closest('.shot').querySelector('h3') : document.getElementById('lbTitle');
    return track('project_link', { projekt: text(nazev) + ' > ' + a.dataset.ext });
  }

  const kde =
    a.closest('.hero__cta') || a.closest('.hero__reveal') ? 'hero' :
    a.closest('.nav') ? 'hlavicka' :
    a.closest('#menu') ? 'menu' :
    a.closest('#dots') ? 'tecky' :
    a.closest('.plan') ? 'cenik' :
    a.closest('.showcase__foot') ? 'showcase' :
    a.closest('.shot') ? 'showcase-projekt' :
    a.closest('.quiz') ? 'kviz' :
    a.closest('.contact-cta') ? 'konec-portfolia' :
    a.closest('.thanks__cta') ? 'dekuji' :
    a.closest('.footer') ? 'paticka' : null;
  if (!kde) return;

  // Jedna vlastnost „kde > kam": "#contact" → contact, "prace.html#lekiq" → lekiq.
  // U ceníku a projektů v showcase místo cíle jméno balíčku / projektu.
  let kam = href.replace(/^.*[#/]/, '').replace(/\.html$/, '') || href;
  if (kde === 'cenik') kam = text(a.closest('.plan').querySelector('h3'));
  if (kde === 'showcase-projekt') kam = text(a.closest('.shot').querySelector('h3'));
  track('cta_click', { cil: kde + ' > ' + kam });
});

/* Události od ostatních skriptů webu (kvíz): posílají je přes „stats:event", odesílání zůstává na jednom místě */
window.addEventListener('stats:event', e => {
  const d = e.detail;
  if (d && typeof d.name === 'string') track(d.name, d.data);
});

/* Kopírování kontaktu: část lidí e-mail ani telefon neklikne, jen je zkopíruje */
document.addEventListener('copy', () => {
  const pole = document.activeElement;
  if (pole && /^(INPUT|TEXTAREA)$/.test(pole.tagName)) return;        // vlastní text z formuláře neměříme
  const vyber = String(window.getSelection()).replace(/\s+/g, '');
  if (/^[^@]+@[^@]+\.[a-z]{2,}$/i.test(vyber)) jednou('kopie:email', 'contact_copy', { typ: 'email' });
  else if (/^\+?\d{9,15}$/.test(vyber)) jednou('kopie:telefon', 'contact_copy', { typ: 'telefon' });
});

/* ───── 7) Ceník: kdo si cenu opravdu odkryl ─────
   Klíčový údaj, protože ceny jsou záměrně rozmazané. Počítá se až po 350 ms
   nad kartou (ne průjezd myší) nebo po klepnutí na cenu. */
document.querySelectorAll('[data-price]').forEach(karta => {
  const plan = text(karta.querySelector('h3'));
  let casovac = 0;
  const odkryto = () => jednou('cena:' + plan, 'price_reveal', { plan });
  karta.addEventListener('mouseenter', () => {
    if (matchMedia('(hover: hover)').matches) casovac = setTimeout(odkryto, 350);
  });
  karta.addEventListener('mouseleave', () => clearTimeout(casovac));
  const cena = karta.querySelector('.plan__price');
  if (cena) cena.addEventListener('click', odkryto);
});

/* ───── 8) Portfolio: které projekty a filtry lidi zajímají ───── */
document.querySelectorAll('.filter').forEach(b =>
  b.addEventListener('click', () => track('filter_use', { filtr: b.dataset.filter })));

const lb = document.getElementById('lb');
const lbTitle = document.getElementById('lbTitle');
if (lb && lbTitle && 'MutationObserver' in window) {
  let posledni = '';
  const zmena = () => {
    if (!lb.classList.contains('on')) { posledni = ''; return; }
    const nazev = text(lbTitle);
    if (nazev && nazev !== posledni) { posledni = nazev; track('project_open', { projekt: nazev }); }
  };
  const mo = new MutationObserver(zmena);
  mo.observe(lb, { attributes: true, attributeFilter: ['class'] });
  mo.observe(lbTitle, { childList: true, characterData: true, subtree: true });
}

/* ───── 9) Formulář: kde lidé váhají ───── */
const form = document.querySelector('form.form');
if (form) {
  form.addEventListener('focusin', () => jednou('form-start', 'form_start'));
  const priloha = document.getElementById('attach');
  if (priloha) priloha.addEventListener('change', () => {
    const soubory = [...priloha.files];
    if (!soubory.length) return;
    track('form_attach', { pocet: soubory.length });
  });
  // posloucháme až po main.js, takže vidíme, jestli odeslání zablokoval (příliš velké přílohy)
  form.addEventListener('submit', e => {
    if (form.dataset.emailVerification === 'true') return; // Sent event comes from the server-confirmed flow.
    if (e.defaultPrevented) return track('form_blocked');             // jediný důvod: příliš velké přílohy
    const sluzba = form.elements['Služba'];
    track('form_submit', { sluzba: sluzba ? sluzba.value : '' });
  });
}

/* ───── 10) Skutečný zájem: čas strávený aktivně ─────
   Jen když je záložka vidět a návštěvník v posledních 10 s něco udělal
   (scroll, myš, klávesa, dotyk). Otevřená, ale opuštěná záložka se nepočítá. */
let posledniAkce = Date.now();
let aktivne = 0;
['scroll', 'mousemove', 'keydown', 'touchstart', 'click'].forEach(ev =>
  addEventListener(ev, () => { posledniAkce = Date.now(); }, { passive: true }));
setInterval(() => {
  if (document.visibilityState !== 'visible' || Date.now() - posledniAkce > 10000) return;
  aktivne += 5;
  [30, 120].forEach(sek => { if (aktivne >= sek) jednou('cas:' + sek, 'engaged_' + sek + 's'); });
}, 5000);

/* ───── 11) Chyby ve stránce ─────
   Dozvíš se, že se web na něčím zařízení rozbil. Jen soubory z tohoto webu
   (ne rozšíření prohlížeče ani cizí skripty), nejvýš 3 hlášení na načtení stránky. */
let chyb = 0;
const moje = url => String(url || '').startsWith(location.origin);
const kratce = url => String(url).replace(location.origin + '/', '').split('?')[0];
const nahlasChybu = popis => { if (++chyb <= 3) track('js_error', { kde: String(popis).slice(0, 120) }); };

window.addEventListener('error', e => {
  const cil = e.target;
  if (cil && cil !== window && cil.tagName) {                         // nenačtený obrázek, skript nebo styl
    const url = cil.currentSrc || cil.src || cil.href;
    if (moje(url)) nahlasChybu('nenačteno: ' + kratce(url));
  } else if (moje(e.filename)) {
    nahlasChybu(String(e.message || 'chyba').replace(/^Uncaught (Error: )?/, '') + ' @ ' + kratce(e.filename) + ':' + (e.lineno || 0));
  }
}, true);
window.addEventListener('unhandledrejection', e => {
  const duvod = e.reason;
  if (duvod && String(duvod.stack || '').includes(location.origin)) nahlasChybu('promise: ' + (duvod.message || duvod));
});

})();
