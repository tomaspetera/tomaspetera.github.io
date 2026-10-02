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
    klic: 'faze', text: 'Kde je teď tvoje značka?',
    moznosti: [
      { id: 'nova',     nadpis: 'Teprve vzniká',                  popis: 'Nemám ještě logo ani pravidla.',          kratce: 'teprve vzniká' },
      { id: 'nesedi',   nadpis: 'Existuje, ale nepůsobí jednotně', popis: 'Logo mám, ale vše vypadá pokaždé jinak.', kratce: 'nepůsobí jednotně' },
      { id: 'zavedena', nadpis: 'Je zavedená',                    popis: 'Chci ji využít v něčem novém.',           kratce: 'je zavedená' }
    ]
  },
  {
    klic: 'misto', text: 'Kde se má objevit nejdřív?',
    moznosti: [
      { id: 'online',  nadpis: 'Online',         popis: 'Web a sociální sítě.',       kratce: 'online' },
      { id: 'produkt', nadpis: 'Na produktu',    popis: 'Obal, etiketa, tisk.',       kratce: 'na produktu' },
      { id: 'kampan',  nadpis: 'V kampani',      popis: 'Vizuály, reklama, akce.',    kratce: 'v kampani' }
    ]
  },
  {
    klic: 'termin', text: 'Kdy to potřebuješ mít hotové?',
    moznosti: [
      { id: 'mesic',  nadpis: 'Do měsíce',       popis: 'Mám pevný termín.',          kratce: 'do měsíce' },
      { id: 'tri',    nadpis: 'Do tří měsíců',   popis: 'Je čas to dobře připravit.', kratce: 'do tří měsíců' },
      { id: 'zadny',  nadpis: 'Nespěchá',        popis: 'Zatím se rozhlížím.',        kratce: 'nespěchá' }
    ]
  }
];

/* ───── Doporučení ───── */
const BALICKY = {
  logo: {
    nazev: 'Logo & základ', sluzba: 'Logo a základ',
    proc: 'Začínáš od nuly, a tak dává smysl nejdřív pevný základ: logo, barvy, písmo a pravidla, jak s nimi pracovat. Na tom se pak dá postavit všechno ostatní.'
  },
  identita_nesedi: {
    nazev: 'Vizuální identita', sluzba: 'Vizuální identita',
    proc: 'Značku už máš, jen nepůsobí jako celek. Vizuální identita sjednotí logo, barvy, písmo i jejich použití do jednoho systému a přidá manuál, podle kterého se dá držet.'
  },
  identita_kampan: {
    nazev: 'Vizuální identita', sluzba: 'Vizuální identita',
    proc: 'Kampaň stojí na stabilním vizuálním systému. Proto bych nezačínal samotným logem, ale celou identitou, ze které se kampaň dá odvodit a která vydrží i po ní.'
  },
  web: {
    nazev: 'Kampaň · packaging · web', sluzba: 'Web',
    proc: 'Značku máš a teď ji potřebuješ nasadit na web tak, aby seděla k tomu, co už existuje. Tenhle balíček počítá s webem (design i frontend) a s dlouhodobější spoluprací.'
  },
  packaging: {
    nazev: 'Kampaň · packaging · web', sluzba: 'Packaging',
    proc: 'Značku máš a teď ji potřebuješ dostat na obal nebo do tisku. Tenhle balíček počítá s obalovým designem i s řadami produktů a s dlouhodobější spoluprací.'
  },
  kampan: {
    nazev: 'Kampaň · packaging · web', sluzba: 'Kampaň',
    proc: 'Značku máš a teď ji potřebuješ nasadit do kampaně. Tenhle balíček počítá s kampaní včetně art direction a s dlouhodobější spoluprací.'
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
      const zpet = el('button', 'quiz__back', '← Zpět');
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
  hlas('quiz_result', { balicek: r.nazev + (r.nazev.startsWith('Kampaň') ? ' > ' + r.sluzba : '') });   // u velkého balíčku rozliší web / obal / kampaň

  stranka.appendChild(el('p', 'quiz__label', 'Doporučení'));
  const h = el('h3', 'quiz__result-name', r.nazev);
  h.tabIndex = -1;
  stranka.appendChild(h);
  stranka.appendChild(el('p', 'quiz__why', r.proc));

  const chips = el('ul', 'quiz__chips');
  OTAZKY.forEach(q => chips.appendChild(el('li', null, moznost(q, o[q.klic]).kratce)));
  stranka.appendChild(chips);

  stranka.appendChild(el('p', 'quiz__note', 'Je to orientační. Rozsah a cenu doladíme spolu podle toho, co opravdu potřebuješ.'));

  const akce = el('div', 'quiz__cta');
  const pokracuj = el('a', 'btn btn--primary', 'Probrat projekt');
  pokracuj.href = '#contact';
  pokracuj.setAttribute('data-cursor', 'hover');
  pokracuj.addEventListener('click', () => predvyplnit(r));
  const cenik = el('a', 'btn btn--ghost', 'Podívat se do ceníku');
  cenik.href = '#pricing';
  cenik.setAttribute('data-cursor', 'hover');
  akce.appendChild(pokracuj); akce.appendChild(cenik);
  stranka.appendChild(akce);

  const znovu = el('button', 'quiz__back', '↺ Začít znovu');
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
const PREFIX = 'Z kvízu na webu: ';
function predvyplnit(r) {
  const sel = document.querySelector('form.form select[name="Služba"]');
  if (sel && [...sel.options].some(o => o.text === r.sluzba)) {
    sel.value = r.sluzba;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const msg = document.querySelector('form.form textarea[name="Zpráva"]');
  if (msg && (!msg.value.trim() || msg.value.startsWith(PREFIX))) {
    const o = odpovedi;
    msg.value = PREFIX + 'značka ' + moznost(OTAZKY[0], o.faze).kratce +
      '; nejdřív se má objevit ' + moznost(OTAZKY[1], o.misto).kratce +
      '; termín: ' + moznost(OTAZKY[2], o.termin).kratce + '. Doporučený balíček: ' + r.nazev + '.';
    msg.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

vykresli(false);
})();
