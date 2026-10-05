/* ═══════════════════════════════════════════════════
   Kvíz „Co tvoje značka potřebuje?" — 3 otázky, doporučený balíček
   a předvyplněná poptávka. Vanilla JS, nic se neukládá.

   Měření: události posílá stats.js (tenhle skript jen vyvolá
   událost „stats:event"), každá má nejvýš jednu vlastnost.
   ═══════════════════════════════════════════════════ */
(() => {
'use strict';

const panel = document.getElementById('quizPanel');
if (!panel) return;

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hlas = (name, data) => window.dispatchEvent(new CustomEvent('stats:event', { detail: { name, data } }));

/* ───── Otázky ───── */
const OTAZKY = [
  {
    klic: 'faze', text: "Where is your brand right now?",
    moznosti: [
      { id: 'nova',     nadpis: "Just starting out",                  popis: "I do not have a logo or guidelines yet.",          kratce: "just starting out" },
      { id: 'nesedi',   nadpis: "It needs more consistency", popis: "I have a logo, but everything looks different.", kratce: "needs more consistency" },
      { id: 'zavedena', nadpis: "Already established",                    popis: "I want to use it for something new.",           kratce: "already established" }
    ]
  },
  {
    klic: 'misto', text: "Where will you use it first?",
    moznosti: [
      { id: 'online',  nadpis: 'Online',         popis: "Website and social media.",       kratce: 'online' },
      { id: 'produkt', nadpis: "On a product",    popis: "Packaging, labels, print.",       kratce: "on a product" },
      { id: 'kampan',  nadpis: "In a campaign",      popis: "Visuals, advertising, events.",    kratce: "in a campaign" }
    ]
  },
  {
    klic: 'termin', text: "When do you need it?",
    moznosti: [
      { id: 'mesic',  nadpis: "Within a month",       popis: "I have a firm deadline.",          kratce: "within a month" },
      { id: 'tri',    nadpis: "Within three months",   popis: "There is time to prepare properly.", kratce: "within three months" },
      { id: 'zadny',  nadpis: "No rush",        popis: "I am exploring my options.",        kratce: "no rush" }
    ]
  }
];

/* ───── Doporučení ───── */
const BALICKY = {
  logo: {
    nazev: "Logo & essentials", sluzba: "Logo & essentials",
    proc: "Start with a solid foundation: a logo, colours, typography and guidelines for using them. Everything else can build on that."
  },
  identita_nesedi: {
    nazev: "Visual identity", sluzba: "Visual identity",
    proc: "Your brand already exists, but it needs consistency. A visual identity brings your logo, colours, typography and applications into one system, supported by clear guidelines."
  },
  identita_kampan: {
    nazev: "Visual identity", sluzba: "Visual identity",
    proc: "A campaign needs a strong visual foundation. A complete identity gives it a consistent starting point and keeps working long after the campaign ends."
  },
  web: {
    nazev: "Campaign · packaging · web", sluzba: 'Web',
    proc: "Bring your existing brand to the web with a design that fits. This package covers website design, frontend development and ongoing collaboration."
  },
  packaging: {
    nazev: "Campaign · packaging · web", sluzba: 'Packaging',
    proc: "Bring your brand to packaging and print. This package covers packaging design, product ranges and ongoing collaboration."
  },
  kampan: {
    nazev: "Campaign · packaging · web", sluzba: "Campaign",
    proc: "Put your brand to work in a campaign. This package covers the campaign, art direction and ongoing collaboration."
  }
};

function doporuc(o) {
  if (o.faze === 'nesedi') return BALICKY.identita_nesedi;
  if (o.faze === 'nova') return o.misto === 'kampan' ? BALICKY.identita_kampan : BALICKY.logo;
  return o.misto === 'online' ? BALICKY.web : o.misto === 'produkt' ? BALICKY.packaging : BALICKY.kampan;
}

/* ───── Stav a vykreslení ───── */
const odpovedi = {};          // klic otázky → id možnosti
let krok = 0;                 // 0..2 otázky, 3 výsledek
let zacato = false;

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const moznost = (q, id) => q.moznosti.find(m => m.id === id);

function zaznamenej(q, m) {
  if (!zacato) { zacato = true; hlas('quiz_start'); }
  hlas('quiz_answer', { odpoved: q.klic + ' > ' + m.kratce });
}

function vykresli(zamerit) {
  panel.textContent = '';
  const stranka = el('div', 'quiz__step' + (REDUCED ? ' is-still' : ''));
  panel.appendChild(stranka);

  if (krok < OTAZKY.length) {
    const q = OTAZKY[krok];
    const meta = el('div', 'quiz__meta');
    meta.appendChild(el('span', null, '0' + (krok + 1) + ' / 0' + OTAZKY.length));
    const prog = el('span', 'quiz__prog');
    prog.setAttribute('aria-hidden', 'true');
    OTAZKY.forEach((_, i) => prog.appendChild(el('i', i <= krok ? 'on' : '')));
    meta.appendChild(prog);
    stranka.appendChild(meta);

    const h = el('h3', 'quiz__q', q.text);
    h.id = 'quizQ' + krok; h.tabIndex = -1;
    stranka.appendChild(h);

    const skupina = el('div', 'quiz__opts');
    skupina.setAttribute('role', 'group');
    skupina.setAttribute('aria-labelledby', h.id);
    q.moznosti.forEach((m, i) => {
      const b = el('button', 'quiz__opt' + (odpovedi[q.klic] === m.id ? ' is-picked' : ''));
      b.type = 'button';
      b.setAttribute('data-cursor', 'hover');
      b.appendChild(el('b', null, 'ABC'[i]));
      const t = el('span');
      t.appendChild(el('strong', null, m.nadpis));
      t.appendChild(el('em', null, m.popis));
      b.appendChild(t);
      b.addEventListener('click', () => {
        odpovedi[q.klic] = m.id;
        zaznamenej(q, m);
        b.classList.add('is-picked');
        setTimeout(() => { krok++; vykresli(true); }, REDUCED ? 0 : 260);
      });
      skupina.appendChild(b);
    });
    stranka.appendChild(skupina);

    if (krok > 0) {
      const zpet = el('button', 'quiz__back', "← Back");
      zpet.type = 'button';
      zpet.setAttribute('data-cursor', 'hover');
      zpet.addEventListener('click', () => { krok--; vykresli(true); });
      stranka.appendChild(zpet);
    }
    if (zamerit) h.focus({ preventScroll: true });
    return;
  }

  /* výsledek */
  const o = odpovedi;
  const r = doporuc(o);
  hlas('quiz_result', { balicek: r.nazev + (r.nazev.startsWith("Campaign") ? ' > ' + r.sluzba : '') });   // u velkého balíčku rozliší web / obal / kampaň

  stranka.appendChild(el('p', 'quiz__label', "Your recommendation"));
  const h = el('h3', 'quiz__result-name', r.nazev);
  h.tabIndex = -1;
  stranka.appendChild(h);
  stranka.appendChild(el('p', 'quiz__why', r.proc));

  const chips = el('ul', 'quiz__chips');
  OTAZKY.forEach(q => chips.appendChild(el('li', null, moznost(q, o[q.klic]).kratce)));
  stranka.appendChild(chips);

  stranka.appendChild(el('p', 'quiz__note', "This is a starting point. We will agree on the scope and price based on what you need."));

  const akce = el('div', 'quiz__cta');
  const pokracuj = el('a', 'btn btn--primary', "Discuss your project");
  pokracuj.href = '#contact';
  pokracuj.setAttribute('data-cursor', 'hover');
  pokracuj.addEventListener('click', () => predvyplnit(r));
  const cenik = el('a', 'btn btn--ghost', "View pricing");
  cenik.href = '#pricing';
  cenik.setAttribute('data-cursor', 'hover');
  akce.appendChild(pokracuj); akce.appendChild(cenik);
  stranka.appendChild(akce);

  const znovu = el('button', 'quiz__back', "↺ Start again");
  znovu.type = 'button';
  znovu.setAttribute('data-cursor', 'hover');
  znovu.addEventListener('click', () => {
    Object.keys(odpovedi).forEach(k => delete odpovedi[k]);
    krok = 0; zacato = false;
    vykresli(true);
  });
  stranka.appendChild(znovu);
  if (zamerit) h.focus({ preventScroll: true });
}

/* ───── Předvyplnění poptávky ───── */
const PREFIX = "From the website quiz: ";
function predvyplnit(r) {
  const sel = document.querySelector('form.form select[name="Služba"]');
  if (sel && [...sel.options].some(o => o.text === r.sluzba)) {
    sel.value = r.sluzba;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const msg = document.querySelector('form.form textarea[name="Zpráva"]');
  if (msg && (!msg.value.trim() || msg.value.startsWith(PREFIX))) {
    const o = odpovedi;
    msg.value = PREFIX + "brand: " + moznost(OTAZKY[0], o.faze).kratce +
      "; first use: " + moznost(OTAZKY[1], o.misto).kratce +
      "; timing: " + moznost(OTAZKY[2], o.termin).kratce + ". Recommended package: " + r.nazev + '.';
    msg.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

vykresli(false);
})();
